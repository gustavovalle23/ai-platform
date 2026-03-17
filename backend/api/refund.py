from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from db.models import Ticket, Event
from deps import get_db

router = APIRouter()


@router.post("/refund/{ticket_id}")
async def refund(ticket_id: str, db: AsyncSession = Depends(get_db)):
    ticket = await db.get(Ticket, ticket_id)
    if ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")
    ticket.status = "refunded"
    event = Event(type="refund_requested", payload={"ticket_id": ticket_id})
    db.add(event)
    await db.commit()
    await db.refresh(ticket)
    return {"status": "refunded", "ticket_id": ticket_id}
