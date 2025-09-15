# backend/routers/mobility.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from .. import database
from .. import schemas, crud
from ..database import get_db


router = APIRouter(prefix="/mobility", tags=["mobility"])

# 📌 응답 스키마
class ModeSavingResponse(BaseModel):
    mode: str
    saved_g: float


@router.get("/stats/mode/{user_id}", response_model=List[ModeSavingResponse])
def get_mode_stats(user_id: int, db: Session = Depends(database.get_db)):
    """
    mobility_logs 테이블에서 user_id 기준으로
    교통수단별 절감량(co2_saved_g 합계)을 반환
    """
    query = """
        SELECT mode,
               SUM(co2_saved_g) AS saved_g
        FROM mobility_logs
        WHERE user_id = :user_id
        GROUP BY mode
    """
    rows = db.execute(query, {"user_id": user_id}).fetchall()

    return [{"mode": row[0], "saved_g": float(row[1])} for row in rows]


# 📌 일별 절감량 조회 API
@router.get("/stats/daily/{user_id}", response_model=List[schemas.DailySavingResponse])
def get_daily_savings(user_id: int, db: Session = Depends(get_db)):
    """
    mobility_logs 테이블에서 user_id 기준으로
    최근 7일간 일별 절감량(co2_saved_g 합계)을 반환
    """
    query = """
        SELECT DATE(created_at) AS ymd,
               SUM(co2_saved_g) AS saved_g
        FROM mobility_logs
        WHERE user_id = :user_id
          AND created_at >= CURDATE() - INTERVAL 7 DAY
        GROUP BY DATE(created_at)
        ORDER BY ymd ASC
    """
    rows = db.execute(query, {"user_id": user_id}).fetchall()

    # 결과를 JSON 직렬화 가능한 dict로 변환
    return [{"ymd": row[0], "saved_g": float(row[1])} for row in rows]

# 최근 7일 절감량
@router.get("/stats/daily/{user_id}", response_model=list[schemas.DailySavingResponse])
def get_daily_stats(user_id: int, db: Session = Depends(get_db)):
    rows = db.execute(
        """
        SELECT DATE(created_at) AS ymd, SUM(co2_saved_g) AS saved_g
        FROM mobility_logs
        WHERE user_id = :user_id
          AND created_at >= CURDATE() - INTERVAL 7 DAY
        GROUP BY DATE(created_at)
        ORDER BY ymd ASC
        """,
        {"user_id": user_id}
    ).fetchall()

    return [{"date": str(r[0]), "saved_g": float(r[1])} for r in rows]

# 교통수단별 절감 비율
@router.get("/stats/mode/{user_id}", response_model=list[schemas.ModeStatResponse])
def get_mode_stats(user_id: int, db: Session = Depends(get_db)):
    rows = db.execute(
        """
        SELECT mode, SUM(co2_saved_g) AS saved_g
        FROM mobility_logs
        WHERE user_id = :user_id
        GROUP BY mode
        """,
        {"user_id": user_id}
    ).fetchall()

    return [{"mode": r[0], "saved_g": float(r[1])} for r in rows]