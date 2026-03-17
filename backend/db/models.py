from sqlalchemy.orm import declarative_base, mapped_column
from sqlalchemy import String, Integer, JSON

Base = declarative_base()

class Booking(Base):
    __tablename__ = "bookings"

    id = mapped_column(String, primary_key=True)
    user_id = mapped_column(String)
    status = mapped_column(String)
    flight_id = mapped_column(String)

class Ticket(Base):
    __tablename__ = "tickets"

    id = mapped_column(String, primary_key=True)
    booking_id = mapped_column(String)
    status = mapped_column(String)

class Event(Base):
    __tablename__ = "events"

    id = mapped_column(Integer, primary_key=True, autoincrement=True)
    type = mapped_column(String)
    payload = mapped_column(JSON)