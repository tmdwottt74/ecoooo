from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from .database import init_db
from .routes import dashboard, credits

# FastAPI 앱 생성
app = FastAPI(
    title="Ecooo API",
    description="탄소 절감을 위한 친환경 서비스 API",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 정적 파일 서빙 (이미지 등)
if os.path.exists("frontend/public"):
    app.mount("/images", StaticFiles(directory="frontend/public"), name="images")

# 라우터 등록
app.include_router(dashboard.router)
app.include_router(credits.router)

@app.on_event("startup")
async def startup_event():
    """앱 시작시 실행되는 이벤트"""
    # 데이터베이스 테이블 생성
    init_db()

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