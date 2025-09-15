from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
# 수정
from backend import crud, schemas, models
from backend.database import get_db
from backend.routes import users, chat, garden


# --- FastAPI App Initialization ---
app = FastAPI(title="Eco AI Backend", version="1.0.0")

app.include_router(users.router)
app.include_router(chat.router)
app.include_router(garden.router)

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
# MyGarden API (탄소 절감량 + 에코포인트 조회)
# =========================
from sqlalchemy import func

@app.get("/garden/{user_id}")
def get_garden_data(user_id: str, db: Session = Depends(get_db)):
    """
    특정 사용자의 총 탄소 절감량과 에코 포인트를 반환하는 API
    """
    # 총 탄소 절감량 (mobility_logs.co2_saved_g 합계)
    total_carbon = db.query(
        func.coalesce(func.sum(models.MobilityLog.co2_saved_g), 0)
    ).filter(models.MobilityLog.user_id == user_id).scalar()

    # 총 포인트 (credits_ledger.points 합계)
    total_points = db.query(
        func.coalesce(func.sum(models.CreditLedger.points), 0)
    ).filter(models.CreditLedger.user_id == user_id).scalar()

    return {
        "total_carbon_reduced": float(total_carbon),
        "total_points": int(total_points)
    }


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


# main.py (추가)

from sqlalchemy import func
from fastapi import Depends

@app.get("/dashboard/{user_id}")
def get_dashboard_data(user_id: int, db: Session = Depends(get_db)):
    
    # 오늘 절감량
    today_saved = db.query(
        func.coalesce(func.sum(models.MobilityLog.co2_saved_g), 0)
    ).filter(
        models.MobilityLog.user_id == user_id,
        func.date(models.MobilityLog.started_at) == func.curdate()
    ).scalar()

    # 누적 포인트
    total_points = db.query(
        func.coalesce(func.sum(models.CreditsLedger.points), 0)
    ).filter(models.CreditsLedger.user_id == user_id).scalar()

    # 최근 7일 절감량 추이
    last7days = (
        db.query(
            func.date(models.MobilityLog.started_at).label("ymd"),
            func.coalesce(func.sum(models.MobilityLog.co2_saved_g), 0).label("saved_g")
        )
        .filter(
            models.MobilityLog.user_id == user_id,
            models.MobilityLog.started_at >= func.date_sub(func.curdate(), 7)
        )
        .group_by(func.date(models.MobilityLog.started_at))
        .all()
    )

    return {
        "today_saved": float(today_saved),
        "total_points": int(total_points),
        "last7days": [{"date": str(row.ymd), "saved_g": float(row.saved_g)} for row in last7days]
    }

# =========================
# Challenge 진행 상황 API
# =========================
@app.get("/challenge/{user_id}")
def get_challenge_progress(user_id: int, db: Session = Depends(get_db)):
    """
    특정 사용자의 그룹 챌린지 진행 상황 반환 (임시: 누적 절약량 기준)
    """
    # 현재까지 절감량
    total_saved = db.query(
        func.coalesce(func.sum(models.MobilityLog.co2_saved_g), 0)
    ).filter(models.MobilityLog.user_id == user_id).scalar()

    # 예시: 100kg(=100000g) 절약 목표
    target = 100000
    percent = min(100, (total_saved / target) * 100)

    return {
        "target": target,
        "current": float(total_saved),
        "percent": round(percent, 1),
    }


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
