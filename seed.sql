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

-- 3) 외부 연동 소스 (source_name 유니크)
INSERT INTO ingest_sources (source_name, description) VALUES
  ('T-MONEY', '교통카드'),
  ('DDAREUNGI', '서울자전거')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- 소스 id 확보
SET @subway := (SELECT source_id FROM ingest_sources WHERE source_name = 'T-MONEY' LIMIT 1);

-- 4) 탄소계수 (mode + valid_from 유니크)
INSERT INTO carbon_factors (mode, g_per_km, valid_from, valid_to)
VALUES
  ('CAR',     192.000, '2025-01-01', '9999-12-31'),
  ('SUBWAY',   41.000, '2025-01-01', '9999-12-31'),
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
