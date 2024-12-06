from datetime import datetime, timedelta
from typing import Dict, List, Optional
from uuid import UUID
from sqlalchemy import func, case, text
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException

from ...core.logger import setup_logger, log_error
from ...models.quiz import (
    Quiz, Question, QuestionConcept, QuizAttempt, 
    QuestionResponse, MultipleChoiceOption, SubjectiveAnswer
)
from ...schemas.quiz import FileQuizStats, QuizAnalytics, QuizProgressStats

logger = setup_logger(__name__)

class AnalyticsService:
    def __init__(self, db: Session):
        self.db = db

    async def get_file_quiz_stats(self, file_id: UUID) -> FileQuizStats:
        """Get quiz statistics for a file"""
        logger.info(f"Generating quiz stats for file {file_id}")
        
        try:
            result = await self.db.execute(text("""
                WITH quiz_stats AS (
                    SELECT 
                        q.id as quiz_id,
                        COUNT(DISTINCT qa.id) as attempts,
                        COUNT(DISTINCT qa.user_id) as unique_users,
                        AVG(qa.score) as avg_score,
                        SUM(qr.time_taken) as total_time
                    FROM quizzes q
                    LEFT JOIN quiz_attempts qa ON q.id = qa.quiz_id
                    LEFT JOIN question_responses qr ON qa.id = qr.attempt_id
                    WHERE q.file_id = :file_id
                    GROUP BY q.id
                )
                SELECT 
                    f.id as file_id,
                    f.filename,
                    COUNT(DISTINCT q.id) as total_quizzes,
                    COUNT(DISTINCT que.id) as total_questions,
                    SUM(qs.attempts) as total_attempts,
                    AVG(qs.avg_score) as average_score,
                    SUM(qs.unique_users) as unique_participants,
                    SUM(qs.total_time) as total_time_spent,
                    COUNT(DISTINCT qc.concept) as unique_concepts,
                    SUM(CASE WHEN que.question_type = 'multiple_choice' THEN 1 ELSE 0 END) as mc_count,
                    SUM(CASE WHEN que.question_type = 'subjective' THEN 1 ELSE 0 END) as subj_count,
                    AVG(CASE WHEN qr.is_correct IS NOT NULL THEN qr.is_correct::int ELSE NULL END) * 100 as success_rate
                FROM files f
                LEFT JOIN quizzes q ON f.id = q.file_id
                LEFT JOIN questions que ON q.id = que.quiz_id
                LEFT JOIN quiz_stats qs ON q.id = qs.quiz_id
                LEFT JOIN question_concepts qc ON que.id = qc.question_id
                LEFT JOIN question_responses qr ON que.id = qr.question_id
                WHERE f.id = :file_id AND f.is_deleted = false
                GROUP BY f.id, f.filename
            """))

            stats = result.fetchone()
            if not stats:
                logger.warning(f"No quiz stats found for file {file_id}")
                raise HTTPException(status_code=404, detail="File not found or has no quizzes")

            return FileQuizStats(
                file_id=file_id,
                filename=stats.filename,
                total_quizzes=stats.total_quizzes or 0,
                total_questions=stats.total_questions or 0,
                total_attempts=stats.total_attempts or 0,
                average_score=stats.average_score,
                unique_participants=stats.unique_participants or 0,
                total_time_spent=stats.total_time_spent or 0,
                unique_concepts=stats.unique_concepts or 0,
                multiple_choice_count=stats.mc_count or 0,
                subjective_count=stats.subj_count or 0,
                success_rate=stats.success_rate or 0.0
            )
            
        except SQLAlchemyError as e:
            log_error(logger, e, {
                'file_id': str(file_id),
                'operation': 'get_file_quiz_stats'
            })
            raise HTTPException(status_code=500, detail="Failed to generate quiz statistics")

    async def get_quiz_analytics(self, quiz_id: UUID) -> QuizAnalytics:
        """Get detailed analytics for a quiz"""
        logger.info(f"Generating detailed analytics for quiz {quiz_id}")
        
        try:
            # Concept progress
            concept_progress = await self.get_concept_progress(quiz_id)
            
            # Question analytics
            question_analytics = await self.get_question_analytics(quiz_id)
            
            # Overall statistics
            stats = await self.get_overall_quiz_stats(quiz_id)
            
            return QuizAnalytics(
                total_attempts=stats['total_attempts'],
                average_score=stats['average_score'],
                completion_rate=stats['completion_rate'],
                average_time_per_question=stats['avg_time_per_question'],
                concept_progress=concept_progress,
                question_analytics=question_analytics
            )
            
        except SQLAlchemyError as e:
            log_error(logger, e, {
                'quiz_id': str(quiz_id),
                'operation': 'get_quiz_analytics'
            })
            raise HTTPException(status_code=500, detail="Failed to generate quiz analytics")

    async def get_quiz_progress_stats(self, quiz_id: UUID, user_id: Optional[UUID] = None) -> QuizProgressStats:
        """Get quiz progress statistics over time"""
        logger.info(f"Generating progress stats for quiz {quiz_id}")
        
        try:
            # Base query for attempts
            query = self.db.query(QuizAttempt).filter(QuizAttempt.quiz_id == quiz_id)
            if user_id:
                query = query.filter(QuizAttempt.user_id == user_id)
            
            # Get attempt data over time
            attempts_over_time = await self._get_attempts_over_time(query)
            
            # Get score progression
            score_progression = await self._get_score_progression(query)
            
            # Get concept mastery trend
            concept_mastery = await self._get_concept_mastery_trend(quiz_id, user_id)
            
            # Get common mistakes
            common_mistakes = await self._get_common_mistakes(quiz_id, user_id)
            
            return QuizProgressStats(
                attempts_over_time=attempts_over_time,
                score_progression=score_progression,
                concept_mastery_trend=concept_mastery,
                common_mistakes=common_mistakes
            )
            
        except SQLAlchemyError as e:
            log_error(logger, e, {
                'quiz_id': str(quiz_id),
                'user_id': str(user_id) if user_id else None,
                'operation': 'get_quiz_progress_stats'
            })
            raise HTTPException(status_code=500, detail="Failed to generate progress statistics")

    # Helper methods for analytics calculations
    async def get_concept_progress(self, quiz_id: UUID) -> Dict:
        """Get progress per concept"""
        result = await self.db.execute(text("""
            SELECT 
                qc.concept,
                AVG(CASE WHEN qr.is_correct IS NOT NULL THEN qr.is_correct::int ELSE NULL END) * 100 as success_rate,
                COUNT(qr.id) as attempts,
                MAX(qr.created_at) as last_attempt
            FROM questions q
            JOIN question_concepts qc ON q.id = qc.question_id
            LEFT JOIN question_responses qr ON q.id = qr.question_id
            WHERE q.quiz_id = :quiz_id
            GROUP BY qc.concept
        """), {'quiz_id': str(quiz_id)})
        
        return {row.concept: {
            'success_rate': row.success_rate or 0.0,
            'attempts': row.attempts,
            'last_attempt': row.last_attempt
        } for row in result}

    async def get_question_analytics(self, quiz_id: UUID) -> List[Dict]:
        """Get analytics per question"""
        result = await self.db.execute(text("""
            SELECT 
                q.id,
                q.content,
                AVG(qr.time_taken) as avg_time,
                COUNT(qr.id) as attempts,
                AVG(CASE WHEN qr.is_correct IS NOT NULL THEN qr.is_correct::int ELSE NULL END) * 100 as success_rate,
                AVG(qr.confidence_score) as avg_confidence
            FROM questions q
            LEFT JOIN question_responses qr ON q.id = qr.question_id
            WHERE q.quiz_id = :quiz_id AND q.is_active = true
            GROUP BY q.id, q.content
        """), {'quiz_id': str(quiz_id)})
        
        return [{
            'id': row.id,
            'content': row.content,
            'success_rate': row.success_rate or 0.0,
            'average_time': row.avg_time or 0,
            'total_attempts': row.attempts,
            'confidence_score': row.avg_confidence
        } for row in result]

    async def get_overall_quiz_stats(self, quiz_id: UUID) -> Dict:
        """Get overall quiz statistics"""
        result = await self.db.execute(text("""
            SELECT 
                COUNT(DISTINCT qa.id) as total_attempts,
                AVG(qa.score) as average_score,
                COUNT(DISTINCT qa.user_id) * 100.0 / 
                    (SELECT COUNT(DISTINCT user_id) FROM quiz_attempts) as completion_rate,
                AVG(qr.time_taken) as avg_time_per_question
            FROM quiz_attempts qa
            LEFT JOIN question_responses qr ON qa.id = qr.attempt_id
            WHERE qa.quiz_id = :quiz_id AND qa.status = 'completed'
        """), {'quiz_id': str(quiz_id)})
        
        row = result.fetchone()
        return {
            'total_attempts': row.total_attempts or 0,
            'average_score': row.average_score or 0.0,
            'completion_rate': row.completion_rate or 0.0,
            'avg_time_per_question': row.avg_time_per_question or 0
        }

    async def _get_attempts_over_time(self, query) -> Dict[str, int]:
        """Get number of attempts over time"""
        result = await query.with_entities(
            func.date_trunc('day', QuizAttempt.created_at),
            func.count(QuizAttempt.id)
        ).group_by(func.date_trunc('day', QuizAttempt.created_at)).all()
        
        return {str(date): count for date, count in result}

    async def _get_score_progression(self, query) -> Dict[str, float]:
        """Get score progression over time"""
        result = await query.with_entities(
            func.date_trunc('day', QuizAttempt.created_at),
            func.avg(QuizAttempt.score)
        ).group_by(func.date_trunc('day', QuizAttempt.created_at)).all()
        
        return {str(date): float(avg) for date, avg in result}

    async def _get_concept_mastery_trend(self, quiz_id: UUID, user_id: Optional[UUID]) -> Dict[str, Dict[str, float]]:
        """Get concept mastery trend over time"""
        query = text("""
            WITH daily_concept_stats AS (
                SELECT 
                    DATE_TRUNC('day', qr.created_at) as date,
                    qc.concept,
                    AVG(CASE WHEN qr.is_correct IS NOT NULL THEN qr.is_correct::int ELSE NULL END) * 100 as mastery
                FROM questions q
                JOIN question_concepts qc ON q.id = qc.question_id
                JOIN question_responses qr ON q.id = qr.question_id
                WHERE q.quiz_id = :quiz_id
                    AND (:user_id::uuid IS NULL OR qr.user_id = :user_id)
                GROUP BY DATE_TRUNC('day', qr.created_at), qc.concept
            )
            SELECT *
            FROM daily_concept_stats
            ORDER BY date
        """)
        
        result = await self.db.execute(query, {
            'quiz_id': str(quiz_id),
            'user_id': str(user_id) if user_id else None
        })
        
        trend = {}
        for row in result:
            date_str = str(row.date)
            if date_str not in trend:
                trend[date_str] = {}
            trend[date_str][row.concept] = row.mastery
        
        return trend

    async def _get_common_mistakes(self, quiz_id: UUID, user_id: Optional[UUID]) -> List[Dict[str, str]]:
        """Get common mistakes for incorrect responses"""
        query = text("""
            SELECT 
                q.content as question,
                qr.response as answer,
                COUNT(*) as frequency
            FROM questions q
            JOIN question_responses qr ON q.id = qr.question_id
            WHERE q.quiz_id = :quiz_id
                AND qr.is_correct = false
                AND (:user_id::uuid IS NULL OR qr.user_id = :user_id)
            GROUP BY q.content, qr.response
            ORDER BY frequency DESC
            LIMIT 10
        """)
        
        result = await self.db.execute(query, {
            'quiz_id': str(quiz_id),
            'user_id': str(user_id) if user_id else None
        })
        
        return [{'question': row.question, 'wrong_answer': row.answer} for row in result]