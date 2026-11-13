import os
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import anthropic

load_dotenv()

app = FastAPI(title="AI Layer", version="1.0.0")

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
ANTHROPIC_MODEL = os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022")
AI_LAYER_PORT = int(os.getenv("AI_LAYER_PORT", 3000))

if not ANTHROPIC_API_KEY:
    raise ValueError("ANTHROPIC_API_KEY is missing in .env")

client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[Message]] = []


class ChatResponse(BaseModel):
    reply: str


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "ai-layer"}


@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    try:
        messages = []

        if request.history:
            for item in request.history:
                if item.role in ["user", "assistant"]:
                    messages.append({
                        "role": item.role,
                        "content": item.content
                    })

        messages.append({
            "role": "user",
            "content": request.message
        })

        response = client.messages.create(
            model=ANTHROPIC_MODEL,
            max_tokens=500,
           # temperature=0.7,
            system="You are a helpful, professional, and clear AI chatbot. Answer in a simple and user-friendly way.",
            messages=messages
        )

        reply = ""
        for block in response.content:
            if block.type == "text":
                reply += block.text

        return ChatResponse(reply=reply)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=AI_LAYER_PORT, reload=True)