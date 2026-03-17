from fastapi import FastAPI
from api.chat import router as chat_router
from api.booking import router as booking_router
from api.refund import router as refund_router
from db.session import init_db

app = FastAPI()

@app.on_event("startup")
async def startup():
    await init_db()

app.include_router(chat_router)
app.include_router(booking_router)
app.include_router(refund_router)
