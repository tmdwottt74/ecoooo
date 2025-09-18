-- Ecooo 데이터베이스 스키마
-- 크레딧 시스템을 위한 테이블들

-- 사용자 테이블
CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 크레딧 원장 테이블 (모든 크레딧 거래 기록)
CREATE TABLE IF NOT EXISTS credits_ledger (
    entry_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    ref_log_id INTEGER, -- 참조 로그 ID (mobility_log, garden_log 등)
    type VARCHAR(20) NOT NULL, -- 'EARN', 'SPEND'
    points INTEGER NOT NULL, -- 양수: 적립, 음수: 차감
    reason VARCHAR(255) NOT NULL, -- 거래 사유
    meta_json TEXT, -- 추가 메타데이터 (JSON)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 정원 레벨 테이블
CREATE TABLE IF NOT EXISTS garden_levels (
    level_id INTEGER PRIMARY KEY AUTOINCREMENT,
    level_number INTEGER NOT NULL UNIQUE,
    level_name VARCHAR(50) NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    required_waters INTEGER NOT NULL DEFAULT 10,
    description TEXT
);

-- 사용자 정원 테이블
CREATE TABLE IF NOT EXISTS user_gardens (
    garden_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    current_level_id INTEGER NOT NULL,
    waters_count INTEGER DEFAULT 0, -- 현재 레벨에서의 물주기 횟수
    total_waters INTEGER DEFAULT 0, -- 총 물주기 횟수
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (current_level_id) REFERENCES garden_levels(level_id)
);

-- 정원 물주기 로그 테이블
CREATE TABLE IF NOT EXISTS garden_watering_logs (
    log_id INTEGER PRIMARY KEY AUTOINCREMENT,
    garden_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    points_spent INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (garden_id) REFERENCES user_gardens(garden_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 탄소 배출 계수 테이블
CREATE TABLE IF NOT EXISTS carbon_factors (
    factor_id INTEGER PRIMARY KEY AUTOINCREMENT,
    mode VARCHAR(20) NOT NULL, -- 'BUS', 'SUBWAY', 'BIKE', 'WALK', 'CAR'
    g_per_km REAL NOT NULL, -- gCO2/km
    valid_from TIMESTAMP NOT NULL,
    valid_to TIMESTAMP DEFAULT '9999-12-31 23:59:59'
);

-- 수집 소스 테이블
CREATE TABLE IF NOT EXISTS ingest_sources (
    source_id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
);

-- 모빌리티 로그 테이블
CREATE TABLE IF NOT EXISTS mobility_logs (
    log_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    source_id INTEGER,
    mode VARCHAR(20) NOT NULL, -- 'BUS', 'SUBWAY', 'BIKE', 'WALK', 'CAR'
    distance_km REAL NOT NULL,
    started_at TIMESTAMP NOT NULL,
    ended_at TIMESTAMP NOT NULL,
    co2_saved_g REAL,
    points_earned INTEGER DEFAULT 0,
    description VARCHAR(255),
    start_point VARCHAR(255),
    end_point VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (source_id) REFERENCES ingest_sources(source_id)
);

-- 챌린지 테이블
CREATE TABLE IF NOT EXISTS challenges (
    challenge_id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    scope VARCHAR(20) DEFAULT 'PERSONAL', -- 'PERSONAL', 'GROUP'
    target_mode VARCHAR(20) DEFAULT 'ANY', -- 'BUS', 'SUBWAY', 'BIKE', 'WALK', 'CAR', 'ANY'
    target_saved_g INTEGER NOT NULL,
    start_at TIMESTAMP NOT NULL,
    end_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 업적 테이블
CREATE TABLE IF NOT EXISTS achievements (
    achievement_id INTEGER PRIMARY KEY AUTOINCREMENT,
    code VARCHAR(50) UNIQUE,
    title VARCHAR(100) NOT NULL,
    description VARCHAR(255)
);

-- 사용자 업적 테이블 (Many-to-Many)
CREATE TABLE IF NOT EXISTS user_achievements (
    user_id INTEGER NOT NULL,
    achievement_id INTEGER NOT NULL,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, achievement_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (achievement_id) REFERENCES achievements(achievement_id)
);

-- 대시보드 통계 테이블
CREATE TABLE IF NOT EXISTS dashboard_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date DATE NOT NULL,
    co2_saved_today REAL DEFAULT 0.0, -- 오늘 절약한 탄소량 (g)
    credits_earned_today INTEGER DEFAULT 0, -- 오늘 획득한 크레딧
    activities_count INTEGER DEFAULT 0, -- 오늘 활동 횟수
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    UNIQUE(user_id, date)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_credits_ledger_user_id ON credits_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_credits_ledger_created_at ON credits_ledger(created_at);
CREATE INDEX IF NOT EXISTS idx_user_gardens_user_id ON user_gardens(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_mobility_logs_user_id ON mobility_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_mobility_logs_created_at ON mobility_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_dashboard_stats_user_date ON dashboard_stats(user_id, date);