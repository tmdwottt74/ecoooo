from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
<<<<<<< HEAD
import os
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

from .database import init_db, SessionLocal
from .routes import dashboard, credits, challenges, auth, achievements, users, admin, mobility, activity, ai_challenge # mobility, activity, ai_challenge 라우터 추가
from .seed_admin_user import seed_admin_user
from .bedrock_logic import router as chat_router
=======
from sqlalchemy.orm import Session

from backend.routes import dashboard, credits, challenges, auth, achievements, users, admin, mobility, ai_challenge
from backend import database
from backend.bedrock_logic import router as chat_router
from backend.routes.statistics import router as statistics_router
from backend.routes.websocket import router as websocket_router
from backend.routes.database import router as database_router # Added database router import
from backend.database import init_db, get_db, SessionLocal
from backend.seed_admin_user import seed_admin_user

import os
>>>>>>> 20cdeef2606b3074ac01baad216e4ea7dbd897d5

# FastAPI 앱 생성
app = FastAPI(
    title="Ecooo API",
    description="탄소 절감을 위한 친환경 서비스 API",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3002",
        "http://127.0.0.1:3002",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# 정적 파일 서빙 (이미지 등)
if os.path.exists("frontend/public"):
    app.mount("/images", StaticFiles(directory="frontend/public"), name="images")

# 라우터 등록
app.include_router(dashboard.router)
app.include_router(credits.router)
app.include_router(challenges.router)
app.include_router(auth.router)
app.include_router(achievements.router)
app.include_router(users.router)
app.include_router(admin.router)
app.include_router(chat_router)
<<<<<<< HEAD
app.include_router(mobility.router) # mobility 라우터 추가
app.include_router(activity.router)
=======
app.include_router(mobility.router) # Added mobility router
app.include_router(database_router) # Corrected database router inclusion
app.include_router(statistics_router)
>>>>>>> 20cdeef2606b3074ac01baad216e4ea7dbd897d5
app.include_router(ai_challenge.router)

@app.on_event("startup")
async def startup_event():
    """앱 시작시 실행되는 이벤트"""
    # 데이터베이스 테이블 생성
    init_db()

    # 관리자 사용자 시드
    db = SessionLocal()
    try:
        seed_admin_user(db)
    finally:
        db.close()

<<<<<<< HEAD
=======

>>>>>>> 20cdeef2606b3074ac01baad216e4ea7dbd897d5
@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "Ecooo API 서버가 실행 중입니다!",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    """헬스 체크 엔드포인트"""
    return {"status": "healthy", "message": "서버가 정상적으로 작동 중입니다"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)