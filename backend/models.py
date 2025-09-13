from sqlalchemy import (
    String, Integer, BigInteger, DECIMAL, TIMESTAMP, DATETIME,
    ForeignKey, Enum, JSON, func
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .database import Base
import enum
from datetime import datetime
from decimal import Decimal


# 그룹 타입
class GroupType(str, enum.Enum):
    SCHOOL = "SCHOOL"
    COMPANY = "COMPANY"
    COMMUNITY = "COMMUNITY"
    ETC = "ETC"


# 사용자 역할
class UserRole(str, enum.Enum):
    USER = "USER"
    ADMIN = "ADMIN"


# 이동 수단
class Mode(str, enum.Enum):
    BUS = "BUS"
    SUBWAY = "SUBWAY"
    BIKE = "BIKE"
    WALK = "WALK"
    CAR = "CAR"


# 그룹(소속)
class UserGroup(Base):
    __tablename__ = "user_groups"

    group_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    group_name: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)
    group_type: Mapped[GroupType] = mapped_column(Enum(GroupType), default=GroupType.ETC)
    region_code: Mapped[str | None] = mapped_column(String(10))
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default=func.current_timestamp())

    users: Mapped[list["User"]] = relationship("User", back_populates="group")


# 사용자
class User(Base):
    __tablename__ = "users"

    user_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    email: Mapped[str | None] = mapped_column(String(120), unique=True)
    password_hash: Mapped[str | None] = mapped_column(String(255))
    user_group_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("user_groups.group_id", ondelete="SET NULL"))
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.USER)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default=func.current_timestamp())

    group: Mapped["UserGroup"] = relationship("UserGroup", back_populates="users")
    logs: Mapped[list["MobilityLog"]] = relationship("MobilityLog", back_populates="user")
    ledger: Mapped[list["CreditsLedger"]] = relationship("CreditsLedger", back_populates="user")
    challenges: Mapped[list["ChallengeMember"]] = relationship("ChallengeMember", back_populates="user")
    achievements: Mapped[list["UserAchievement"]] = relationship("UserAchievement", back_populates="user")
    notifications: Mapped[list["Notification"]] = relationship("Notification", back_populates="user")


# 탄소 배출 계수
class CarbonFactor(Base):
    __tablename__ = "carbon_factors"

    factor_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    mode: Mapped[Mode] = mapped_column(Enum(Mode), nullable=False)
    g_per_km: Mapped[float] = mapped_column(DECIMAL(10, 3), nullable=False)
    valid_from: Mapped[datetime] = mapped_column(DATETIME, nullable=False)
    valid_to: Mapped[datetime] = mapped_column(DATETIME, default=datetime(9999, 12, 31))


# 외부 연동 소스
class IngestSource(Base):
    __tablename__ = "ingest_sources"

    source_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    source_name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(String(255))

    logs: Mapped[list["MobilityLog"]] = relationship("MobilityLog", back_populates="source")
    raws: Mapped[list["IngestRaw"]] = relationship("IngestRaw", back_populates="source")


# 이동 기록
class MobilityLog(Base):
    __tablename__ = "mobility_logs"

    log_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    source_id: Mapped[int | None] = mapped_column(ForeignKey("ingest_sources.source_id", ondelete="SET NULL"))
    mode: Mapped[Mode] = mapped_column(Enum(Mode), nullable=False)
    distance_km: Mapped[Decimal] = mapped_column(DECIMAL(8, 3), nullable=False)
    started_at: Mapped[datetime] = mapped_column(DATETIME, nullable=False)
    ended_at: Mapped[datetime] = mapped_column(DATETIME, nullable=False)
    raw_ref_id: Mapped[str | None] = mapped_column(String(100))
    co2_baseline_g: Mapped[Decimal | None] = mapped_column(DECIMAL(12, 3))
    co2_actual_g: Mapped[Decimal | None] = mapped_column(DECIMAL(12, 3))
    co2_saved_g: Mapped[Decimal | None] = mapped_column(DECIMAL(12, 3))
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default=func.current_timestamp())

    user: Mapped["User"] = relationship("User", back_populates="logs")
    source: Mapped["IngestSource"] = relationship("IngestSource", back_populates="logs")
    ledger: Mapped[list["CreditsLedger"]] = relationship("CreditsLedger", back_populates="log")


# 포인트/크레딧 장부
class CreditsLedger(Base):
    __tablename__ = "credits_ledger"

    entry_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.user_id", ondelete="CASCADE"))
    ref_log_id: Mapped[int | None] = mapped_column(ForeignKey("mobility_logs.log_id", ondelete="SET NULL"))
    type: Mapped[str] = mapped_column(Enum("EARN", "SPEND", "ADJUST", name="ledger_type"), nullable=False)
    points: Mapped[int] = mapped_column(Integer, nullable=False)
    reason: Mapped[str] = mapped_column(String(120), nullable=False)
    meta_json: Mapped[dict | None] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default=func.current_timestamp())

    user: Mapped["User"] = relationship("User", back_populates="ledger")
    log: Mapped["MobilityLog"] = relationship("MobilityLog", back_populates="ledger")


# 챌린지
class Challenge(Base):
    __tablename__ = "challenges"

    challenge_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(String(255))
    scope: Mapped[str] = mapped_column(Enum("PERSONAL", "GROUP", name="challenge_scope"), default="PERSONAL")
    target_mode: Mapped[str] = mapped_column(Enum("ANY", "BUS", "SUBWAY", "BIKE", "WALK", name="challenge_target"), default="ANY")
    target_saved_g: Mapped[int] = mapped_column(Integer, nullable=False)
    start_at: Mapped[datetime] = mapped_column(DATETIME, nullable=False)
    end_at: Mapped[datetime] = mapped_column(DATETIME, nullable=False)
    created_by: Mapped[int | None] = mapped_column(ForeignKey("users.user_id", ondelete="SET NULL"))
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default=func.current_timestamp())

    members: Mapped[list["ChallengeMember"]] = relationship("ChallengeMember", back_populates="challenge")


class ChallengeMember(Base):
    __tablename__ = "challenge_members"

    challenge_id: Mapped[int] = mapped_column(ForeignKey("challenges.challenge_id", ondelete="CASCADE"), primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.user_id", ondelete="CASCADE"), primary_key=True)
    joined_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default=func.current_timestamp())

    challenge: Mapped["Challenge"] = relationship("Challenge", back_populates="members")
    user: Mapped["User"] = relationship("User", back_populates="challenges")


# 업적/뱃지
class Achievement(Base):
    __tablename__ = "achievements"

    achievement_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    code: Mapped[str | None] = mapped_column(String(50), unique=True)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(String(255))

    users: Mapped[list["UserAchievement"]] = relationship("UserAchievement", back_populates="achievement")


class UserAchievement(Base):
    __tablename__ = "user_achievements"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.user_id", ondelete="CASCADE"), primary_key=True)
    achievement_id: Mapped[int] = mapped_column(ForeignKey("achievements.achievement_id", ondelete="CASCADE"), primary_key=True)
    granted_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default=func.current_timestamp())

    user: Mapped["User"] = relationship("User", back_populates="achievements")
    achievement: Mapped["Achievement"] = relationship("Achievement", back_populates="users")


# 알림
class Notification(Base):
    __tablename__ = "notifications"

    notification_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.user_id", ondelete="CASCADE"))
    title: Mapped[str] = mapped_column(String(120), nullable=False)
    body: Mapped[str | None] = mapped_column(String(500))
    status: Mapped[str] = mapped_column(Enum("PENDING", "SENT", "READ", name="notify_status"), default="PENDING")
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default=func.current_timestamp())
    read_at: Mapped[datetime | None] = mapped_column(DATETIME)

    user: Mapped["User"] = relationship("User", back_populates="notifications")


# 원시 적재
class IngestRaw(Base):
    __tablename__ = "ingest_raw"

    raw_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    source_id: Mapped[int] = mapped_column(ForeignKey("ingest_sources.source_id", ondelete="CASCADE"))
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.user_id", ondelete="SET NULL"))
    captured_at: Mapped[datetime] = mapped_column(DATETIME, nullable=False)
    payload: Mapped[dict] = mapped_column(JSON, nullable=False)

    source: Mapped["IngestSource"] = relationship("IngestSource", back_populates="raws")
    user: Mapped["User"] = relationship("User")
