from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# 데이터베이스 URL 설정
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "mysql+pymysql://root:password@localhost:3306/ecoooo_db"
)

# SQLAlchemy 엔진 생성
engine = create_engine(
    DATABASE_URL,
    echo=False,  # SQL 쿼리 로깅 (개발시에만 True)
    pool_pre_ping=True,  # 연결 상태 확인
    pool_recycle=300,    # 5분마다 연결 재생성
)

# 세션 팩토리 생성
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base 클래스 생성
Base = declarative_base()

def get_db():
    """데이터베이스 세션을 생성하고 반환합니다."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """데이터베이스 테이블을 생성합니다."""
    from .models import Base
    Base.metadata.create_all(bind=engine)