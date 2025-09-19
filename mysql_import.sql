-- 사용자 데이터
INSERT INTO users (user_id, username, email, password_hash, user_group_id, role, created_at) VALUES
(1, '김에코', 'kim.eco@ecooo.com', NULL, NULL, 'USER', '2025-09-17 16:37:08'),
(2, '이그린', 'lee.green@ecooo.com', NULL, NULL, 'USER', '2025-09-17 16:37:08'),
(3, '박지구', 'park.earth@ecooo.com', NULL, NULL, 'USER', '2025-09-17 16:37:08');

-- 정원 레벨 데이터
INSERT INTO garden_levels (level_id, level_number, level_name, image_path, required_waters, description) VALUES
(1, 1, '씨앗 단계', '/0.png', 10, '작은 씨앗이 땅에 심어졌습니다'),
(2, 2, '싹 트는 단계', '/1.png', 10, '작은 싹이 돋아나기 시작했습니다'),
(3, 3, '새싹 단계', '/2.png', 10, '초록 새싹이 자라나고 있습니다'),
(4, 4, '어린 줄기 단계', '/3.png', 10, '줄기가 자라나고 있습니다'),
(5, 5, '잎 전개 단계', '/4.png', 10, '잎이 펼쳐지기 시작했습니다'),
(6, 6, '꽃봉오리 단계', '/5.png', 10, '꽃봉오리가 맺혔습니다'),
(7, 7, '꽃 단계', '/6.png', 10, '아름다운 꽃이 피었습니다'),
(8, 8, '어린 나무 단계', '/7.png', 10, '작은 나무가 되었습니다'),
(9, 9, '자라는 나무 단계', '/8.png', 10, '나무가 더욱 자라고 있습니다'),
(10, 10, '우거진 나무 단계', '/9.png', 10, '우거진 나무가 되었습니다'),
(11, 11, '정원 완성 단계', '/10.png', 10, '완벽한 정원이 완성되었습니다');

-- 크레딧 장부 데이터
INSERT INTO credits_ledger (entry_id, user_id, ref_log_id, type, points, reason, meta_json, created_at) VALUES
(75, 1, NULL, 'EARN', 0, '회원가입 보너스', '{"type": "signup_bonus"}', '2024-01-01 00:00:00'),
(76, 1, NULL, 'EARN', 140, '지하철 이용 (강남역 → 홍대입구역)', '{"activity": "subway", "distance": 8.5, "co2_saved": 150}', '2024-01-15 08:30:00'),
(77, 1, NULL, 'EARN', 80, '자전거 이용 (30분)', '{"activity": "bicycle", "duration": 30, "co2_saved": 80}', '2024-01-15 18:30:00'),
(78, 1, NULL, 'EARN', 50, '도보 이동 (15분)', '{"activity": "walking", "duration": 15, "co2_saved": 50}', '2024-01-15 19:15:00'),
(79, 1, NULL, 'EARN', 100, '지하철 이용 (홍대입구역 → 강남역)', '{"activity": "subway", "distance": 8.5, "co2_saved": 100}', '2024-01-16 09:00:00'),
(80, 1, NULL, 'EARN', 120, '버스 이용 (강남역 → 신논현역)', '{"activity": "bus", "distance": 2.1, "co2_saved": 120}', '2024-01-16 18:00:00'),
(81, 1, NULL, 'EARN', 100, '일일 챌린지 완료', '{"challenge_type": "daily", "challenge_id": 1}', '2024-01-16 23:59:00'),
(82, 1, NULL, 'EARN', 150, '주간 챌린지 완료', '{"challenge_type": "weekly", "challenge_id": 2}', '2024-01-21 23:59:00'),
(83, 1, NULL, 'SPEND', -10, 'GARDEN_WATERING', '{"garden_id": 1, "watering_count": 1}', '2024-01-17 10:00:00'),
(84, 1, NULL, 'SPEND', -10, 'GARDEN_WATERING', '{"garden_id": 1, "watering_count": 2}', '2024-01-18 10:00:00'),
(85, 1, NULL, 'SPEND', -10, 'GARDEN_WATERING', '{"garden_id": 1, "watering_count": 3}', '2024-01-19 10:00:00'),
(86, 1, NULL, 'SPEND', -10, 'GARDEN_WATERING', '{"garden_id": 1, "watering_count": 4}', '2024-01-20 10:00:00'),
(87, 1, NULL, 'SPEND', -10, 'GARDEN_WATERING', '{"garden_id": 1, "watering_count": 5}', '2024-01-21 10:00:00'),
(88, 1, NULL, 'SPEND', -10, 'GARDEN_WATERING', '{"garden_id": 1, "watering_count": 6}', '2024-01-22 10:00:00'),
(89, 1, NULL, 'SPEND', -10, 'GARDEN_WATERING', '{"garden_id": 1, "watering_count": 7}', '2024-01-23 10:00:00'),
(90, 1, NULL, 'EARN', 100, '지하철 이용 (신논현역 → 강남역)', '{"activity": "subway", "distance": 2.1, "co2_saved": 100}', '2024-01-24 08:00:00'),
(91, 1, NULL, 'EARN', 80, '자전거 이용 (20분)', '{"activity": "bicycle", "duration": 20, "co2_saved": 80}', '2024-01-24 18:00:00'),
(92, 1, NULL, 'EARN', 50, '도보 이동 (10분)', '{"activity": "walking", "duration": 10, "co2_saved": 50}', '2024-01-24 19:00:00'),
(93, 1, NULL, 'EARN', 120, '버스 이용 (강남역 → 역삼역)', '{"activity": "bus", "distance": 1.8, "co2_saved": 120}', '2024-01-25 09:00:00'),
(94, 1, NULL, 'EARN', 150, '지하철 이용 (역삼역 → 강남역)', '{"activity": "subway", "distance": 1.8, "co2_saved": 150}', '2024-01-25 18:30:00'),
(95, 1, NULL, 'EARN', 100, '일일 챌린지 완료', '{"challenge_type": "daily", "challenge_id": 3}', '2024-01-25 23:59:00'),
(96, 1, NULL, 'SPEND', -10, 'GARDEN_WATERING', '{"garden_id": 1, "watering_count": 8}', '2024-01-24 10:00:00'),
(97, 1, NULL, 'SPEND', -10, 'GARDEN_WATERING', '{"garden_id": 1, "watering_count": 9}', '2024-01-25 10:00:00'),
(98, 1, NULL, 'SPEND', -10, 'GARDEN_WATERING', '{"garden_id": 1, "watering_count": 10}', '2024-01-26 10:00:00');

-- 모빌리티 로그 데이터
INSERT INTO mobility_logs (log_id, user_id, source_id, mode, distance_km, started_at, ended_at, raw_ref_id, co2_baseline_g, co2_actual_g, co2_saved_g, points_earned, description, start_point, end_point, used_at, created_at) VALUES
(1, 1, 1, 'SUBWAY', 8.5, '2024-01-15 08:00:00', '2024-01-15 08:30:00', '150.0', 150, 지하철 이용, 강남역, 홍대입구역, '2025-09-17 16:37:08', NULL, NULL, NULL, 'CURRENT_TIMESTAMP'),
(2, 1, 1, 'BIKE', 5.2, '2024-01-15 18:00:00', '2024-01-15 18:30:00', '80.0', 80, 자전거 이용, 홍대입구역, 신촌역, '2025-09-17 16:37:08', NULL, NULL, NULL, 'CURRENT_TIMESTAMP'),
(3, 1, 1, 'WALK', 1.5, '2024-01-15 19:00:00', '2024-01-15 19:15:00', '50.0', 50, 도보 이동, 신촌역, 이대역, '2025-09-17 16:37:08', NULL, NULL, NULL, 'CURRENT_TIMESTAMP');

-- 정원 데이터
INSERT INTO user_gardens (garden_id, user_id, current_level_id, waters_count, total_waters, created_at, updated_at) VALUES
(1, 1, 3, 7, 27, '2025-09-17 16:37:08', '2025-09-17 16:37:08'),
(2, 2, 2, 4, 14, '2025-09-17 16:37:08', '2025-09-17 16:37:08'),
(3, 3, 4, 12, 42, '2025-09-17 16:37:08', '2025-09-17 16:37:08');