import asyncio
from typing import Dict, Callable, Any, Optional, Coroutine
import logging
from datetime import datetime
from uuid import UUID

from app.models.user import User
from app.services.notification_service import notification_manager

logger = logging.getLogger(__name__)

class TaskManager:
    def __init__(self):
        self.tasks: Dict[str, asyncio.Task] = {}
        self.results: Dict[str, Any] = {}

    async def start_task(
        self,
        task_id: str,
        coroutine: Coroutine,
        user_id: UUID,
        on_complete: Optional[Callable] = None
    ):
        """Start a background task"""
        
        async def wrapped_task():
            try:
                # Execute the task
                result = await coroutine
                self.results[task_id] = result
                
                # Send completion notification
                await notification_manager.send_notification(
                    user_id,
                    {
                        "type": "task_complete",
                        "task_id": task_id,
                        "status": "completed",
                        "result": result,
                        "timestamp": datetime.utcnow().isoformat()
                    }
                )
                
                # Call completion callback if provided
                if on_complete:
                    await on_complete(result)
                    
            except Exception as e:
                logger.error(f"Task {task_id} failed: {str(e)}")
                # Send error notification
                await notification_manager.send_notification(
                    user_id,
                    {
                        "type": "task_error",
                        "task_id": task_id,
                        "error": str(e),
                        "timestamp": datetime.utcnow().isoformat()
                    }
                )
            finally:
                # Cleanup
                if task_id in self.tasks:
                    del self.tasks[task_id]
                if task_id in self.results:
                    del self.results[task_id]

        # Create and store the task
        task = asyncio.create_task(wrapped_task())
        self.tasks[task_id] = task
        
        return task_id

    def get_task_status(self, task_id: str) -> dict:
        """Get the status of a task"""
        if task_id in self.tasks:
            task = self.tasks[task_id]
            if task.done():
                status = "completed" if not task.exception() else "failed"
            else:
                status = "running"
            
            return {
                "status": status,
                "result": self.results.get(task_id),
                "error": str(task.exception()) if task.done() and task.exception() else None
            }
            
        return {"status": "not_found"}

    def cancel_task(self, task_id: str):
        """Cancel a running task"""
        if task_id in self.tasks:
            self.tasks[task_id].cancel()
            return True
        return False

# Global task manager instance
task_manager = TaskManager()