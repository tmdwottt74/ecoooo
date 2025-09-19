from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from backend.routes import dashboard, credits, session, database, challenges, auth, achievements, users, admin
from backend.routes.chat_router import router as chat_router
from backend.database import init_db, get_db
from backend.seed_admin_user import seed_admin_user

import os

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
app.include_router(session.router)
app.include_router(database.router)


# ✅ 앱 시작 시 DB 초기화 + 관리자 시드
@app.on_event("startup")
def startup_event():
    init_db()
    db: Session = next(get_db())
    try:
        seed_admin_user(db)
    finally:
        db.close()


# 기본 엔드포인트
@app.get("/")
async def root():
    return {
        "message": "Ecooo API 서버가 실행 중입니다!",
        "version": "1.0.0",
        "docs": "/docs"
    }

# 헬스체크
@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "서버가 정상적으로 작동 중입니다"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
