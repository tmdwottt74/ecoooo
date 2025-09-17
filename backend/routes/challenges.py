# routes/challenges.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from .. import database

router = APIRouter()

@router.get("/challenges/{user_id}")
def get_challenges(user_id: int, db: Session = Depends(database.get_db)):
    """
    챌린지 목록을 반환합니다. 스키마에 진행률/보상 컬럼이 없으므로
    현재는 사용자 진행률을 임의 계산하여 반환합니다.
    """
    query = text(
        """
        SELECT c.challenge_id, c.title, c.description,
               COALESCE(SUM(ml.co2_saved_g), 0) AS saved_g
        FROM challenges c
        LEFT JOIN challenge_members cm ON cm.challenge_id = c.challenge_id AND cm.user_id = :uid
        LEFT JOIN mobility_logs ml ON ml.user_id = :uid
        GROUP BY c.challenge_id, c.title, c.description
        ORDER BY c.challenge_id
        """
    )
    rows = db.execute(query, {"uid": user_id}).fetchall()

    result = []
    for r in rows:
        # saved_g를 바탕으로 진행률(임의) 계산: 목표 10,000g
        progress = min(100, int(float(r[3]) / 10000 * 100))
        reward = "에코 크레딧 100P"
        result.append({
            "id": int(r[0]),
            "title": r[1],
            "description": r[2],
            "progress": progress,
            "reward": reward,
        })

    # 비어있을 경우 더미 반환
    if not result:
        result = [
            {"id": 1, "title": "9월 대중교통 챌린지", "description": "지하철/버스 이용으로 CO₂ 절감", "progress": 40, "reward": "에코 크레딧 100P"}
        ]
    return result


@router.get("/achievements/{user_id}")
def get_achievements(user_id: int, db: Session = Depends(database.get_db)):
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
