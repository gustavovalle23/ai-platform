from langgraph.graph import StateGraph
from tools.booking import get_booking_tool
from tools.refund import refund_tool
from tools.flight import check_flight_status_tool

class State(dict):
    pass


async def classify(state):
    message = state["message"]
    if "cancel" in message:
        return {"intent": "disruption"}
    return {"intent": "unknown"}

async def fetch_booking(state):
    booking = await get_booking_tool("booking_1")
    return {"booking": booking}

async def check_status(state):
    flight = await check_flight_status_tool(state["booking"]["flight_id"])
    return {"flight": flight}

async def decide(state):
    if state["flight"]["status"] == "cancelled":
        return {"action": "refund"}
    return {"action": "none"}

async def execute(state):
    if state["action"] == "refund":
        result = await refund_tool("ticket_1")
        return {"result": result}
    return {"result": {}}

def build_graph():
    graph = StateGraph(State)
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

async def run_agent(message, user_id):
    result = await graph.ainvoke({"message": message, "user_id": user_id})
    return str(result)