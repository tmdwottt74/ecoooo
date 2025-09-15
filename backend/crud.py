from sqlalchemy.orm import Session
from datetime import datetime, timezone # timezone import 추가
from . import models, schemas
from sqlalchemy import func # func import 추가


# =========================
# User 관련 (user_group_id -> group_name으로 수정)
# =========================
def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(
        username=user.username,
        email=user.email,
        password_hash=user.password_hash,
        group_name=user.group_name, # user_group_id -> group_name으로 수정
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# 기존 함수들은 그대로 유지
def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def get_user_by_id(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.user_id == user_id).first()


# =========================
# MobilityLog 관련
# =========================
def create_mobility_log(db: Session, log: schemas.MobilityLogCreate):
    # MobilityLog 모델에 맞게 속성명 수정
    db_log = models.MobilityLog(
        user_id=log.user_id,
        mode=log.mode,
        distance_km=log.distance_km,
        duration_min=log.duration_min,
        co2_saved_g=log.co2_saved_g,
        points_earned=log.points_earned,
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

def get_mobility_logs(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return (
        db.query(models.MobilityLog)
        .filter(models.MobilityLog.user_id == user_id)
        .offset(skip)
        .limit(limit)
        .all()
    )


# =========================
# CreditsLedger 관련
# =========================
def add_credits(db: Session, entry: schemas.CreditsLedgerCreate):
    db_entry = models.CreditsLedger(
        user_id=entry.user_id,
        ref_log_id=entry.ref_log_id,
        type=entry.type,
        points=entry.points,
        reason=entry.reason,
        meta_json=entry.meta_json,
    )
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

def get_user_points(db: Session, user_id: int):
    # SQLAlchemy의 sum 함수를 사용하여 DB에서 직접 합산
    total_points = db.query(func.sum(models.CreditsLedger.points)).filter(
        models.CreditsLedger.user_id == user_id
    ).scalar()
    # 결과가 None일 경우 0으로 반환
    return total_points if total_points is not None else 0


# =========================
# Challenge 관련 (속성명 수정 및 joined_at 수정)
# =========================
def create_challenge(db: Session, ch: schemas.ChallengeCreate):
    db_challenge = models.Challenge(
        name=ch.name, # title -> name
        description=ch.description,
        target_value=ch.target_value,
        reward_points=ch.reward_points,
        start_date=ch.start_date,
        end_date=ch.end_date,
    )
    db.add(db_challenge)
    db.commit()
    db.refresh(db_challenge)
    return db_challenge

def join_challenge(db: Session, challenge_id: int, user_id: int):
    db_member = models.ChallengeMember(
        challenge_id=challenge_id,
        user_id=user_id,
        joined_at=datetime.now(timezone.utc), # utcnow() 대신 timezone을 사용
    )
    db.add(db_member)
    db.commit()
    return db_member


# =========================
# Achievement 관련
# =========================
def grant_achievement(db: Session, user_id: int, achievement_id: int):
    db_ua = models.UserAchievement(user_id=user_id, achievement_id=achievement_id)
    db.add(db_ua)
    db.commit()
    return db_ua


# =========================
# Notification 관련
# =========================
def create_notification(db: Session, note: schemas.NotificationCreate):
    db_note = models.Notification(
        user_id=note.user_id,
        title=note.title,
        body=note.body,
        status=note.status,
    )
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note

def get_notifications(db: Session, user_id: int, only_unread: bool = False):
    q = db.query(models.Notification).filter(models.Notification.user_id == user_id)
    if only_unread:
        q = q.filter(models.Notification.status != "READ")
    return q.all()