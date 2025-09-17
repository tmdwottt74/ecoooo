# backend/routes/dashboard.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Dict, Any, List
from datetime import datetime, timedelta
from ..database import get_db
from ..models import User, CreditsLedger, MobilityLog, UserGarden, GardenLevel
from ..schemas import DashboardStats, DailyStats, WeeklyStats

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

# 📌 챌린지 목표 (예시: 100kg 절감)
CHALLENGE_GOAL_KG = 100

@router.get("/{user_id}", response_model=DashboardStats)
async def get_dashboard(user_id: int, db: Session = Depends(get_db)) -> DashboardStats:
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
    # 사용자 존재 확인
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 📌 오늘 절약량
    today_query = text("""
        SELECT IFNULL(SUM(co2_saved_g), 0) AS saved_today
        FROM mobility_logs
        WHERE user_id = :user_id AND DATE(created_at) = CURDATE()
    """)
    today_row = db.execute(today_query, {"user_id": user_id}).fetchone()
    co2_saved_today = float(today_row[0]) if today_row else 0.0

    # 📌 누적 절약량
    total_query = text("""
        SELECT IFNULL(SUM(co2_saved_g), 0) AS total_saved
        FROM mobility_logs
        WHERE user_id = :user_id
    """)
    total_row = db.execute(total_query, {"user_id": user_id}).fetchone()
    total_saved = float(total_row[0]) if total_row else 0.0

    # 📌 총 포인트
    points_query = text("""
        SELECT IFNULL(SUM(points), 0) AS total_points
        FROM credits_ledger
        WHERE user_id = :user_id
    """)
    points_row = db.execute(points_query, {"user_id": user_id}).fetchone()
    total_points = int(points_row[0]) if points_row else 0

    # 📌 정원 레벨 정보
    garden = db.query(UserGarden).filter(UserGarden.user_id == user_id).first()
    garden_level = 1
    garden_progress = 0
    
    if garden:
        garden_level = garden.level.level_number
        garden_progress = garden.waters_count

    # 📌 최근 활동 수
    recent_activities_query = text("""
        SELECT COUNT(*) AS activity_count
        FROM mobility_logs
        WHERE user_id = :user_id 
        AND created_at >= CURDATE() - INTERVAL 7 DAY
    """)
    activities_row = db.execute(recent_activities_query, {"user_id": user_id}).fetchone()
    recent_activities = int(activities_row[0]) if activities_row else 0

    return DashboardStats(
        user_id=user_id,
        total_points=total_points,
        total_co2_saved=total_saved / 1000,  # g → kg 변환
        recent_activities=recent_activities,
        garden_level=garden_level,
        garden_progress=garden_progress
    )

@router.get("/{user_id}/daily", response_model=List[DailyStats])
async def get_daily_stats(user_id: int, days: int = 7, db: Session = Depends(get_db)) -> List[DailyStats]:
    """최근 N일간의 일별 통계를 조회합니다."""
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    daily_query = text("""
        SELECT 
            DATE(created_at) AS date,
            IFNULL(SUM(co2_saved_g), 0) AS co2_saved,
            IFNULL(SUM(points_earned), 0) AS points_earned,
            COUNT(*) AS activities_count
        FROM mobility_logs
        WHERE user_id = :user_id
        AND created_at >= CURDATE() - INTERVAL :days DAY
        GROUP BY DATE(created_at)
        ORDER BY date ASC
    """)
    
    daily_rows = db.execute(daily_query, {"user_id": user_id, "days": days}).fetchall()
    
    return [
        DailyStats(
            date=str(row[0]),
            co2_saved=float(row[1]) / 1000,  # g → kg 변환
            points_earned=int(row[2]),
            activities_count=int(row[3])
        )
        for row in daily_rows
    ]

@router.get("/{user_id}/weekly", response_model=List[WeeklyStats])
async def get_weekly_stats(user_id: int, weeks: int = 4, db: Session = Depends(get_db)) -> List[WeeklyStats]:
    """최근 N주간의 주별 통계를 조회합니다."""
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    weekly_query = text("""
        SELECT 
            YEARWEEK(created_at) AS week_num,
            MIN(DATE(created_at)) AS week_start,
            MAX(DATE(created_at)) AS week_end,
            IFNULL(SUM(co2_saved_g), 0) AS total_co2_saved,
            IFNULL(SUM(points_earned), 0) AS total_points_earned,
            COUNT(*) AS total_activities
        FROM mobility_logs
        WHERE user_id = :user_id
        AND created_at >= CURDATE() - INTERVAL :weeks WEEK
        GROUP BY YEARWEEK(created_at)
        ORDER BY week_num ASC
    """)
    
    weekly_rows = db.execute(weekly_query, {"user_id": user_id, "weeks": weeks}).fetchall()
    
    return [
        WeeklyStats(
            week_start=str(row[1]),
            week_end=str(row[2]),
            total_co2_saved=float(row[3]) / 1000,  # g → kg 변환
            total_points_earned=int(row[4]),
            total_activities=int(row[5]),
            daily_breakdown=[]  # 필요시 별도 구현
        )
        for row in weekly_rows
    ]

@router.get("/{user_id}/transport-modes")
async def get_transport_mode_stats(user_id: int, db: Session = Depends(get_db)) -> List[Dict[str, Any]]:
    """교통수단별 절감 통계를 조회합니다."""
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    mode_query = text("""
        SELECT 
            mode,
            SUM(co2_saved_g) AS saved_g,
            COUNT(*) AS usage_count,
            AVG(distance_km) AS avg_distance
        FROM mobility_logs
        WHERE user_id = :user_id
        GROUP BY mode
        ORDER BY saved_g DESC
    """)
    
    mode_rows = db.execute(mode_query, {"user_id": user_id}).fetchall()
    
    return [
        {
            "mode": row[0],
            "saved_g": float(row[1]),
            "usage_count": int(row[2]),
            "avg_distance": float(row[3]) if row[3] else 0.0
        }
        for row in mode_rows
    ]
