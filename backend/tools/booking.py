from db.session import SessionLocal
from db.models import Booking

async def get_booking_tool(booking_id: str):
    async with SessionLocal() as db:
        booking = await db.get(Booking, booking_id)
        return {"id": booking.id, "status": booking.status, "flight_id": booking.flight_id}
