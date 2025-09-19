import logging
from datetime import datetime, timezone
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text, func, inspect
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

# database.py에서 연결 설정을 import
from ..database import engine, get_db as get_database_session

# models를 import
from ..models import User, CreditsLedger, UserGarden, GardenLevel, MobilityLog

# --------------------------------------------------
# FastAPI 라우터
# --------------------------------------------------
router = APIRouter(prefix="/api/database", tags=["database"])

# 유틸
def mask_url(url: str) -> str:
    try:
        s = str(url)
        if "@" in s and "://" in s and ":" in s.split("://", 1)[1]:
            prefix, rest = s.split("://", 1)
            creds, hostpart = rest.split("@", 1)
            if ":" in creds:
                user, _pw = creds.split(":", 1)
                creds = f"{user}:****"
            return f"{prefix}://{creds}@{hostpart}"
        return s
    except Exception:
        return str(url)

def get_database_info() -> Dict[str, Any]:
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"connected": True, "type": engine.url.get_backend_name(), "url": mask_url(engine.url)}
    except Exception as e:
        return {"connected": False, "type": engine.url.get_backend_name(), "url": mask_url(engine.url), "error": str(e)}

def now_utc_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")

# ─────────────────────────────────────────────
# 라우터 구현
# ─────────────────────────────────────────────
@router.get("/status")
async def get_database_status():
    """DB 연결 상태"""
    info = get_database_info()
    return {
        "status": "connected" if info["connected"] else "disconnected",
        "database_type": info["type"],
        "database_url": info["url"],
        "timestamp": now_utc_iso(),
        **({"error": info["error"]} if not info["connected"] and "error" in info else {})
    }

@router.get("/tables")
async def get_database_tables(db: Session = Depends(get_database_session)):
    """모든 테이블 목록 + 레코드 수"""
    inspector = inspect(engine)
    tables = inspector.get_table_names(schema=None)

    table_info = []
    for table in tables:
        try:
            count_sql = text(f"SELECT COUNT(*) AS cnt FROM `{table}`")
            count = db.execute(count_sql).scalar() or 0
            table_info.append({"name": table, "record_count": int(count)})
        except Exception as e:
            table_info.append({"name": table, "record_count": "error", "error": str(e)})

    return {"tables": table_info, "total_tables": len(table_info)}

@router.get("/summary")
async def get_database_summary(db: Session = Depends(get_database_session)):
    """전체 요약"""
    try:
        user_count = db.query(User).count()
        credit_count = db.query(CreditsLedger).count()
        garden_count = db.query(UserGarden).count()
        mobility_count = db.query(MobilityLog).count()

        total_earned = db.query(func.sum(CreditsLedger.points)).filter(
            CreditsLedger.type == "EARN"
        ).scalar() or 0
        total_spent = db.query(func.sum(CreditsLedger.points)).filter(
            CreditsLedger.type == "SPEND"
        ).scalar() or 0

        net_balance = (total_earned or 0) + (total_spent or 0)
        active_users_count = db.query(func.count(func.distinct(CreditsLedger.user_id))).scalar() or 0
        levels_available_count = db.query(GardenLevel).count()

        return {
            "users": {"total_count": user_count, "active_users": active_users_count},
            "credits": {
                "total_earned": int(total_earned or 0),
                "total_spent": abs(int(total_spent or 0)),
                "net_balance": int(net_balance),
                "transaction_count": credit_count,
            },
            "gardens": {"total_count": garden_count, "levels_available": levels_available_count},
            "mobility": {"total_logs": mobility_count},
            "database_info": get_database_info(),
            "timestamp": now_utc_iso(),
        }
    except Exception as e:
        logging.exception("요약 집계 실패")
        raise HTTPException(status_code=500, detail=f"집계 중 오류: {e}")

@router.get("/users/{user_id}/complete")
async def get_user_complete_data(user_id: int, db: Session = Depends(get_database_session)):
    """특정 사용자의 통합 데이터"""
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다")

    credits = (
        db.query(CreditsLedger)
        .filter(CreditsLedger.user_id == user_id)
        .order_by(CreditsLedger.created_at.desc())
        .all()
    )

    garden = db.query(UserGarden).filter(UserGarden.user_id == user_id).first()
    garden_payload = None
    if garden:
        garden_level = db.query(GardenLevel).filter(
            GardenLevel.level_id == garden.current_level_id
        ).first()

        progress_percent = 0.0
        if garden_level and garden_level.required_waters:
            try:
                progress_percent = round(
                    (garden.waters_count * 100.0) / float(garden_level.required_waters), 2
                )
            except ZeroDivisionError:
                progress_percent = 0.0

        garden_payload = {
            "garden_id": garden.garden_id,
            "current_level": (
                {
                    "level_id": garden_level.level_id,
                    "level_number": garden_level.level_number,
                    "level_name": garden_level.level_name,
                    "image_path": garden_level.image_path,
                    "required_waters": garden_level.required_waters,
                } if garden_level else None
            ),
            "waters_count": garden.waters_count,
            "total_waters": garden.total_waters,
            "progress_percent": progress_percent,
        }

    mobility_logs = (
        db.query(MobilityLog)
        .filter(MobilityLog.user_id == user_id)
        .order_by(MobilityLog.started_at.desc())
        .all()
    )

    return {
        "user": {
            "user_id": user.user_id,
            "username": user.username,
            "email": user.email,
            "created_at": user.created_at,
        },
        "credits": {
            "total_balance": sum(int(c.points or 0) for c in credits),
            "transactions": [
                {
                    "entry_id": c.entry_id,
                    "type": c.type,
                    "points": int(c.points or 0),
                    "reason": c.reason,
                    "created_at": c.created_at,
                    "meta": c.meta_json,
                }
                for c in credits
            ],
        },
        "garden": garden_payload,
        "mobility": [
            {
                "log_id": log.log_id,
                "mode": log.mode,
                "distance_km": float(log.distance_km or 0),
                "started_at": log.started_at,
                "ended_at": log.ended_at,
                "co2_saved_g": float(log.co2_saved_g or 0),
                "points_earned": int(log.points_earned or 0) if log.points_earned is not None else 0,
                "description": log.description,
                "start_point": log.start_point,
                "end_point": log.end_point,
            }
            for log in mobility_logs
        ],
        "timestamp": now_utc_iso(),
    }

@router.get("/export/all")
async def export_all_data(db: Session = Depends(get_database_session)):
    """전체 데이터 JSON export"""
    try:
        users = db.query(User).all()
        credits = db.query(CreditsLedger).all()
        gardens = db.query(UserGarden).all()
        levels = db.query(GardenLevel).all()
        mobility_logs = db.query(MobilityLog).all()

        data = {
            "users": [
                {
                    "user_id": u.user_id,
                    "username": u.username,
                    "email": u.email,
                    "created_at": u.created_at.isoformat() if u.created_at else None,
                } for u in users
            ],
            "credits_ledger": [
                {
                    "entry_id": c.entry_id,
                    "user_id": c.user_id,
                    "ref_log_id": c.ref_log_id,
                    "type": c.type,
                    "points": int(c.points or 0),
                    "reason": c.reason,
                    "meta_json": c.meta_json,
                    "created_at": c.created_at.isoformat() if c.created_at else None,
                } for c in credits
            ],
            "user_gardens": [
                {
                    "garden_id": g.garden_id,
                    "user_id": g.user_id,
                    "current_level_id": g.current_level_id,
                    "waters_count": g.waters_count,
                    "total_waters": g.total_waters,
                    "created_at": g.created_at.isoformat() if g.created_at else None,
                    "updated_at": g.updated_at.isoformat() if g.updated_at else None,
                } for g in gardens
            ],
            "garden_levels": [
                {
                    "level_id": lv.level_id,
                    "level_number": lv.level_number,
                    "level_name": lv.level_name,
                    "image_path": lv.image_path,
                    "required_waters": lv.required_waters,
                    "description": lv.description,
                } for lv in levels
            ],
            "mobility_logs": [
                {
                    "log_id": m.log_id,
                    "user_id": m.user_id,
                    "source_id": m.source_id,
                    "mode": m.mode,
                    "distance_km": float(m.distance_km or 0),
                    "started_at": m.started_at.isoformat() if m.started_at else None,
                    "ended_at": m.ended_at.isoformat() if m.ended_at else None,
                    "co2_saved_g": float(m.co2_saved_g or 0),
                    "points_earned": int(m.points_earned or 0) if m.points_earned is not None else 0,
                    "description": m.description,
                    "start_point": m.start_point,
                    "end_point": m.end_point,
                    "created_at": m.created_at.isoformat() if m.created_at else None,
                } for m in mobility_logs
            ],
        }

        return {
            "export_timestamp": now_utc_iso(),
            "total_records": sum(len(v) for v in data.values()),
            "data": data,
        }
    except Exception as e:
        logging.exception("Export 실패")
        raise HTTPException(status_code=500, detail=f"Export 중 오류: {e}")
