import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

# 환경 변수에서 데이터베이스 URL 가져오기
DATABASE_URL = os.getenv("DATABASE_URL")

# SQLAlchemy 엔진 생성
# echo=True는 SQLAlchemy가 실행하는 모든 SQL 문을 출력하여 디버깅에 유용합니다.
engine = create_engine(DATABASE_URL, echo=True)

# 각 요청에 대해 독립적인 데이터베이스 세션을 생성하는 SessionLocal 클래스
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 데이터베이스 모델을 정의하기 위한 베이스 클래스
Base = declarative_base()

# 의존성 주입을 위한 함수
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
