from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from db.models import Booking
from deps import get_db

router = APIRouter()


@router.get("/booking/{booking_id}")
async def get_booking(booking_id: str, db: AsyncSession = Depends(get_db)):
    booking = await db.get(Booking, booking_id)
    if booking is None:
        raise HTTPException(status_code=404, detail="Booking not found")
    return {
        "id": booking.id,
        "user_id": booking.user_id,
        "status": booking.status,
        "flight_id": booking.flight_id,
    }
