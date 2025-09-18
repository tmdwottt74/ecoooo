-- Ecooo 시드 데이터
-- 프로토타입 사용자 및 초기 데이터

-- 프로토타입 사용자 생성
INSERT OR IGNORE INTO users (user_id, username, email) VALUES 
(1, '김에코', 'kim.eco@ecooo.com'),
(2, '이그린', 'lee.green@ecooo.com'),
(3, '박지구', 'park.earth@ecooo.com');

-- 정원 레벨 데이터
INSERT OR IGNORE INTO garden_levels (level_number, level_name, image_path, required_waters, description) VALUES 
(1, '씨앗 단계', '/0.png', 10, '작은 씨앗이 땅에 심어졌습니다'),
(2, '싹 트는 단계', '/1.png', 10, '작은 싹이 돋아나기 시작했습니다'),
(3, '새싹 단계', '/2.png', 10, '초록 새싹이 자라나고 있습니다'),
(4, '어린 줄기 단계', '/3.png', 10, '줄기가 자라나고 있습니다'),
(5, '잎 전개 단계', '/4.png', 10, '잎이 펼쳐지기 시작했습니다'),
(6, '꽃봉오리 단계', '/5.png', 10, '꽃봉오리가 맺혔습니다'),
(7, '꽃 단계', '/6.png', 10, '아름다운 꽃이 피었습니다'),
(8, '어린 나무 단계', '/7.png', 10, '작은 나무가 되었습니다'),
(9, '자라는 나무 단계', '/8.png', 10, '나무가 더욱 자라고 있습니다'),
(10, '우거진 나무 단계', '/9.png', 10, '우거진 나무가 되었습니다'),
(11, '정원 완성 단계', '/10.png', 10, '완벽한 정원이 완성되었습니다');

-- 초기 크레딧 원장 데이터 (총합 1240C)
INSERT OR IGNORE INTO credits_ledger (user_id, type, points, reason, meta_json, created_at) VALUES 
(1, 'EARN', 90, '회원가입 보너스', '{"type": "signup_bonus"}', '2024-01-01 00:00:00'),
(1, 'EARN', 150, '지하철 이용 (강남역 → 홍대입구역)', '{"activity": "subway", "distance": 8.5, "co2_saved": 150}', '2024-01-15 08:30:00'),
(1, 'EARN', 80, '자전거 이용 (30분)', '{"activity": "bicycle", "duration": 30, "co2_saved": 80}', '2024-01-15 18:30:00'),
(1, 'EARN', 50, '도보 이동 (15분)', '{"activity": "walking", "duration": 15, "co2_saved": 50}', '2024-01-15 19:15:00'),
(1, 'EARN', 100, '지하철 이용 (홍대입구역 → 강남역)', '{"activity": "subway", "distance": 8.5, "co2_saved": 100}', '2024-01-16 09:00:00'),
(1, 'EARN', 120, '버스 이용 (강남역 → 신논현역)', '{"activity": "bus", "distance": 2.1, "co2_saved": 120}', '2024-01-16 18:00:00'),
(1, 'EARN', 100, '일일 챌린지 완료', '{"challenge_type": "daily", "challenge_id": 1}', '2024-01-16 23:59:00'),
(1, 'EARN', 150, '주간 챌린지 완료', '{"challenge_type": "weekly", "challenge_id": 2}', '2024-01-21 23:59:00'),
(1, 'SPEND', -10, 'GARDEN_WATERING', '{"garden_id": 1, "watering_count": 1}', '2024-01-17 10:00:00'),
(1, 'SPEND', -10, 'GARDEN_WATERING', '{"garden_id": 1, "watering_count": 2}', '2024-01-18 10:00:00'),
(1, 'SPEND', -10, 'GARDEN_WATERING', '{"garden_id": 1, "watering_count": 3}', '2024-01-19 10:00:00'),
(1, 'SPEND', -10, 'GARDEN_WATERING', '{"garden_id": 1, "watering_count": 4}', '2024-01-20 10:00:00'),
(1, 'SPEND', -10, 'GARDEN_WATERING', '{"garden_id": 1, "watering_count": 5}', '2024-01-21 10:00:00'),
(1, 'SPEND', -10, 'GARDEN_WATERING', '{"garden_id": 1, "watering_count": 6}', '2024-01-22 10:00:00'),
(1, 'SPEND', -10, 'GARDEN_WATERING', '{"garden_id": 1, "watering_count": 7}', '2024-01-23 10:00:00');

-- 사용자 정원 데이터 초기화
INSERT OR IGNORE INTO user_gardens (user_id, current_level_id, waters_count, total_waters) VALUES 
(1, 3, 7, 27), -- 3단계, 7번 물주기, 총 27번
(2, 2, 4, 14), -- 2단계, 4번 물주기, 총 14번
(3, 4, 12, 42); -- 4단계, 12번 물주기, 총 42번

-- 탄소 배출 계수 데이터
INSERT OR IGNORE INTO carbon_factors (mode, g_per_km, valid_from) VALUES 
('BUS', 89.0, '2024-01-01'),
('SUBWAY', 22.0, '2024-01-01'),
('BIKE', 0.0, '2024-01-01'),
('WALK', 0.0, '2024-01-01'),
('CAR', 192.0, '2024-01-01');

-- 수집 소스 데이터
INSERT OR IGNORE INTO ingest_sources (source_name, description) VALUES 
('manual', '사용자 직접 입력'),
('api', '외부 API 연동'),
('app', '모바일 앱');

-- 챌린지 데이터
INSERT OR IGNORE INTO challenges (title, description, scope, target_mode, target_saved_g, start_at, end_at) VALUES 
('일일 대중교통 챌린지', '오늘 대중교통을 이용해보세요', 'PERSONAL', 'SUBWAY', 1000, '2024-01-01', '2024-12-31'),
('주간 친환경 이동 챌린지', '일주일 동안 친환경 교통수단을 이용하세요', 'PERSONAL', 'ANY', 5000, '2024-01-01', '2024-12-31'),
('월간 탄소 절감 챌린지', '한 달 동안 20kg의 탄소를 절감하세요', 'PERSONAL', 'ANY', 20000, '2024-01-01', '2024-12-31');

-- 업적 데이터
INSERT OR IGNORE INTO achievements (code, title, description) VALUES 
('first_credit', '첫 걸음', '첫 번째 크레딧을 획득했습니다'),
('eco_guardian', '환경 지킴이', '10번의 친환경 활동을 완료했습니다'),
('transit_master', '대중교통 마스터', '50번의 대중교통 이용을 완료했습니다'),
('gardener', '정원사', '정원에 10번 물을 주었습니다'),
('carbon_saver', '탄소 절약왕', '100kg의 탄소를 절약했습니다');

-- 사용자 업적 데이터
INSERT OR IGNORE INTO user_achievements (user_id, achievement_id, granted_at) VALUES 
(1, 1, '2024-01-01 00:00:00'),
(1, 2, '2024-01-05 00:00:00'),
(1, 3, '2024-01-10 00:00:00'),
(1, 4, '2024-01-15 00:00:00');

-- 추가 크레딧 거래 내역 (최근 활동들)
INSERT OR IGNORE INTO credits_ledger (user_id, type, points, reason, meta_json, created_at) VALUES 
(1, 'EARN', 100, '지하철 이용 (신논현역 → 강남역)', '{"activity": "subway", "distance": 2.1, "co2_saved": 100}', '2024-01-24 08:00:00'),
(1, 'EARN', 80, '자전거 이용 (20분)', '{"activity": "bicycle", "duration": 20, "co2_saved": 80}', '2024-01-24 18:00:00'),
(1, 'EARN', 50, '도보 이동 (10분)', '{"activity": "walking", "duration": 10, "co2_saved": 50}', '2024-01-24 19:00:00'),
(1, 'EARN', 120, '버스 이용 (강남역 → 역삼역)', '{"activity": "bus", "distance": 1.8, "co2_saved": 120}', '2024-01-25 09:00:00'),
(1, 'EARN', 150, '지하철 이용 (역삼역 → 강남역)', '{"activity": "subway", "distance": 1.8, "co2_saved": 150}', '2024-01-25 18:30:00'),
(1, 'EARN', 100, '일일 챌린지 완료', '{"challenge_type": "daily", "challenge_id": 3}', '2024-01-25 23:59:00'),
(1, 'SPEND', -10, 'GARDEN_WATERING', '{"garden_id": 1, "watering_count": 8}', '2024-01-24 10:00:00'),
(1, 'SPEND', -10, 'GARDEN_WATERING', '{"garden_id": 1, "watering_count": 9}', '2024-01-25 10:00:00'),
(1, 'SPEND', -10, 'GARDEN_WATERING', '{"garden_id": 1, "watering_count": 10}', '2024-01-26 10:00:00');

-- 모빌리티 로그 데이터
INSERT OR IGNORE INTO mobility_logs (user_id, source_id, mode, distance_km, started_at, ended_at, co2_saved_g, points_earned, description, start_point, end_point) VALUES 
(1, 1, 'SUBWAY', 8.5, '2024-01-15 08:00:00', '2024-01-15 08:30:00', 150, 150, '지하철 이용', '강남역', '홍대입구역'),
(1, 1, 'BIKE', 5.2, '2024-01-15 18:00:00', '2024-01-15 18:30:00', 80, 80, '자전거 이용', '홍대입구역', '신촌역'),
(1, 1, 'WALK', 1.5, '2024-01-15 19:00:00', '2024-01-15 19:15:00', 50, 50, '도보 이동', '신촌역', '이대역');
