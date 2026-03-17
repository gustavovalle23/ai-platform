async def check_flight_status_tool(flight_id: str | None):
    if not flight_id:
        return {"flight_id": None, "status": "unknown"}
    return {"flight_id": flight_id, "status": "cancelled"}