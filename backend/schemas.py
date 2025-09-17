from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class CreditType(str, Enum):
    EARN = "EARN"
    SPEND = "SPEND"
    ADJUST = "ADJUST"

class TransportMode(str, Enum):
    BUS = "BUS"
    SUBWAY = "SUBWAY"
    BIKE = "BIKE"
    WALK = "WALK"
    CAR = "CAR"

class GardenStatusEnum(str, Enum):
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"

# 크레딧 관련 스키마
class CreditBalance(BaseModel):
    user_id: int
    total_points: int
    recent_earned: int
    last_updated: datetime

class CreditTransaction(BaseModel):
    entry_id: int
    type: CreditType
    points: int
    reason: str
    created_at: datetime
    meta: Optional[Dict[str, Any]] = None

class CreditHistory(BaseModel):
    user_id: int
    transactions: List[CreditTransaction]
    total_count: int

# 정원 관련 스키마
class GardenStatus(BaseModel):
    user_id: int
    level_number: int
    level_name: str
    image_path: str
    waters_count: int
    total_waters: int
    required_waters: int
    status: GardenStatusEnum

class WateringRequest(BaseModel):
    user_id: int
    points_spent: int = 10

class WateringResponse(BaseModel):
    success: bool
    garden_id: int
    waters_count: int
    total_waters: int
    level_up: bool
    new_level: Optional[str] = None
    points_spent: int
    remaining_points: int

# 대시보드 관련 스키마
class DashboardStats(BaseModel):
    user_id: int
    total_points: int
    total_co2_saved: float
    recent_activities: int
    garden_level: int
    garden_progress: int

class MobilityLog(BaseModel):
    log_id: int
    mode: TransportMode
    distance_km: float
    started_at: datetime
    ended_at: datetime
    co2_saved_g: float
    points_earned: int
    description: Optional[str] = None
    start_point: Optional[str] = None
    end_point: Optional[str] = None

# 챌린지 관련 스키마
class Challenge(BaseModel):
    challenge_id: int
    title: str
    description: Optional[str] = None
    scope: str
    target_mode: str
    target_saved_g: int
    start_at: datetime
    end_at: datetime
    created_by: Optional[int] = None
    created_at: datetime

class ChallengeMember(BaseModel):
    challenge_id: int
    user_id: int
    joined_at: datetime

# 업적 관련 스키마
class Achievement(BaseModel):
    achievement_id: int
    code: str
    title: str
    description: Optional[str] = None

class UserAchievement(BaseModel):
    user_id: int
    achievement_id: int
    granted_at: datetime

# 알림 관련 스키마
class Notification(BaseModel):
    notification_id: int
    user_id: int
    title: str
    body: Optional[str] = None
    status: str
    created_at: datetime
    read_at: Optional[datetime] = None

# 사용자 관련 스키마
class User(BaseModel):
    user_id: int
    username: str
    email: Optional[str] = None
    user_group_id: Optional[int] = None
    role: str
    created_at: datetime

class UserGroup(BaseModel):
    group_id: int
    group_name: str
    group_type: str
    region_code: Optional[str] = None
    created_at: datetime

# 탄소 배출 계수 스키마
class CarbonFactor(BaseModel):
    factor_id: int
    mode: TransportMode
    g_per_km: float
    valid_from: datetime
    valid_to: Optional[datetime] = None

# 통계 관련 스키마
class DailyStats(BaseModel):
    date: str
    co2_saved: float
    points_earned: int
    activities_count: int

class WeeklyStats(BaseModel):
    week_start: str
    week_end: str
    total_co2_saved: float
    total_points_earned: int
    total_activities: int
    daily_breakdown: List[DailyStats]

class MonthlyStats(BaseModel):
    month: str
    total_co2_saved: float
    total_points_earned: int
    total_activities: int
    weekly_breakdown: List[WeeklyStats]

# API 응답 스키마
class APIResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None

class ErrorResponse(BaseModel):
    success: bool = False
    error: str
    detail: Optional[str] = None