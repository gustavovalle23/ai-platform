from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from db.session import SessionLocal
from db.models import Ticket, Event

router = APIRouter()

async def get_db():
    async with SessionLocal() as session:
        yield session

@router.post("/refund/{ticket_id}")
async def refund(ticket_id: str, db: AsyncSession = Depends(get_db)):
    ticket = await db.get(Ticket, ticket_id)
    ticket.status = "refunded"
    event = Event(type="refund_requested", payload={"ticket_id": ticket_id})
    db.add(event)
    await db.commit()
    return {"status": "refunded"}