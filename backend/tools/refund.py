from db.session import SessionLocal
from db.models import Ticket, Event

async def refund_tool(ticket_id: str):
    async with SessionLocal() as db:
        ticket = await db.get(Ticket, ticket_id)
        ticket.status = "refunded"
        event = Event(type="refund_requested", payload={"ticket_id": ticket_id})
        db.add(event)
        await db.commit()
        return {"status": "refunded"}