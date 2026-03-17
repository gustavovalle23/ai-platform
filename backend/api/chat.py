from fastapi import APIRouter
from pydantic import BaseModel
from agents.graph import run_agent

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    user_id: str

@router.post("/chat")
async def chat(req: ChatRequest):
    response = await run_agent(req.message, req.user_id)
    return {"response": response}