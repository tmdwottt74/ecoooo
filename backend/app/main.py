from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .database import engine, Base, get_db
from . import models, schemas, crud
from .routers import auth, users, mobility_logs, ingest, credits, challenges, recommendations, chatbot # chatbot 라우터 임포트
from .initial_data import create_initial_data # 초기 데이터 생성 함수 임포트

# 데이터베이스 테이블 생성
Base.metadata.create_all(bind=engine)

# 애플리케이션 시작 시 초기 데이터 생성
# 이 부분은 개발 환경에서만 실행하는 것이 좋으며, 프로덕션에서는 마이그레이션 도구를 사용합니다.
# 데이터베이스가 비어있을 때만 실행되도록 조건부 로직을 추가할 수 있습니다.
with Session(engine) as db:
    create_initial_data(db)

app = FastAPI(
    title="Ecooo API",
    description="서울시 AI 해커톤 - 에코 AI 챗봇과 함께하는 탄소절감 프로젝트 API",
    version="0.0.1",
)

# 라우터 포함
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(mobility_logs.router)
app.include_router(ingest.router)
app.include_router(credits.router)
app.include_router(challenges.router)
app.include_router(recommendations.router)
app.include_router(chatbot.router) # chatbot 라우터 포함

@app.get("/")
def read_root():
    return {"message": "Welcome to Ecooo API!"}