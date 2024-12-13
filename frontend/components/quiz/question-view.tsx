'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ChevronRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Question, QuestionResponse, QuestionWithOptions } from "@/store/quiz-store";

interface QuestionViewProps {
  question: Question;
  response?: QuestionResponse;
  onSubmit: (response: string) => void;
  onNext?: () => void;
  isLast?: boolean;
}

export function QuestionView({ question, response, onSubmit, onNext, isLast }: QuestionViewProps) {
  const [answer, setAnswer] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);
  const hasResponse = !!response;

  const handleSubmit = () => {
    if (!answer.trim()) return;
    onSubmit(answer);
    setSubmitted(true);
  };

  const handleNext = () => {
    setAnswer('');
    setSubmitted(false);
    onNext?.();
  };

  const isMultipleChoice = 'options' in question;

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          {question.content}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Answer Input Section */}
        {!hasResponse && (
          isMultipleChoice ? (
            <RadioGroup
              onValueChange={setAnswer}
              className="space-y-3"
              disabled={submitted}
            >
              {(question as QuestionWithOptions).options.map((option) => (
                <div 
                  key={option.id}
                  className="flex items-center space-x-2"
                >
                  <RadioGroupItem 
                    value={option.content} 
                    id={option.id}
                  />
                  <Label htmlFor={option.id}>{option.content}</Label>
                </div>
              ))}
            </RadioGroup>
          ) : (
            <Textarea
              placeholder="Type your answer here..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={submitted}
              className="min-h-[100px]"
            />
          )
        )}

        {/* Feedback Section */}
        {hasResponse && (
          <div className="space-y-4">
            <Alert 
              variant={response.is_correct ? "success" : "destructive"}
              className="flex items-start gap-2"
            >
              <AlertCircle className="h-4 w-4 mt-1" />
              <AlertDescription>
                <div className="font-medium mb-1">
                  {response.is_correct ? "Correct!" : "Incorrect"}
                </div>
                <div className="text-sm">Your answer: {response.response}</div>
              </AlertDescription>
            </Alert>

            <div className="bg-muted rounded-lg p-4">
              <div className="font-medium mb-2">Explanation</div>
              <div className="text-sm text-muted-foreground">
                {question.explanation}
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-end gap-2">
        {!hasResponse && (
          <Button
            onClick={handleSubmit}
            disabled={!answer.trim() || submitted}
          >
            Submit Answer
          </Button>
        )}
        {hasResponse && onNext && (
          <Button 
            onClick={handleNext}
            className="gap-2"
          >
            {isLast ? 'Complete Quiz' : 'Next Question'}
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}