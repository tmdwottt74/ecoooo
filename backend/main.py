from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from . import crud, schemas
from .database import get_db

# --- FastAPI App Initialization ---
app = FastAPI(title="Eco AI Backend", version="1.0.0")


# =========================
# Health Check
# =========================
@app.get("/")
def root():
    return {"status": "Eco Chatbot API is running ✅ (DB + Mock Mode)"}


# =========================
# User API (DB 연동)
# =========================
@app.post("/users/", response_model=schemas.UserRead)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    return crud.create_user(db, user)

@app.get("/users/", response_model=list[schemas.UserRead])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_users(db, skip=skip, limit=limit)

# ✅ AI 맥락 API - UserContext 사용
@app.get("/users/{user_id}/context", response_model=schemas.UserContext)
def get_user_context(user_id: int, db: Session = Depends(get_db)):
    user_context = crud.get_user_with_group(db, user_id)
    if not user_context:
        raise HTTPException(status_code=404, detail="User not found")
    return user_context

# =========================
# Mock API (DB-Free Mode, 테스트용)
# =========================
from pydantic import BaseModel

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
    activity_type: str  # e.g., 'subway', 'bike'


@app.post("/chat", response_model=ChatResponse)
async def handle_chat(message: ChatMessage):
    """Handles incoming chat messages with a simple echo (mock)."""
    response_text = f"'{message.message}' 라고 말씀하셨네요! (DB-free mock)"
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
    mock_data = DashboardData(
        user_id=activity.user_id,
        co2_saved_today=6.5,  # Slightly increased
        eco_credits_earned=550,  # Slightly increased
        garden_level=2
    )
    return mock_data


# =========================
# Run (for local dev)
# =========================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
