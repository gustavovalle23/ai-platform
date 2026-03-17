from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from db.session import SessionLocal
from db.models import Booking

router = APIRouter()

async def get_db():
    async with SessionLocal() as session:
        yield session

@router.get("/booking/{booking_id}")
async def get_booking(booking_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.get(Booking, booking_id)
    return result