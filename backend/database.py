from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# MySQL 연결 정보 (MySQL Workbench에 맞게 수정)
MYSQL_URL = "mysql+mysqlconnector://user:password@localhost:3306/ecoooo_db"

# 데이터베이스 연결 엔진 생성
engine = create_engine(MYSQL_URL)

# 세션 생성기
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ORM 기본 클래스
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()