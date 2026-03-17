from fastapi import APIRouter
from pydantic import BaseModel, Field
from agents.graph import run_agent

router = APIRouter()


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=10_000)
    user_id: str = Field(..., min_length=1, max_length=256)


@router.post("/chat")
async def chat(req: ChatRequest) -> dict[str, str]:
    response = await run_agent(req.message, req.user_id)
    return {"response": response}