from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

# --- Pydantic Models (Data Structures) ---

class ChatMessage(BaseModel):
    user_id: str
    message: str

class ChatResponse(BaseModel):
    response_message: str

class DashboardData(BaseModel):
    user_id: str
    co2_saved_today: float
    eco_credits_earned: int
    garden_level: int

class Activity(BaseModel):
    user_id: str
    activity_type: str # e.g., 'subway', 'bike'

# --- FastAPI App Initialization ---
app = FastAPI()

# --- API Endpoints (DB-Free Mode) ---

@app.get("/")
def read_root():
    return {"status": "Eco Chatbot API is running (DB-free mode)"}

@app.post("/chat", response_model=ChatResponse)
async def handle_chat(message: ChatMessage):
    """Handles incoming chat messages with a simple echo."""
    response_text = f"'{message.message}' 라고 말씀하셨네요! 현재 DB 연결 없이 응답 중입니다."
    return ChatResponse(response_message=response_text)

@app.get("/dashboard/{user_id}", response_model=DashboardData)
async def get_dashboard_data(user_id: str):
    """Returns mock dashboard data as DB is not connected."""
    print(f"Fetching mock data for user: {user_id}")
    mock_data = DashboardData(
        user_id=user_id,
        co2_saved_today=5.8,
        eco_credits_earned=450,
        garden_level=2
    )
    return mock_data

@app.post("/activity", response_model=DashboardData)
async def log_activity(activity: Activity):
    """Returns mock data after a simulated activity as DB is not connected."""
    print(f"Simulating activity '{activity.activity_type}' for user: {activity.user_id}")
    # Just return some slightly different mock data to show the endpoint was hit
    mock_data = DashboardData(
        user_id=activity.user_id,
        co2_saved_today=6.5, # Slightly increased
        eco_credits_earned=550, # Slightly increased
        garden_level=2
    )
    return mock_data

# To run this app:
# 1. Run the command in the 'backend' directory: uvicorn main:app --reload
