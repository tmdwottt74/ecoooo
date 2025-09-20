from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text, func # func 추가
from typing import List
from datetime import datetime

from .. import database, models, schemas
from ..dependencies import get_current_user
from ..models import MobilityLog, TransportMode # MobilityLog, TransportMode 추가

# /api/challenges 경로로 설정
router = APIRouter(
    prefix="/api/challenges",
    tags=["Challenges"]
)

# 챌린지 참여 요청을 위한 Pydantic 모델
class ChallengeJoinRequest(schemas.BaseModel):
    # user_id는 JWT에서 추출하므로 더 이상 요청 본문에 필요 없음
    pass

@router.post("/{challenge_id}/join")
def join_challenge(
    challenge_id: int, 
    request: ChallengeJoinRequest, 
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    """
    사용자를 챌린지에 참여시킵니다.
    이미 참여한 경우 오류를 반환합니다.
    """
    user_id = current_user.user_id
    # 1. 챌린지 존재 여부 확인
    challenge = db.query(models.Challenge).filter(models.Challenge.challenge_id == challenge_id).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")

    # 2. 사용자 존재 여부 확인 (current_user로 이미 확인됨)
    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 3. 이미 참여했는지 확인 (핵심 버그 수정)
    existing_member = db.query(models.ChallengeMember).filter(
        models.ChallengeMember.challenge_id == challenge_id,
        models.ChallengeMember.user_id == user_id
    ).first()

    if existing_member:
        raise HTTPException(status_code=400, detail="Already joined this challenge")

    # 4. 새 참여자로 등록
    new_member = models.ChallengeMember(
        challenge_id=challenge_id,
        user_id=user_id
    )
    db.add(new_member)
    db.commit()

    return {"message": f"Successfully joined challenge '{challenge.title}'"}


@router.get("/", response_model=List[schemas.FrontendChallenge])
def get_challenges(current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    """
    사용자의 챌린지 목록과 참여 상태를 반환합니다.
    """
    user_id = current_user.user_id
    # 모든 챌린지 목록을 가져옴
    all_challenges = db.query(models.Challenge).order_by(models.Challenge.challenge_id).all()
    
    # 사용자가 참여한 챌린지 ID 목록을 가져옴
    joined_challenge_memberships = db.query(models.ChallengeMember).filter(models.ChallengeMember.user_id == user_id).all()
    joined_challenge_ids = {member.challenge_id for member in joined_challenge_memberships}
    joined_challenge_map = {member.challenge_id: member for member in joined_challenge_memberships}

    result = []
    for c in all_challenges:
        progress = 0 
        is_joined = c.challenge_id in joined_challenge_ids
        completed_at = None

        if is_joined:
            membership = joined_challenge_map[c.challenge_id]
            completed_at = membership.completed_at

            if c.completion_type == models.ChallengeCompletionType.AUTO:
                current_progress_value = 0
                
                mobility_logs_query = db.query(MobilityLog).filter(
                    MobilityLog.user_id == user_id,
                    MobilityLog.started_at >= c.start_at,
                    MobilityLog.started_at <= c.end_at
                )

                if c.target_distance_km is not None and c.target_distance_km > 0:
                    # Calculate progress based on distance
                    if c.target_mode == TransportMode.ANY:
                        current_progress_value = mobility_logs_query.with_entities(
                            func.sum(MobilityLog.distance_km)
                        ).scalar() or 0
                    else:
                        current_progress_value = mobility_logs_query.filter(
                            MobilityLog.mode == c.target_mode
                        ).with_entities(
                            func.sum(MobilityLog.distance_km)
                        ).scalar() or 0
                    
                    if c.target_distance_km > 0:
                        progress = (current_progress_value / c.target_distance_km) * 100
                    else:
                        progress = 0
                elif c.target_saved_g is not None and c.target_saved_g > 0:
                    # Calculate progress based on CO2 saved (existing logic)
                    if c.target_mode == TransportMode.ANY:
                        current_progress_value = mobility_logs_query.with_entities(
                            func.sum(MobilityLog.co2_saved_g)
                        ).scalar() or 0
                    else:
                        current_progress_value = mobility_logs_query.filter(
                            MobilityLog.mode == c.target_mode
                        ).with_entities(
                            func.sum(MobilityLog.co2_saved_g)
                        ).scalar() or 0
                    
                    if c.target_saved_g > 0:
                        progress = (current_progress_value / c.target_saved_g) * 100
                    else:
                        progress = 0
                else:
                    progress = 0 # No target defined or target is zero

                progress = min(100, progress) # Cap progress at 100%
            elif c.completion_type == models.ChallengeCompletionType.MANUAL:
                progress = 100 if completed_at else 0

        result.append({
            "id": c.challenge_id,
            "title": c.title,
            "description": c.description,
            "progress": round(progress), # Round to integer for FrontendChallenge schema
            "reward": c.reward,
            "is_joined": is_joined,
            "completion_type": c.completion_type,
            "completed_at": completed_at,
            "target_mode": c.target_mode,
            "target_saved_g": c.target_saved_g,
            "target_distance_km": c.target_distance_km
        })

    return result


@router.get("/achievements", response_model=List[dict])
def get_achievements(current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    user_id = current_user.user_id
    query = text(
        """
        SELECT a.achievement_id, a.title, a.description, ua.granted_at
        FROM achievements a
        LEFT JOIN user_achievements ua
          ON ua.achievement_id = a.achievement_id AND ua.user_id = :uid
        ORDER BY a.achievement_id
        """
    )
    rows = db.execute(query, {"uid": user_id}).fetchall()
    result = []
    for r in rows:
        result.append({
            "id": int(r[0]),
            "name": r[1],
            "desc": r[2],
            "date": str(r[3]) if r[3] else None,
            "unlocked": bool(r[3]),
            "progress": 100 if r[3] else 50,  # 임시 진행률
        })
    if not result:
        result = [
            {"id": 1, "name": "첫 친환경 이동", "desc": "첫 이동기록을 등록했습니다", "unlocked": True, "date": "2025-09-10", "progress": 100}
        ]
    return result

@router.post("/{challenge_id}/complete")
def complete_manual_challenge(
    challenge_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    """
    Manually completes a challenge for a user and awards credits.
    This is for simple challenges suggested by the AI.
    """
    user_id = current_user.user_id

    # 1. Find the challenge and the user's membership
    membership = db.query(models.ChallengeMember).filter(
        models.ChallengeMember.challenge_id == challenge_id,
        models.ChallengeMember.user_id == user_id
    ).first()

    if not membership:
        raise HTTPException(status_code=404, detail="You are not a member of this challenge.")

    challenge = db.query(models.Challenge).filter(models.Challenge.challenge_id == challenge_id).first()

    # 2. Check if the challenge is manual and not already completed
    if challenge.completion_type != models.ChallengeCompletionType.MANUAL:
        raise HTTPException(status_code=400, detail="This challenge cannot be completed manually.")

    if membership.completed_at is not None:
        raise HTTPException(status_code=400, detail="You have already completed this challenge.")

    # 3. Award credits
    try:
        # Parse reward points from the string (e.g., "20C" -> 20)
        reward_points = int("".join(filter(str.isdigit, challenge.reward)))
    except (ValueError, TypeError):
        raise HTTPException(status_code=500, detail="Invalid reward format in challenge data.")

    if reward_points > 0:
        credit_entry = models.CreditsLedger(
            user_id=user_id,
            type="EARN",
            points=reward_points,
            reason=f"챌린지 완료: {challenge.title}",
            meta_json={"challenge_id": challenge.challenge_id}
        )
        db.add(credit_entry)

    # 4. Mark challenge as completed for the user
    membership.completed_at = datetime.utcnow()

    db.commit()

    return {"message": f"'{challenge.title}' 챌린지를 완료하고 {reward_points}C를 획득했습니다!"}