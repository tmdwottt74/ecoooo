import os
from contextlib import contextmanager
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from dotenv import load_dotenv

# .env 파일 로드 (프로젝트 루트 기준)
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))

# 환경변수에서 DB 설정 가져오기
DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")
DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME")

# DB URL 구성
DB_URL = (
    f"mysql+pymysql://{DB_USER}:{DB_PASS}"
    f"@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"
)

# SQLAlchemy 엔진 & 세션
engine = create_engine(DB_URL, pool_pre_ping=True, echo=True, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

# Base 클래스 (모델 정의 시 상속)
class Base(DeclarativeBase):
    pass

# DB 세션 종속성
@contextmanager
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()