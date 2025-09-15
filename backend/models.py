from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, DECIMAL, Text
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime


# =========================
# 그룹(UserGroup)
# =========================
class UserGroup(Base):
    __tablename__ = "user_groups"
    group_id = Column(Integer, primary_key=True, index=True)
    group_name = Column(String(255), unique=True, nullable=False)
    group_type = Column(String(50), default="ETC")   # SCHOOL/COMPANY/COMMUNITY/ETC
    region_code = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    users = relationship("User", back_populates="group")


# =========================
# 사용자(User)
# =========================
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(255), unique=True, index=True)
    email = Column(String(255), unique=True)
    password_hash = Column(String(255))
    role = Column(String(50), default="USER")
    created_at = Column(DateTime, default=datetime.utcnow)

    user_group_id = Column(Integer, ForeignKey("user_groups.group_id"))
    group = relationship("UserGroup", back_populates="users")


# =========================
# 이동 기록(MobilityLog)
# =========================
class MobilityLog(Base):
    __tablename__ = "mobility_logs"
    log_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    mode = Column(String(20), nullable=False)  # BUS, SUBWAY, BIKE, WALK, CAR
    distance_km = Column(DECIMAL(6, 2), nullable=False)
    started_at = Column(DateTime)
    ended_at = Column(DateTime)
    raw_ref_id = Column(String(255))
    co2_baseline_g = Column(DECIMAL(10, 2))
    co2_actual_g = Column(DECIMAL(10, 2))
    co2_saved_g = Column(DECIMAL(10, 2))
    created_at = Column(DateTime, default=datetime.utcnow)


# =========================
# 포인트 장부(CreditsLedger)
# =========================
class CreditsLedger(Base):
    __tablename__ = "credits_ledger"
    entry_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    ref_log_id = Column(Integer, ForeignKey("mobility_logs.log_id"))
    type = Column(String(20))  # EARN/SPEND/ADJUST
    points = Column(Integer)
    reason = Column(Text)
    meta_json = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)


# =========================
# 챌린지(Challenge + Member)
# =========================
class Challenge(Base):
    __tablename__ = "challenges"
    challenge_id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255))
    description = Column(Text)
    scope = Column(String(20), default="PERSONAL")    # PERSONAL/GROUP
    target_mode = Column(String(20), default="ANY")   # ANY/BUS/SUBWAY...
    target_saved_g = Column(Integer)
    start_at = Column(DateTime)
    end_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)


class ChallengeMember(Base):
    __tablename__ = "challenge_members"
    id = Column(Integer, primary_key=True, index=True)
    challenge_id = Column(Integer, ForeignKey("challenges.challenge_id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    joined_at = Column(DateTime, default=datetime.utcnow)


# =========================
# 업적(Achievement + UserAchievement)
# =========================
class Achievement(Base):
    __tablename__ = "achievements"
    achievement_id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True)
    title = Column(String(255))
    description = Column(Text)


class UserAchievement(Base):
    __tablename__ = "user_achievements"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    achievement_id = Column(Integer, ForeignKey("achievements.achievement_id"))
    granted_at = Column(DateTime, default=datetime.utcnow)


# =========================
# 알림(Notification)
# =========================
class Notification(Base):
    __tablename__ = "notifications"
    notification_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String(255))
    body = Column(Text)
    status = Column(String(20), default="PENDING")
    created_at = Column(DateTime, default=datetime.utcnow)
    read_at = Column(DateTime, nullable=True)


# =========================
# 원시 데이터(IngestSource + IngestRaw)
# =========================
class IngestSource(Base):
    __tablename__ = "ingest_sources"
    source_id = Column(Integer, primary_key=True, index=True)
    source_name = Column(String(255))
    description = Column(Text)


class IngestRaw(Base):
    __tablename__ = "ingest_raw"
    raw_id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, ForeignKey("ingest_sources.source_id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    captured_at = Column(DateTime, default=datetime.utcnow)
    payload = Column(Text)
