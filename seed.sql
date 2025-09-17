-- DB 선택
USE ecoooo_db;

-- 1) 그룹 추가
INSERT INTO user_groups (group_name, group_type)
VALUES ('동국대학교', 'SCHOOL')
ON DUPLICATE KEY UPDATE group_name = VALUES(group_name);

-- 방금 추가한 그룹의 id를 변수로 확보
SET @gid := (SELECT group_id FROM user_groups WHERE group_name = '동국대학교' LIMIT 1);

-- 2) 사용자 추가 (username/email 유니크 가정 → 중복 시 무시)
INSERT IGNORE INTO users (username, email, user_group_id, password_hash)
VALUES ('gyuri', 'g@ex.com', @gid, 'dummy_pw');

-- 사용자 id 확보
SET @uid := (SELECT user_id FROM users WHERE username = 'gyuri' LIMIT 1);

-- 2-1) 프로토타입 사용자 추가 (프론트/백엔드 데모용)
INSERT IGNORE INTO users (username, email, user_group_id, password_hash)
VALUES ('prototype_user', 'proto@ex.com', @gid, 'dummy_pw');
SET @uid_proto := (SELECT user_id FROM users WHERE username = 'prototype_user' LIMIT 1);

-- 3) 외부 연동 소스 (source_name 유니크)
INSERT INTO ingest_sources (source_name, description) VALUES
  ('T-MONEY', '교통카드'),
  ('DDAREUNGI', '서울자전거')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- 소스 id 확보
SET @subway := (SELECT source_id FROM ingest_sources WHERE source_name = 'T-MONEY' LIMIT 1);
SET @bike := (SELECT source_id FROM ingest_sources WHERE source_name = 'DDAREUNGI' LIMIT 1);

-- 4) 탄소계수 (mode + valid_from 유니크)
INSERT INTO carbon_factors (mode, g_per_km, valid_from, valid_to)
VALUES
  ('CAR',     192.000, '2025-01-01', '9999-12-31'),
  ('SUBWAY',  41.000, '2025-01-01', '9999-12-31'),
  ('BUS',     105.000, '2025-01-01', '9999-12-31'),
  ('BIKE',      0.000, '2025-01-01', '9999-12-31'),
  ('WALK',      0.000, '2025-01-01', '9999-12-31')
ON DUPLICATE KEY UPDATE
  g_per_km = VALUES(g_per_km),
  valid_to = VALUES(valid_to);

-- 5) 샘플 이동 기록 (gyuri가 지하철 5km 이용)
INSERT INTO mobility_logs (user_id, source_id, mode, distance_km, started_at, ended_at,
                           co2_baseline_g, co2_actual_g, co2_saved_g, raw_ref_id)
VALUES (@uid, @subway, 'SUBWAY', 5.000, '2025-09-13 08:00:00', '2025-09-13 08:20:00',
        960.000, 205.000, 755.000, 'demo-001')
ON DUPLICATE KEY UPDATE co2_saved_g = VALUES(co2_saved_g);

-- 6) 샘플 포인트 적립 (위 이동 기록을 기준으로 포인트 지급)
SET @logid := (SELECT log_id FROM mobility_logs WHERE raw_ref_id = 'demo-001' AND user_id = @uid LIMIT 1);

INSERT INTO credits_ledger (user_id, ref_log_id, type, points, reason)
VALUES (@uid, @logid, 'EARN', 100, 'MOBILITY:SAVING')
ON DUPLICATE KEY UPDATE points = VALUES(points), reason = VALUES(reason);

-- 7) 추가 이동 기록/포인트 (데모 데이터 확장)
-- gyuri 사용자 추가 기록
INSERT INTO mobility_logs (user_id, source_id, mode, distance_km, started_at, ended_at, co2_baseline_g, co2_actual_g, co2_saved_g, raw_ref_id)
VALUES
  (@uid, @bike, 'BIKE', 3.200, '2025-09-14 09:10:00', '2025-09-14 09:35:00', 614.400, 0.000, 614.400, 'demo-002')
ON DUPLICATE KEY UPDATE co2_saved_g = VALUES(co2_saved_g);
SET @logid2 := (SELECT log_id FROM mobility_logs WHERE raw_ref_id = 'demo-002' AND user_id = @uid LIMIT 1);
INSERT INTO credits_ledger (user_id, ref_log_id, type, points, reason)
VALUES (@uid, @logid2, 'EARN', 80, 'MOBILITY:SAVING')
ON DUPLICATE KEY UPDATE points = VALUES(points);

-- ===========================================
-- 통합된 사용자 데이터 (모든 탭에서 공통 사용)
-- ===========================================
-- 누적 절약량: 18.5kg CO₂
-- 누적 포인트: 1240P
-- 정원 레벨: 3 (1240P 기준)
-- 오늘 절약량: 1.85kg CO₂

-- prototype_user 데모 데이터: 통합된 이동 기록 (25건)
INSERT INTO mobility_logs (user_id, source_id, mode, distance_km, started_at, ended_at, co2_baseline_g, co2_actual_g, co2_saved_g, raw_ref_id)
VALUES
  (@uid_proto, @subway, 'SUBWAY', 7.500, '2025-01-15 09:30:00', '2025-01-15 10:00:00', 1440.000, 307.500, 1132.500, 'proto-001'),
  (@uid_proto, @subway, 'SUBWAY', 4.000, '2025-01-15 18:15:00', '2025-01-15 18:35:00', 768.000, 164.000, 604.000, 'proto-002'),
  (@uid_proto, @bike,   'BIKE',   3.200, '2025-01-14 08:45:00', '2025-01-14 09:10:00', 614.400,   0.000, 614.400, 'proto-003'),
  (@uid_proto, @subway, 'SUBWAY', 5.800, '2025-01-14 17:20:00', '2025-01-14 17:50:00', 1113.600, 237.800, 875.800, 'proto-004'),
  (@uid_proto, @subway, 'SUBWAY', 2.100, '2025-01-13 14:30:00', '2025-01-13 14:45:00', 403.200, 86.100, 317.100, 'proto-005'),
  (@uid_proto, @bike,   'BIKE',   1.500, '2025-01-13 12:00:00', '2025-01-13 12:10:00', 288.000, 0.000, 288.000, 'proto-006'),
  (@uid_proto, @subway, 'SUBWAY', 6.300, '2025-01-12 09:15:00', '2025-01-12 09:45:00', 1209.600, 258.300, 951.300, 'proto-007'),
  (@uid_proto, @bike,   'BIKE',   4.700, '2025-01-12 19:00:00', '2025-01-12 19:25:00', 902.400, 0.000, 902.400, 'proto-008'),
  (@uid_proto, @subway, 'SUBWAY', 3.500, '2025-01-11 16:45:00', '2025-01-11 17:00:00', 672.000, 143.500, 528.500, 'proto-009'),
  (@uid_proto, @subway, 'SUBWAY', 8.200, '2025-01-11 08:00:00', '2025-01-11 08:35:00', 1574.400, 336.200, 1238.200, 'proto-010'),
  (@uid_proto, @bike,   'BIKE',   5.100, '2025-01-10 08:30:00', '2025-01-10 09:00:00', 979.200, 0.000, 979.200, 'proto-011'),
  (@uid_proto, @subway, 'SUBWAY', 2.800, '2025-01-10 14:30:00', '2025-01-10 14:45:00', 537.600, 114.800, 422.800, 'proto-012'),
  (@uid_proto, @bike,   'BIKE',   6.000, '2025-01-09 19:00:00', '2025-01-09 19:30:00', 1152.000, 0.000, 1152.000, 'proto-013'),
  (@uid_proto, @bike,   'BIKE',   2.300, '2025-01-09 12:00:00', '2025-01-09 12:15:00', 441.600, 0.000, 441.600, 'proto-014'),
  (@uid_proto, @subway, 'SUBWAY', 9.100, '2025-01-08 08:00:00', '2025-01-08 08:40:00', 1747.200, 373.100, 1374.100, 'proto-015'),
  (@uid_proto, @subway, 'SUBWAY', 1.700, '2025-01-08 16:45:00', '2025-01-08 17:00:00', 326.400, 69.700, 256.700, 'proto-016'),
  (@uid_proto, @bike,   'BIKE',   4.200, '2025-01-07 19:00:00', '2025-01-07 19:25:00', 806.400, 0.000, 806.400, 'proto-017'),
  (@uid_proto, @bike,   'BIKE',   3.100, '2025-01-07 12:00:00', '2025-01-07 12:20:00', 595.200, 0.000, 595.200, 'proto-018'),
  (@uid_proto, @subway, 'SUBWAY', 7.800, '2025-01-06 08:00:00', '2025-01-06 08:35:00', 1497.600, 319.800, 1177.800, 'proto-019'),
  (@uid_proto, @subway, 'SUBWAY', 3.900, '2025-01-06 16:30:00', '2025-01-06 16:45:00', 748.800, 159.900, 588.900, 'proto-020'),
  (@uid_proto, @bike,   'BIKE',   5.500, '2025-01-05 19:00:00', '2025-01-05 19:30:00', 1056.000, 0.000, 1056.000, 'proto-021'),
  (@uid_proto, @subway, 'SUBWAY', 6.700, '2025-01-05 08:15:00', '2025-01-05 08:45:00', 1286.400, 274.700, 1011.700, 'proto-022'),
  (@uid_proto, @subway, 'SUBWAY', 2.100, '2025-01-04 14:30:00', '2025-01-04 14:45:00', 403.200, 86.100, 317.100, 'proto-023'),
  (@uid_proto, @bike,   'BIKE',   4.700, '2025-01-04 19:00:00', '2025-01-04 19:25:00', 902.400, 0.000, 902.400, 'proto-024'),
  (@uid_proto, @subway, 'SUBWAY', 6.700, '2025-01-03 08:00:00', '2025-01-03 08:30:00', 1286.400, 274.700, 1011.700, 'proto-025')
ON DUPLICATE KEY UPDATE co2_saved_g = VALUES(co2_saved_g);

-- 포인트 적립 (이동 기록 기반)
SET @pl1 := (SELECT log_id FROM mobility_logs WHERE raw_ref_id = 'proto-001' AND user_id = @uid_proto LIMIT 1);
SET @pl2 := (SELECT log_id FROM mobility_logs WHERE raw_ref_id = 'proto-002' AND user_id = @uid_proto LIMIT 1);
SET @pl3 := (SELECT log_id FROM mobility_logs WHERE raw_ref_id = 'proto-003' AND user_id = @uid_proto LIMIT 1);
SET @pl4 := (SELECT log_id FROM mobility_logs WHERE raw_ref_id = 'proto-004' AND user_id = @uid_proto LIMIT 1);
SET @pl5 := (SELECT log_id FROM mobility_logs WHERE raw_ref_id = 'proto-005' AND user_id = @uid_proto LIMIT 1);
SET @pl6 := (SELECT log_id FROM mobility_logs WHERE raw_ref_id = 'proto-006' AND user_id = @uid_proto LIMIT 1);
SET @pl7 := (SELECT log_id FROM mobility_logs WHERE raw_ref_id = 'proto-007' AND user_id = @uid_proto LIMIT 1);
SET @pl8 := (SELECT log_id FROM mobility_logs WHERE raw_ref_id = 'proto-008' AND user_id = @uid_proto LIMIT 1);
SET @pl9 := (SELECT log_id FROM mobility_logs WHERE raw_ref_id = 'proto-009' AND user_id = @uid_proto LIMIT 1);
SET @pl10 := (SELECT log_id FROM mobility_logs WHERE raw_ref_id = 'proto-010' AND user_id = @uid_proto LIMIT 1);
SET @pl11 := (SELECT log_id FROM mobility_logs WHERE raw_ref_id = 'proto-011' AND user_id = @uid_proto LIMIT 1);
SET @pl12 := (SELECT log_id FROM mobility_logs WHERE raw_ref_id = 'proto-012' AND user_id = @uid_proto LIMIT 1);
SET @pl13 := (SELECT log_id FROM mobility_logs WHERE raw_ref_id = 'proto-013' AND user_id = @uid_proto LIMIT 1);
SET @pl14 := (SELECT log_id FROM mobility_logs WHERE raw_ref_id = 'proto-014' AND user_id = @uid_proto LIMIT 1);
SET @pl15 := (SELECT log_id FROM mobility_logs WHERE raw_ref_id = 'proto-015' AND user_id = @uid_proto LIMIT 1);
SET @pl16 := (SELECT log_id FROM mobility_logs WHERE raw_ref_id = 'proto-016' AND user_id = @uid_proto LIMIT 1);
SET @pl17 := (SELECT log_id FROM mobility_logs WHERE raw_ref_id = 'proto-017' AND user_id = @uid_proto LIMIT 1);
SET @pl18 := (SELECT log_id FROM mobility_logs WHERE raw_ref_id = 'proto-018' AND user_id = @uid_proto LIMIT 1);
SET @pl19 := (SELECT log_id FROM mobility_logs WHERE raw_ref_id = 'proto-019' AND user_id = @uid_proto LIMIT 1);
SET @pl20 := (SELECT log_id FROM mobility_logs WHERE raw_ref_id = 'proto-020' AND user_id = @uid_proto LIMIT 1);
SET @pl21 := (SELECT log_id FROM mobility_logs WHERE raw_ref_id = 'proto-021' AND user_id = @uid_proto LIMIT 1);
SET @pl22 := (SELECT log_id FROM mobility_logs WHERE raw_ref_id = 'proto-022' AND user_id = @uid_proto LIMIT 1);
SET @pl23 := (SELECT log_id FROM mobility_logs WHERE raw_ref_id = 'proto-023' AND user_id = @uid_proto LIMIT 1);
SET @pl24 := (SELECT log_id FROM mobility_logs WHERE raw_ref_id = 'proto-024' AND user_id = @uid_proto LIMIT 1);
SET @pl25 := (SELECT log_id FROM mobility_logs WHERE raw_ref_id = 'proto-025' AND user_id = @uid_proto LIMIT 1);

INSERT INTO credits_ledger (user_id, ref_log_id, type, points, reason) VALUES
  (@uid_proto, @pl1, 'EARN', 150, 'MOBILITY:SAVING'),
  (@uid_proto, @pl2, 'EARN', 80, 'MOBILITY:SAVING'),
  (@uid_proto, @pl3, 'EARN', 100, 'MOBILITY:SAVING'),
  (@uid_proto, @pl4, 'EARN', 120, 'MOBILITY:SAVING'),
  (@uid_proto, @pl5, 'EARN', 40, 'MOBILITY:SAVING'),
  (@uid_proto, @pl6, 'EARN', 50, 'MOBILITY:SAVING'),
  (@uid_proto, @pl7, 'EARN', 130, 'MOBILITY:SAVING'),
  (@uid_proto, @pl8, 'EARN', 90, 'MOBILITY:SAVING'),
  (@uid_proto, @pl9, 'EARN', 60, 'MOBILITY:SAVING'),
  (@uid_proto, @pl10, 'EARN', 160, 'MOBILITY:SAVING'),
  (@uid_proto, @pl11, 'EARN', 100, 'MOBILITY:SAVING'),
  (@uid_proto, @pl12, 'EARN', 50, 'MOBILITY:SAVING'),
  (@uid_proto, @pl13, 'EARN', 120, 'MOBILITY:SAVING'),
  (@uid_proto, @pl14, 'EARN', 80, 'MOBILITY:SAVING'),
  (@uid_proto, @pl15, 'EARN', 180, 'MOBILITY:SAVING'),
  (@uid_proto, @pl16, 'EARN', 30, 'MOBILITY:SAVING'),
  (@uid_proto, @pl17, 'EARN', 85, 'MOBILITY:SAVING'),
  (@uid_proto, @pl18, 'EARN', 110, 'MOBILITY:SAVING'),
  (@uid_proto, @pl19, 'EARN', 155, 'MOBILITY:SAVING'),
  (@uid_proto, @pl20, 'EARN', 70, 'MOBILITY:SAVING'),
  (@uid_proto, @pl21, 'EARN', 110, 'MOBILITY:SAVING'),
  (@uid_proto, @pl22, 'EARN', 135, 'MOBILITY:SAVING'),
  (@uid_proto, @pl23, 'EARN', 40, 'MOBILITY:SAVING'),
  (@uid_proto, @pl24, 'EARN', 110, 'MOBILITY:SAVING'),
  (@uid_proto, @pl25, 'EARN', 135, 'MOBILITY:SAVING'),
  -- 보너스 포인트
  (@uid_proto, NULL, 'EARN', 200, 'CHALLENGE_BONUS'),
  (@uid_proto, NULL, 'EARN', 100, 'ACHIEVEMENT_BONUS'),
  -- 정원 물주기 사용
  (@uid_proto, NULL, 'SPEND', -10, 'WATER_PLANT')
ON DUPLICATE KEY UPDATE points = VALUES(points);

-- 8) 챌린지/멤버
INSERT INTO challenges (title, description, scope, target_mode, target_saved_g, start_at, end_at, created_by)
VALUES ('9월 대중교통 챌린지', '지하철/버스 이용으로 CO₂ 절감', 'PERSONAL', 'ANY', 10000, '2025-09-01 00:00:00', '2025-09-30 23:59:59', @uid)
ON DUPLICATE KEY UPDATE description = VALUES(description);
SET @ch := (SELECT challenge_id FROM challenges WHERE title = '9월 대중교통 챌린지' LIMIT 1);
INSERT IGNORE INTO challenge_members (challenge_id, user_id) VALUES (@ch, @uid), (@ch, @uid_proto);

-- 9) 업적/부여
INSERT IGNORE INTO achievements (code, title, description) VALUES
  ('FIRST_RIDE', '첫 친환경 이동', '첫 이동기록을 등록했습니다'),
  ('1000_SAVED', '탄소 1000g 절감', '누적 1000g CO₂ 절감 달성');
SET @ach1 := (SELECT achievement_id FROM achievements WHERE code='FIRST_RIDE');
SET @ach2 := (SELECT achievement_id FROM achievements WHERE code='1000_SAVED');
INSERT IGNORE INTO user_achievements (user_id, achievement_id) VALUES
  (@uid, @ach1),
  (@uid_proto, @ach1),
  (@uid_proto, @ach2);

-- 10) 알림
INSERT INTO notifications (user_id, title, body, status)
VALUES
  (@uid_proto, '축하합니다!', '오늘 친환경 이동으로 포인트를 적립했어요.', 'SENT'),
  (@uid_proto, '챌린지 진행', '9월 챌린지 목표의 40%를 달성했습니다.', 'SENT')
ON DUPLICATE KEY UPDATE body = VALUES(body);

-- 11) 정원 레벨 데이터
INSERT INTO garden_levels (level_number, level_name, image_path, required_waters, description)
VALUES
  (1, '씨앗단계', '/images/0.png', 10, '작은 씨앗이 땅속에서 꿈을 키우고 있어요'),
  (2, '새싹단계', '/images/1.png', 10, '땅 위로 고개를 내민 첫 새싹이에요'),
  (3, '잎새단계', '/images/2.png', 10, '초록 잎사귀가 하나둘 자라나고 있어요'),
  (4, '꽃봉오리단계', '/images/3.png', 10, '예쁜 꽃봉오리가 맺히기 시작했어요'),
  (5, '꽃단계', '/images/4.png', 10, '아름다운 꽃이 활짝 피었어요'),
  (6, '열매단계', '/images/5.png', 10, '달콤한 열매가 맺히기 시작했어요'),
  (7, '작은나무단계', '/images/6.png', 10, '작은 나무로 자라나고 있어요'),
  (8, '중간나무단계', '/images/7.png', 10, '더욱 크고 튼튼한 나무가 되었어요'),
  (9, '큰나무단계', '/images/8.png', 10, '우람한 큰 나무로 성장했어요'),
  (10, '숲단계', '/images/9.png', 10, '아름다운 숲의 일부가 되었어요'),
  (11, '정원단계', '/images/10.png', 10, '완성된 아름다운 정원이에요')
ON DUPLICATE KEY UPDATE 
  level_name = VALUES(level_name),
  image_path = VALUES(image_path),
  required_waters = VALUES(required_waters),
  description = VALUES(description);

-- 12) 사용자 정원 초기화
INSERT INTO user_gardens (user_id, current_level_id, waters_count, total_waters)
SELECT 
  @uid,
  (SELECT level_id FROM garden_levels WHERE level_number = 1),
  0,
  0
WHERE NOT EXISTS (SELECT 1 FROM user_gardens WHERE user_id = @uid);

INSERT INTO user_gardens (user_id, current_level_id, waters_count, total_waters)
SELECT 
  @uid_proto,
  (SELECT level_id FROM garden_levels WHERE level_number = 1),
  0,
  0
WHERE NOT EXISTS (SELECT 1 FROM user_gardens WHERE user_id = @uid_proto);

-- 13) 김에코 사용자 추가 (프론트엔드에서 사용)
INSERT IGNORE INTO users (username, email, user_group_id, password_hash)
VALUES ('김에코', 'kim.eco@ex.com', @gid, 'dummy_pw');
SET @uid_kimeco := (SELECT user_id FROM users WHERE username = '김에코' LIMIT 1);

INSERT INTO user_gardens (user_id, current_level_id, waters_count, total_waters)
SELECT 
  @uid_kimeco,
  (SELECT level_id FROM garden_levels WHERE level_number = 1),
  0,
  0
WHERE NOT EXISTS (SELECT 1 FROM user_gardens WHERE user_id = @uid_kimeco);

-- 14) 김에코 사용자 크레딧 데이터
INSERT INTO credits_ledger (user_id, type, points, reason, meta_json)
VALUES
  (@uid_kimeco, 'EARN', 150, '지하철 이용', '{"mode": "SUBWAY", "distance": 5.0}'),
  (@uid_kimeco, 'EARN', 200, '자전거 이용', '{"mode": "BIKE", "distance": 3.0}'),
  (@uid_kimeco, 'EARN', 100, '도보 이동', '{"mode": "WALK", "distance": 2.0}'),
  (@uid_kimeco, 'EARN', 300, '친환경 활동', '{"activity": "recycling"}'),
  (@uid_kimeco, 'EARN', 250, '에너지 절약', '{"activity": "energy_saving"}')
ON DUPLICATE KEY UPDATE points = VALUES(points);