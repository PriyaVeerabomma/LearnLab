import json
from typing import List
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from openai import OpenAI
from openai.types.chat import ChatCompletionChunk, ChatCompletionMessageParam
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.chat.models import ChatRequest, Message
from app.core.config import settings
from app.core.logger import setup_logger, log_error

router = APIRouter()
logger = setup_logger(__name__)

client = OpenAI(api_key=settings.OPENAI_API_KEY)

def convert_to_chat_messages(messages: List[Message]) -> List[ChatCompletionMessageParam]:
    """Convert our Message models to OpenAI's message format"""
    return [
        {
            "role": msg.role,
            "content": msg.content
        } for msg in messages
    ]

async def stream_chat_completion(messages: List[ChatCompletionMessageParam]):
    """Stream chat completion responses in Vercel AI SDK format"""
    try:
        stream = client.chat.completions.create(
            model="gpt-4-1106-preview",  # or your preferred model
            messages=messages,
            stream=True,
            temperature=0.7,
        )

        for chunk in stream:
            if chunk.choices:
                choice = chunk.choices[0]
                
                # If it's the end of stream
                if choice.finish_reason is not None:
                    if choice.finish_reason == "stop":
                        # Send final usage information
                        usage = {
                            "prompt_tokens": 0,  # We don't have access to these in chunks
                            "completion_tokens": 0,
                            "total_tokens": 0
                        }
                        yield f'e:{{"finishReason":"stop","usage":{json.dumps(usage)},"isContinued":false}}\n'
                    continue

                # If there's content, send it
                if choice.delta.content:
                    yield f'0:{json.dumps(choice.delta.content)}\n'
                    
    except Exception as e:
        log_error(logger, e, {'operation': 'stream_chat_completion'})
        # Send error message in stream
        error_msg = "An error occurred during chat completion"
        yield f'0:{json.dumps(error_msg)}\n'
        yield 'e:{"finishReason":"error"}\n'

@router.post("")
async def chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Chat completion endpoint that streams responses
    Compatible with Vercel AI SDK
    """
    try:
        logger.info(f"Chat request received from user {current_user.id}")
        messages = convert_to_chat_messages(request.messages)
        
        response = StreamingResponse(
            stream_chat_completion(messages),
            media_type='text/plain',
        )
        response.headers['x-vercel-ai-data-stream'] = 'v1'
        
        return response
        
    except Exception as e:
        log_error(logger, e, {
            'user_id': str(current_user.id),
            'operation': 'chat'
        })
        raise