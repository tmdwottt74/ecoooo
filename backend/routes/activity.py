from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import date

from backend.database import get_db
from backend.dependencies import get_current_user
from backend.models import User, CreditsLedger, RewardedActivity # RewardedActivity 모델 임포트

# NOTE: In a real application, these schemas should be in schemas.py
class ActivityVerificationRequest(BaseModel):
    message: str

class ActivityVerificationResponse(BaseModel):
    verified: bool
    message: str
    bonus_credits: Optional[int] = None

router = APIRouter(
    prefix="/api",
    tags=["activity"],
)

@router.post("/verify-activity", response_model=ActivityVerificationResponse)
async def verify_activity(
    request: ActivityVerificationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Verifies a user's activity claim from the chatbot, checks for duplicate rewards,
    and awards bonus credits if applicable.
    """
    user_id = current_user.user_id
    message = request.message.lower()
    today = date.today()

    # 1. Simulate activity verification based on message content
    activity_type = None
    bonus_credits = 0
    is_verified = False

    if "자전거" in message:
        activity_type = "chatbot_bike_bonus"
        bonus_credits = 20  # As per the example
        is_verified = True # Assume verification passed
    elif "걸었" in message:
        # As per the example, this fails verification
        is_verified = False
        return ActivityVerificationResponse(
            verified=False,
            message="기록과 일치하지 않습니다. 활동이 확인되지 않아 크레딧을 지급할 수 없습니다."
        )
    else:
        # Not a message we can verify
        return ActivityVerificationResponse(
            verified=False,
            message="어떤 활동을 하셨는지 더 자세히 말씀해주시겠어요? 예: '오늘 자전거 탔어'"
        )

    # 2. Check for prior rewards for this activity type today (no double-dipping)
    if is_verified and activity_type:
        existing_reward = db.query(RewardedActivity).filter(
            RewardedActivity.user_id == user_id,
            RewardedActivity.activity_type == activity_type,
            RewardedActivity.reward_date == today
        ).first()

        if existing_reward:
            return ActivityVerificationResponse(
                verified=True,
                message=f"오늘의 {activity_type.replace('_', ' ')} 보너스는 이미 지급받으셨어요. 내일 또 참여해주세요!"
            )

    # 3. Award credits and log the reward
    if is_verified and bonus_credits > 0:
        try:
            # Add points to the credits ledger
            credit_entry = CreditsLedger(
                user_id=user_id,
                type="EARN",
                points=bonus_credits,
                reason=activity_type,
                meta_json={"source": "chatbot_verification"}
            )
            db.add(credit_entry)

            # Log the reward to prevent double-dipping
            reward_log = RewardedActivity(
                user_id=user_id,
                activity_type=activity_type,
                reward_date=today,
                bonus_credits=bonus_credits
            )
            db.add(reward_log)

            db.commit()

            return ActivityVerificationResponse(
                verified=True,
                message=f"자전거 이용이 확인되었습니다. 오늘의 추가 크레딧 {bonus_credits}점을 지급합니다!",
                bonus_credits=bonus_credits
            )
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"크레딧 지급 중 오류가 발생했습니다: {e}")

    # This part should not be reached if logic is correct, but as a fallback
    return ActivityVerificationResponse(
        verified=False,
        message="활동을 확인하지 못했습니다."
    )
