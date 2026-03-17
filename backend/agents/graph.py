from typing import Any, TypedDict

from langgraph.graph import StateGraph
from tools.booking import get_booking_tool
from tools.refund import refund_tool
from tools.flight import check_flight_status_tool


class GraphState(TypedDict, total=False):
    message: str
    user_id: str
    intent: str
    booking: dict[str, Any] | None
    flight: dict[str, Any] | None
    action: str
    result: dict[str, Any]


def _get_message(state: GraphState) -> str:
    return state.get("message") or ""


def _get_booking(state: GraphState) -> dict[str, Any]:
    return state.get("booking") or {}


def _get_flight(state: GraphState) -> dict[str, Any]:
    return state.get("flight") or {}


def _get_action(state: GraphState) -> str:
    return state.get("action") or "none"


async def classify(state: GraphState) -> dict[str, str]:
    message = _get_message(state)
    if "cancel" in message.lower():
        return {"intent": "disruption"}
    return {"intent": "unknown"}


async def fetch_booking(state: GraphState) -> dict[str, Any]:
    booking = await get_booking_tool("booking_1")
    return {"booking": booking}


async def check_status(state: GraphState) -> dict[str, Any]:
    booking = _get_booking(state)
    flight_id = booking.get("flight_id") if isinstance(booking, dict) else None
    if not flight_id:
        return {"flight": {"flight_id": None, "status": "unknown"}}
    flight = await check_flight_status_tool(flight_id)
    return {"flight": flight}


async def decide(state: GraphState) -> dict[str, str]:
    flight = _get_flight(state)
    status = flight.get("status", "unknown") if isinstance(flight, dict) else "unknown"
    if status == "cancelled":
        return {"action": "refund"}
    return {"action": "none"}


async def execute(state: GraphState) -> dict[str, Any]:
    action = _get_action(state)
    if action == "refund":
        result = await refund_tool("ticket_1")
        return {"result": result}
    return {"result": {}}


def build_graph() -> Any:
    graph = StateGraph(GraphState)
    graph.add_node("classify", classify)
    graph.add_node("fetch_booking", fetch_booking)
    graph.add_node("check_status", check_status)
    graph.add_node("decide", decide)
    graph.add_node("execute", execute)

    graph.set_entry_point("classify")

    graph.add_edge("classify", "fetch_booking")
    graph.add_edge("fetch_booking", "check_status")
    graph.add_edge("check_status", "decide")
    graph.add_edge("decide", "execute")

    return graph.compile()


graph = build_graph()


def _format_reply(state: GraphState) -> str:
    """Turn the final graph state into a short, user-facing message."""
    action = _get_action(state)
    result = state.get("result") or {}
    flight = _get_flight(state)
    flight_status = flight.get("status", "unknown") if isinstance(flight, dict) else "unknown"

    if action == "refund":
        if result.get("status") == "refunded":
            return "Your refund has been processed successfully. Is there anything else I can help with?"
        if result.get("status") == "error":
            return "We couldn't process your refund right now. Please try again or contact support."
        return "Your refund has been requested. We'll process it shortly."

    if action == "none" and flight_status == "cancelled":
        return "Your flight is cancelled. If you'd like a refund, say so and I can process it for you."

    if flight_status == "unknown":
        return "I couldn't find your booking or flight details. Please try again or contact support."

    return "I've checked your booking and flight status. Your flight is on schedule. Need help with anything else?"


async def run_agent(message: str, user_id: str) -> str:
    if not message or not isinstance(message, str):
        return "Please send a non-empty message."
    if not user_id or not isinstance(user_id, str):
        return "Missing or invalid user_id."
    initial: GraphState = {"message": message.strip(), "user_id": user_id.strip()}
    result = await graph.ainvoke(initial)
    return _format_reply(result)
