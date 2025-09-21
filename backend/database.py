from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv() # Load environment variables from .env file

# 데이터베이스 URL 설정
<<<<<<< HEAD
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_USER = os.getenv("DB_USER", "root")
DB_PASS = os.getenv("DB_PASS", "password")
DB_NAME = os.getenv("DB_NAME", "ecoooo_db")
=======
DB_HOST = os.getenv("DB_HOST", "seoul-ht-08-db.cpk0oamsu0g6.us-west-1.rds.amazonaws.com")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_USER = os.getenv("DB_USER", "admin")
DB_PASS = os.getenv("DB_PASS", "!donggukCAI1234")
DB_NAME = os.getenv("DB_NAME", "seoul-ht-08-db")
>>>>>>> 20cdeef2606b3074ac01baad216e4ea7dbd897d5

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)
# Fallback to SQLite if no MySQL env vars are set
if not DB_USER or not DB_PASS or not DB_NAME:
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./ecoooo.db")

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
    """데이터베이스 테이블을 생성하고 초기 데이터를 시딩합니다."""
    from .models import Base, Challenge, ChallengeMember
    from .seed_admin_user import seed_admin_user
    from .seed_challenges import seed_challenges
    from .seed_garden_levels import seed_garden_levels
<<<<<<< HEAD
=======
    from .crud import create_user_group # Assuming this is needed for initial groups
>>>>>>> 20cdeef2606b3074ac01baad216e4ea7dbd897d5

    # DEV ONLY: Drop tables to apply schema changes. This deletes all data!
    ChallengeMember.__table__.drop(engine, checkfirst=True)
    Challenge.__table__.drop(engine, checkfirst=True)

    Base.metadata.create_all(bind=engine)

    # Seed initial data
    db = SessionLocal()
    try:
<<<<<<< HEAD
=======
        # Seed default user groups if needed
        # Example: create_user_group(db, schemas.UserGroupCreate(group_name="Default Group", group_type="ETC"))
>>>>>>> 20cdeef2606b3074ac01baad216e4ea7dbd897d5
        seed_admin_user(db)
        seed_challenges(db)
        seed_garden_levels(db)
    except Exception as e:
        print(f"Error during database seeding: {e}")
    finally:
        db.close()