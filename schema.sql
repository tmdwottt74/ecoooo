-- 공통 설정
CREATE DATABASE IF NOT EXISTS ecoooo_db
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_0900_ai_ci;
USE ecoooo_db;

-- 0) 참조 테이블: 그룹(소속)
CREATE TABLE user_groups (
  group_id      BIGINT PRIMARY KEY AUTO_INCREMENT,
  group_name    VARCHAR(80) NOT NULL,
  group_type    ENUM('SCHOOL','COMPANY','COMMUNITY','ETC') DEFAULT 'ETC',
  region_code   VARCHAR(10),       -- 예: 자치구 코드
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_groups_name (group_name)
) ENGINE=InnoDB;

-- 1) 사용자
CREATE TABLE users (
  user_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(120) UNIQUE,
  password_hash VARCHAR(255),
  user_group_id BIGINT,
  role ENUM('USER','ADMIN') DEFAULT 'USER',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_group
    FOREIGN KEY (user_group_id) REFERENCES user_groups(group_id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- 2) 탄소 배출 계수 (모드별 gCO2/km), 기간 버전 관리
CREATE TABLE carbon_factors (
  factor_id     BIGINT PRIMARY KEY AUTO_INCREMENT,
  mode          ENUM('BUS','SUBWAY','BIKE','WALK','CAR') NOT NULL,
  g_per_km      DECIMAL(10,3) NOT NULL,      -- gram CO2 per km (양의 값)
  valid_from    DATE NOT NULL,
  valid_to      DATE DEFAULT '9999-12-31',
  UNIQUE KEY uk_factor_mode_range (mode, valid_from)
) ENGINE=InnoDB;

-- 3) 외부 연동 메타(원천)
CREATE TABLE ingest_sources (
  source_id     BIGINT PRIMARY KEY AUTO_INCREMENT,
  source_name   VARCHAR(50) NOT NULL,        -- e.g., T-MONEY, Ddareungi, GPS
  description   VARCHAR(255),
  UNIQUE KEY uk_source_name (source_name)
) ENGINE=InnoDB;

-- 4) 이동 기록 (정규화된 결과) - 통합된 필드 구조
CREATE TABLE mobility_logs (
  log_id        BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id       BIGINT NOT NULL,
  source_id     BIGINT,                    -- 원천(선택)
  mode          ENUM('BUS','SUBWAY','BIKE','WALK','CAR') NOT NULL,
  distance_km   DECIMAL(8,3) NOT NULL CHECK (distance_km >= 0),
  started_at    DATETIME NOT NULL,
  ended_at      DATETIME NOT NULL,
  raw_ref_id    VARCHAR(100),              -- 원시 레코드 식별자(중복 방지용)
  co2_baseline_g  DECIMAL(12,3),             -- 기준 시나리오(자가용) 배출량
  co2_actual_g    DECIMAL(12,3),             -- 실제 모드 배출량
  co2_saved_g     DECIMAL(12,3),             -- 절감량(=baseline-actual, 0 미만이면 0)
  points_earned   INT DEFAULT 0,             -- 획득 포인트
  description     VARCHAR(255),              -- 활동 설명
  start_point     VARCHAR(255),              -- 출발지
  end_point       VARCHAR(255),              -- 도착지
  used_at         DATETIME,                  -- 실제 이용 시간
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_raw (user_id, raw_ref_id),
  KEY idx_mobility_user_time (user_id, started_at),
  CONSTRAINT fk_mobility_user
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_mobility_source
    FOREIGN KEY (source_id) REFERENCES ingest_sources(source_id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- 5) 포인트/크레딧 장부 (적립/차감 모두)
CREATE TABLE credits_ledger (
  entry_id      BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id       BIGINT NOT NULL,
  ref_log_id    BIGINT,                    -- mobility_logs와 연결(선택)
  type          ENUM('EARN','SPEND','ADJUST') NOT NULL,
  points        INT NOT NULL,              -- +/-
  reason        VARCHAR(120) NOT NULL,         -- e.g., "MOBILITY:SAVING","REWARD"
  meta_json     JSON,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_ledger_user_time (user_id, created_at),
  CONSTRAINT fk_ledger_user
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_ledger_log
    FOREIGN KEY (ref_log_id) REFERENCES mobility_logs(log_id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- 6) 챌린지
CREATE TABLE challenges (
  challenge_id  BIGINT PRIMARY KEY AUTO_INCREMENT,
  title         VARCHAR(100) NOT NULL,
  description   VARCHAR(255),
  scope         ENUM('PERSONAL','GROUP') DEFAULT 'PERSONAL',
  target_mode   ENUM('ANY','BUS','SUBWAY','BIKE','WALK') DEFAULT 'ANY',
  target_saved_g INT NOT NULL,              -- 목표 절감량(g)
  start_at      DATETIME NOT NULL,
  end_at        DATETIME NOT NULL,
  created_by    BIGINT,                    -- 개설자(user_id)
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_challenges_creator
    FOREIGN KEY (created_by) REFERENCES users(user_id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE challenge_members (
  challenge_id BIGINT NOT NULL,
  user_id      BIGINT NOT NULL,
  joined_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (challenge_id, user_id),
  CONSTRAINT fk_chm_ch
    FOREIGN KEY (challenge_id) REFERENCES challenges(challenge_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_chm_user
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7) 업적/뱃지
CREATE TABLE achievements (
  achievement_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  code           VARCHAR(50) UNIQUE,
  title          VARCHAR(100) NOT NULL,
  description    VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE user_achievements (
  user_id         BIGINT NOT NULL,
  achievement_id  BIGINT NOT NULL,
  granted_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, achievement_id),
  CONSTRAINT fk_ua_user
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_ua_ach
    FOREIGN KEY (achievement_id) REFERENCES achievements(achievement_id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8) 알림
CREATE TABLE notifications (
  notification_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id         BIGINT NOT NULL,
  title           VARCHAR(120) NOT NULL,
  body            VARCHAR(500),
  status          ENUM('PENDING','SENT','READ') DEFAULT 'PENDING',
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at         DATETIME,
  KEY idx_notify_user (user_id, status),
  CONSTRAINT fk_notify_user
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- 9) 원시 적재
CREATE TABLE ingest_raw (
  raw_id      BIGINT PRIMARY KEY AUTO_INCREMENT,
  source_id   BIGINT NOT NULL,
  user_id     BIGINT,
  captured_at DATETIME NOT NULL,
  payload     JSON NOT NULL,
  UNIQUE KEY uk_raw_source_time_user (source_id, captured_at, user_id),
  CONSTRAINT fk_raw_source
    FOREIGN KEY (source_id) REFERENCES ingest_sources(source_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_raw_user
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- 10) 거리 기준 테이블 (📌 추가)
CREATE TABLE subway_distances (
  id INT AUTO_INCREMENT PRIMARY KEY,
  station_start VARCHAR(255),
  station_end   VARCHAR(255),
  distance_km   DECIMAL(6,2)
) ENGINE=InnoDB;

CREATE TABLE bus_distances (
  id INT AUTO_INCREMENT PRIMARY KEY,
  route_id     VARCHAR(50),
  stop_start   VARCHAR(255),
  stop_end     VARCHAR(255),
  distance_km  DECIMAL(6,2)
) ENGINE=InnoDB;

-- 11) 정원 시스템 테이블
CREATE TABLE garden_levels (
  level_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  level_number INT NOT NULL UNIQUE,
  level_name VARCHAR(50) NOT NULL,
  image_path VARCHAR(255) NOT NULL,
  required_waters INT NOT NULL DEFAULT 10,
  description VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE user_gardens (
  garden_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  current_level_id BIGINT NOT NULL,
  waters_count INT DEFAULT 0,
  total_waters INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_garden_user
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_garden_level
    FOREIGN KEY (current_level_id) REFERENCES garden_levels(level_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE garden_watering_logs (
  log_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  garden_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  points_spent INT DEFAULT 10,
  watered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_watering_garden
    FOREIGN KEY (garden_id) REFERENCES user_gardens(garden_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_watering_user
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- 12) 조회 뷰
CREATE OR REPLACE VIEW v_user_points AS
  SELECT user_id, SUM(points) AS total_points
  FROM credits_ledger
  GROUP BY user_id;

CREATE OR REPLACE VIEW v_daily_saving AS
  SELECT user_id, DATE(started_at) AS ymd, SUM(co2_saved_g) AS saved_g
  FROM mobility_logs
  GROUP BY user_id, DATE(started_at);

CREATE OR REPLACE VIEW v_user_garden_status AS
  SELECT 
    ug.garden_id,
    ug.user_id,
    gl.level_number,
    gl.level_name,
    gl.image_path,
    ug.waters_count,
    ug.total_waters,
    gl.required_waters,
    CASE 
      WHEN ug.waters_count >= gl.required_waters THEN 'COMPLETED'
      ELSE 'IN_PROGRESS'
    END as status
  FROM user_gardens ug
  JOIN garden_levels gl ON ug.current_level_id = gl.level_id;
