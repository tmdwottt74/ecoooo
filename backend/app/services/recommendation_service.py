import pandas as pd
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime

from .. import models, schemas

class RecommendationService:
    def __init__(self, db: Session):
        self.db = db

    def get_user_mobility_data(self, user_id: int) -> pd.DataFrame:
        """
        특정 사용자의 이동 기록 데이터를 가져와 DataFrame으로 반환합니다.
        """
        mobility_logs = self.db.query(models.MobilityLog).filter(
            models.MobilityLog.user_id == user_id
        ).all()
        
        data = [{
            "log_id": log.log_id,
            "user_id": log.user_id,
            "mode": log.mode,
            "distance_km": float(log.distance_km),
            "co2_saved_g": float(log.co2_saved_g),
            "started_at": log.started_at
        } for log in mobility_logs]
        
        return pd.DataFrame(data)

    def get_all_challenges(self) -> pd.DataFrame:
        """
        모든 챌린지 데이터를 가져와 DataFrame으로 반환합니다.
        """
        challenges = self.db.query(models.Challenge).all()
        
        data = [{
            "challenge_id": ch.challenge_id,
            "title": ch.title,
            "description": ch.description,
            "scope": ch.scope,
            "target_mode": ch.target_mode,
            "target_saved_g": float(ch.target_saved_g),
            "start_at": ch.start_at,
            "end_at": ch.end_at
        } for ch in challenges]
        
        return pd.DataFrame(data)

    def recommend_challenges_for_user(self, user_id: int, limit: int = 5) -> List[schemas.Challenge]:
        """
        사용자에게 챌린지를 추천합니다. (초기 간단한 로직)
        - 사용자의 최근 이동 패턴을 분석하여 선호하는 이동 수단과 관련된 챌린지 추천
        - 또는 단순히 인기 있는 챌린지, 새로 생성된 챌린지 추천
        """
        user_mobility_df = self.get_user_mobility_data(user_id)
        all_challenges_df = self.get_all_challenges()

        if user_mobility_df.empty:
            # 이동 기록이 없는 경우, 최근 생성된 챌린지 또는 인기 챌린지 추천
            recommended_challenges_df = all_challenges_df.sort_values(by="created_at", ascending=False).head(limit)
        else:
            # 사용자가 가장 많이 이용한 이동 수단 파악
            most_frequent_mode = user_mobility_df["mode"].mode()[0]
            
            # 현재 진행 중인 챌린지 필터링
            now = datetime.now()
            active_challenges = all_challenges_df[
                (all_challenges_df["start_at"] <= now) &
                (all_challenges_df["end_at"] >= now)
            ]

            # 해당 이동 수단과 관련된 챌린지 필터링
            mode_specific_challenges = active_challenges[
                (active_challenges["target_mode"] == most_frequent_mode) |
                (active_challenges["target_mode"] == "ANY")
            ]
            
            if mode_specific_challenges.empty:
                # 관련 챌린지가 없으면, 모든 활성 챌린지 중 최근 생성된 챌린지 추천
                recommended_challenges_df = active_challenges.sort_values(by="created_at", ascending=False).head(limit)
            else:
                # 절감 목표가 사용자 평균 절감량과 유사한 챌린지 우선 추천 (간단한 예시)
                avg_saved_g = user_mobility_df["co2_saved_g"].mean()
                mode_specific_challenges["target_diff"] = abs(mode_specific_challenges["target_saved_g"] - avg_saved_g)
                recommended_challenges_df = mode_specific_challenges.sort_values(by="target_diff").head(limit)

        # 추천된 챌린지 ID를 기반으로 ORM 객체 조회
        recommended_challenge_ids = recommended_challenges_df["challenge_id"].tolist()
        recommended_challenges = self.db.query(models.Challenge).filter(
            models.Challenge.challenge_id.in_(recommended_challenge_ids)
        ).all()
        
        return [schemas.Challenge.model_validate(ch) for ch in recommended_challenges]
