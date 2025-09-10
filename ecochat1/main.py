from typing import Union, List
from datetime import datetime
from pathlib import Path

from fastapi import FastAPI, HTTPException, Depends, Query
from pydantic import BaseModel, Field as PydField
from sqlmodel import SQLModel, Field, Session, create_engine, select
from starlette.staticfiles import StaticFiles

# ---------------- 설정 ----------------
EMISSION_FACTORS_G_PER_KM = {
    "car": 192.0,
    "bus": 105.0,
    "subway": 41.0,
    "train": 28.0,
    "walk": 0.0,
    "bike": 0.0,
}
ALLOWED_MODES = ["bus", "subway", "train", "walk", "bike"]
POINTS_PER_100G = 1.0  # 100g 절감당 1포인트

def calc_savings_and_points(mode: str, distance_km: float):
    car_gpkm = EMISSION_FACTORS_G_PER_KM["car"]
    mode_gpkm = EMISSION_FACTORS_G_PER_KM.get(mode)
    saved_g = max((car_gpkm - mode_gpkm) * distance_km, 0.0)
    points = int(saved_g // 100 * POINTS_PER_100G)
    return round(saved_g, 2), points

# ---------------- DB ----------------
DATABASE_URL = "sqlite:///./carbon.db"
engine = create_engine(DATABASE_URL, echo=False)

class Trip(SQLModel, table=True):
    id: Union[int, None] = Field(default=None, primary_key=True)
    user_id: int = Field(index=True, foreign_key="user.id")
    mode: str = Field(index=True)
    distance_km: float
    co2_saved_g: float
    points_earned: int
    created_at: datetime = Field(default_factory=datetime.utcnow)

class User(SQLModel, table=True):
    id: Union[int, None] = Field(default=None, primary_key=True)
    username: str = Field(index=True)
    points_total: int = Field(default=0)

def get_session():
    with Session(engine) as session:
        yield session

# ---------------- FastAPI ----------------
app = FastAPI(title="EcoChat")

# 정적 파일(/ui)
static_dir = Path(__file__).parent / "static"
app.mount("/ui", StaticFiles(directory=static_dir, html=True), name="static")

@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(engine)

# ---------- API ----------
class UserCreate(BaseModel):
    username: str = PydField(min_length=1, max_length=50)

class UserSummary(BaseModel):
    user_id: int
    username: str
    points_total: int
    total_saved_g: float
    trips_count: int

class TripCreate(BaseModel):
    user_id: int
    mode: str
    distance_km: float

class TripOut(BaseModel):
    id: int
    user_id: int
    mode: str
    distance_km: float
    co2_saved_g: float
    points_earned: int
    created_at: str

@app.get("/")
def root():
    return {"ok": True, "docs": "/docs", "ui": "/ui"}

@app.post("/users", response_model=UserSummary)
def create_user(payload: UserCreate, session: Session = Depends(get_session)):
    user = User(username=payload.username)
    session.add(user)
    session.commit()
    session.refresh(user)
    return UserSummary(user_id=user.id, username=user.username,
        points_total=user.points_total, total_saved_g=0.0, trips_count=0)

@app.get("/users/{user_id}/summary", response_model=UserSummary)
def get_user_summary(user_id: int, session: Session = Depends(get_session)):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    trips = session.exec(select(Trip).where(Trip.user_id == user_id)).all()
    total_saved_g = sum(t.co2_saved_g for t in trips)
    return UserSummary(user_id=user.id, username=user.username,
        points_total=user.points_total, total_saved_g=round(total_saved_g,2),
        trips_count=len(trips))

@app.post("/trips", response_model=TripOut)
def create_trip(payload: TripCreate, session: Session = Depends(get_session)):
    user = session.get(User, payload.user_id)
    if not user:
        raise HTTPException(404, "User not found")
    if payload.mode.lower() not in ALLOWED_MODES:
        raise HTTPException(400, f"mode must be one of {ALLOWED_MODES}")
    if payload.distance_km <= 0:
        raise HTTPException(400, "distance_km must be > 0")

    saved_g, points = calc_savings_and_points(payload.mode.lower(), payload.distance_km)
    trip = Trip(user_id=user.id, mode=payload.mode.lower(),
        distance_km=payload.distance_km, co2_saved_g=saved_g, points_earned=points)
    user.points_total += points
    session.add(trip); session.add(user)
    session.commit(); session.refresh(trip)
    return TripOut(id=trip.id, user_id=trip.user_id, mode=trip.mode,
        distance_km=trip.distance_km, co2_saved_g=trip.co2_saved_g,
        points_earned=trip.points_earned, created_at=trip.created_at.isoformat())

@app.get("/trips", response_model=List[TripOut])
def list_trips(user_id: int = Query(...), session: Session = Depends(get_session)):
    if not session.get(User, user_id):
        raise HTTPException(404, "User not found")
    trips = session.exec(select(Trip).where(Trip.user_id==user_id).order_by(Trip.created_at.desc())).all()
    return [TripOut(id=t.id, user_id=t.user_id, mode=t.mode,
        distance_km=t.distance_km, co2_saved_g=t.co2_saved_g,
        points_earned=t.points_earned, created_at=t.created_at.isoformat())
        for t in trips]
