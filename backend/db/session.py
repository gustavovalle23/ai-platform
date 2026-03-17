from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
import os

engine = create_async_engine(os.environ["DATABASE_URL"], echo=False)

SessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def init_db():
    from db.models import Base, Booking, Ticket
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with SessionLocal() as session:
        existing_booking = await session.get(Booking, "booking_1")
        if existing_booking is None:
            session.add(
                Booking(
                    id="booking_1",
                    user_id="user_1",
                    status="confirmed",
                    flight_id="flight_1",
                )
            )
        existing_ticket = await session.get(Ticket, "ticket_1")
        if existing_ticket is None:
            session.add(
                Ticket(id="ticket_1", booking_id="booking_1", status="active")
            )
        await session.commit()