# backend/routers/dashboard.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any
from .. import database

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

# 📌 챌린지 목표 (예시: 100kg 절감)
CHALLENGE_GOAL_KG = 100

@router.get("/{user_id}")
def get_dashboard(user_id: int, db: Session = Depends(database.get_db)) -> Dict[str, Any]:
    """
    대시보드 통합 API
    - 오늘 절약량
    - 오늘 획득 포인트
    - 정원 레벨
    - 누적 절약량
    - 최근 7일 절감량
    - 교통수단별 절감 비율
    - 챌린지 진행 상황
    """

    # 📌 오늘 절약량
    today_query = """
        SELECT IFNULL(SUM(co2_saved_g), 0) AS saved_today
        FROM mobility_logs
        WHERE user_id = :user_id AND DATE(created_at) = CURDATE()
    """
    today_row = db.execute(today_query, {"user_id": user_id}).fetchone()
    co2_saved_today = float(today_row[0]) if today_row else 0.0

    # 📌 누적 절약량
    total_query = """
        SELECT IFNULL(SUM(co2_saved_g), 0) AS total_saved
        FROM mobility_logs
        WHERE user_id = :user_id
    """
    total_row = db.execute(total_query, {"user_id": user_id}).fetchone()
    total_saved = float(total_row[0]) if total_row else 0.0

    # 📌 최근 7일 절감량
    daily_query = """
        SELECT DATE(created_at) AS ymd, SUM(co2_saved_g) AS saved_g
        FROM mobility_logs
        WHERE user_id = :user_id
          AND created_at >= CURDATE() - INTERVAL 7 DAY
        GROUP BY DATE(created_at)
        ORDER BY ymd ASC
    """
    daily_rows = db.execute(daily_query, {"user_id": user_id}).fetchall()
    last7days = [{"date": str(row[0]), "saved_g": float(row[1])} for row in daily_rows]

    # 📌 교통수단별 절감 비율
    mode_query = """
        SELECT mode, SUM(co2_saved_g) AS saved_g
        FROM mobility_logs
        WHERE user_id = :user_id
        GROUP BY mode
    """
    mode_rows = db.execute(mode_query, {"user_id": user_id}).fetchall()
    modeStats = [{"mode": row[0], "saved_g": float(row[1])} for row in mode_rows]

    # 📌 정원 레벨, 에코 크레딧, 포인트 (임시 규칙)
    garden_level = int(total_saved // 100)          # 100g당 레벨 1
    eco_credits_earned = int(co2_saved_today // 10) # 오늘 10g 절약당 1P
    total_points = int(total_saved // 10)           # 누적 10g 절약당 1P

    # 📌 챌린지 진행 상황
    challenge = {
        "goal": CHALLENGE_GOAL_KG,
        "progress": total_saved / 1000  # g → kg 변환 (mobility_logs 단위 확인 필요)
    }

    return {
        "user_id": user_id,
        "co2_saved_today": co2_saved_today,
        "eco_credits_earned": eco_credits_earned,
        "garden_level": garden_level,
        "total_saved": total_saved / 1000,  # g → kg 변환
        "total_points": total_points,
        "last7days": last7days,
        "modeStats": modeStats,
        "challenge": challenge
    }
