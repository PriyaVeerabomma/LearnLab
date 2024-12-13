from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from .api.v1 import auth, files, flashcards, podcast, quiz, websocket, sample_data
from .core.config import settings
from .core.database import engine, Base

from fastapi.responses import StreamingResponse
from openai import AsyncOpenAI
import json

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="LearnLab API",
    description="Backend API for LearnLab application",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(
    auth.router,
    prefix="/auth",
    tags=["Authentication"]
)

app.include_router(
    files.router,
    prefix="/api/files",
    tags=["Files"]
)

app.include_router(
    flashcards.router,
    prefix="/api/flashcards",
    tags=["Flashcards"]
)

app.include_router(
    podcast.podcast_router,
    prefix="/api/podcasts",
    tags=["Podcasts"]
)

app.include_router(
    podcast.progress_router,
    prefix="/api/podcasts",
    tags=["Podcast Progress"]
)

app.include_router(
    podcast.analytics_router,
    prefix="/api/podcasts",
    tags=["Podcast Analytics"]
)

app.include_router(
    quiz.router,
    prefix="/api/quiz",
    tags=["Quizzes"]
)

app.include_router(
    websocket.router,
    tags=["WebSocket"]
)

app.include_router(
    sample_data.router,
    prefix="/api/sample-data",
    tags=["Sample Data"]
)

@app.get("/")
async def root():
    return {
        "message": "Welcome to LearnLab API",
        "documentation": "/docs",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "message": "Service is running"
    }    
client = AsyncOpenAI()


client = AsyncOpenAI()

@app.post("/api/chat")
async def chat(request: Request):
    body = await request.json()
    query = body.get("messages", [])[-1].get("content", "")
    flashcards = body.get("flashcards", False)
    quiz = body.get("quiz", False)
    podcast = body.get("podcast", False)

    # Prepare the system message based on the selected options
    system_message = "You are a helpful AI assistant. "
    if flashcards:
        system_message += "Generate flashcards. "
    if quiz:
        system_message += "Create a quiz. "
    if podcast:
        system_message += "Prepare a podcast script. "

    async def generate():
        try:
            stream = await client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_message},
                    {"role": "user", "content": query}
                ],
                stream=True
            )

            async for chunk in stream:
                if chunk.choices[0].delta.content is not None:
                    content = chunk.choices[0].delta.content
                    yield f"data: {json.dumps({'content': content})}\n\n"
                await asyncio.sleep(0.01)  # Small delay to prevent overwhelming the client
            
            yield "data: [DONE]\n\n"
        except Exception as e:
            print(f"Error in generate: {str(e)}")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
        finally:
            yield "data: [DONE]\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")
