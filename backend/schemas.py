from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from decimal import Decimal
import enum

# =========================
# ENUM 정의
# =========================
class GroupType(str, enum.Enum):
    SCHOOL = "SCHOOL"
    COMPANY = "COMPANY"
    COMMUNITY = "COMMUNITY"
    ETC = "ETC"

class UserRole(str, enum.Enum):
    USER = "USER"
    ADMIN = "ADMIN"

class Mode(str, enum.Enum):
    BUS = "BUS"
    SUBWAY = "SUBWAY"
    BIKE = "BIKE"
    WALK = "WALK"
    CAR = "CAR"

class ChallengeScope(str, enum.Enum):
    PERSONAL = "PERSONAL"
    GROUP = "GROUP"

class ChallengeTarget(str, enum.Enum):
    ANY = "ANY"
    BUS = "BUS"
    SUBWAY = "SUBWAY"
    BIKE = "BIKE"
    WALK = "WALK"

class LedgerType(str, enum.Enum):
    EARN = "EARN"
    SPEND = "SPEND"
    ADJUST = "ADJUST"

class NotificationStatus(str, enum.Enum):
    PENDING = "PENDING"
    SENT = "SENT"
    READ = "READ"


# =========================
# 그룹(UserGroup)
# =========================
class UserGroupBase(BaseModel):
    group_name: str
    group_type: GroupType = GroupType.ETC
    region_code: Optional[str] = None

class UserGroupCreate(UserGroupBase):
    pass

class UserGroupRead(UserGroupBase):
    group_id: int
    created_at: datetime
    class Config:
        orm_mode = True


# =========================
# 사용자(User)
# =========================
class UserBase(BaseModel):
    username: str
    email: Optional[EmailStr] = None
    role: UserRole = UserRole.USER

class UserCreate(UserBase):
    password_hash: Optional[str] = None
    user_group_id: Optional[int] = None

class UserRead(UserBase):
    user_id: int     # PK는 user_id로 유지
    created_at: datetime
    user_group_id: Optional[int] = None
    class Config:
        orm_mode = True

# ✅ 추가: AI 맥락 조회용 스키마
class UserContext(BaseModel):
    username: str
    group_name: Optional[str] = None
    group_type: Optional[GroupType] = None


# =========================
# 탄소 배출 계수(CarbonFactor)
# =========================
class CarbonFactorBase(BaseModel):
    mode: Mode
    g_per_km: float
    valid_from: datetime
    valid_to: Optional[datetime] = datetime(9999, 12, 31)

class CarbonFactorCreate(CarbonFactorBase):
    pass

class CarbonFactorRead(CarbonFactorBase):
    factor_id: int
    class Config:
        orm_mode = True


# =========================
# 외부 소스(IngestSource)
# =========================
class IngestSourceBase(BaseModel):
    source_name: str
    description: Optional[str] = None

class IngestSourceCreate(IngestSourceBase):
    pass

class IngestSourceRead(IngestSourceBase):
    source_id: int
    class Config:
        orm_mode = True


# =========================
# 이동 기록(MobilityLog)
# =========================
class MobilityLogBase(BaseModel):
    mode: Mode
    distance_km: Decimal
    started_at: datetime
    ended_at: datetime
    raw_ref_id: Optional[str] = None
    co2_baseline_g: Optional[Decimal] = None
    co2_actual_g: Optional[Decimal] = None
    co2_saved_g: Optional[Decimal] = None

class MobilityLogCreate(MobilityLogBase):
    user_id: int
    source_id: Optional[int] = None

class MobilityLogRead(MobilityLogBase):
    log_id: int
    user_id: int
    source_id: Optional[int] = None
    created_at: datetime
    class Config:
        orm_mode = True


# =========================
# 포인트/크레딧(CreditsLedger)
# =========================
class CreditsLedgerBase(BaseModel):
    type: LedgerType
    points: int
    reason: str
    meta_json: Optional[dict] = None

class CreditsLedgerCreate(CreditsLedgerBase):
    user_id: int
    ref_log_id: Optional[int] = None

class CreditsLedgerRead(CreditsLedgerBase):
    entry_id: int
    user_id: int
    ref_log_id: Optional[int] = None
    created_at: datetime
    class Config:
        orm_mode = True


# =========================
# 챌린지(Challenge)
# =========================
class ChallengeBase(BaseModel):
    title: str
    description: Optional[str] = None
    scope: ChallengeScope = ChallengeScope.PERSONAL
    target_mode: ChallengeTarget = ChallengeTarget.ANY
    target_saved_g: int
    start_at: datetime
    end_at: datetime

class ChallengeCreate(ChallengeBase):
    created_by: Optional[int] = None

class ChallengeRead(ChallengeBase):
    challenge_id: int
    created_at: datetime
    class Config:
        orm_mode = True

class ChallengeMemberBase(BaseModel):
    challenge_id: int
    user_id: int

class ChallengeMemberRead(ChallengeMemberBase):
    joined_at: datetime
    class Config:
        orm_mode = True


# =========================
# 업적(Achievement)
# =========================
class AchievementBase(BaseModel):
    code: Optional[str] = None
    title: str
    description: Optional[str] = None

class AchievementCreate(AchievementBase):
    pass

class AchievementRead(AchievementBase):
    achievement_id: int
    class Config:
        orm_mode = True

class UserAchievementBase(BaseModel):
    user_id: int
    achievement_id: int

class UserAchievementRead(UserAchievementBase):
    granted_at: datetime
    class Config:
        orm_mode = True


# =========================
# 알림(Notification)
# =========================
class NotificationBase(BaseModel):
    title: str
    body: Optional[str] = None
    status: NotificationStatus = NotificationStatus.PENDING

class NotificationCreate(NotificationBase):
    user_id: int

class NotificationRead(NotificationBase):
    notification_id: int
    user_id: int
    created_at: datetime
    read_at: Optional[datetime]
    class Config:
        orm_mode = True


# =========================
# 원시 적재(IngestRaw)
# =========================
class IngestRawBase(BaseModel):
    source_id: int
    user_id: Optional[int] = None
    captured_at: datetime
    payload: dict

class IngestRawCreate(IngestRawBase):
    pass

class IngestRawRead(IngestRawBase):
    raw_id: int
    class Config:
        orm_mode = True


# =========================
# Mock API 스키마
# =========================
class ChatMessage(BaseModel):
    user_id: str
    message: str

class ChatResponse(BaseModel):
    response_message: str

class DashboardData(BaseModel):
    user_id: str
    co2_saved_today: float
    eco_credits_earned: int
    garden_level: int

class Activity(BaseModel):
    user_id: str
    activity_type: str  # e.g., 'subway', 'bike'
