# Ecooo 프로젝트

서울시 AI 해커톤 참가 프로젝트 - 에코 AI 챗봇과 함께하는 탄소 절감 프로젝트

## 🚀 프로젝트 개요

Ecooo는 사용자의 친환경 이동 기록을 관리하고, 탄소 절감량을 계산하며, 이에 따른 포인트를 지급하는 애플리케이션입니다. 또한, 사용자 맞춤형 챌린지를 추천하고, AI 챗봇을 통해 환경 관련 정보를 제공하며, 업적 및 알림 기능을 통해 사용자 참여를 독려합니다.

## ✨ 주요 기능

-   **AI 챗봇 (AWS Bedrock 기반):** LLM 연동 및 대화형 AI 개발
-   **추천 시스템:** 사용자 데이터 기반 맞춤형 챌린지 추천 (scikit-learn, pandas 활용)
-   **외부 데이터 연동:** 서울시 공공 API를 활용한 비동기 데이터 호출 및 활용
-   **탄소 절감량 계산:** 이동 수단별 탄소 배출 계수를 통한 절감량 자동 계산
-   **포인트/크레딧 시스템:** 탄소 절감량에 따른 포인트 지급 및 관리
-   **챌린지 관리:** 챌린지 생성, 참여, 진행 상황 추적
-   **업적/알림:** 사용자 업적 부여 및 알림 기능

## 🛠️ 기술 스택

### 백엔드 (API 서버)

-   **언어:** Python
-   **프레임워크:** FastAPI
-   **데이터베이스:** MySQL
-   **ORM:** SQLAlchemy
-   **인증:** JWT (JSON Web Tokens)
-   **비밀번호 해싱:** Passlib (Bcrypt)
-   **외부 API 통신:** httpx
-   **AWS 연동:** Boto3 (AWS Bedrock)
-   **데이터 처리/분석:** Pandas, Scikit-learn

### 프론트엔드 (웹 애플리케이션)

-   **언어:** TypeScript
-   **프레임워크:** React
-   **번들러:** Vite
-   **UI 라이브러리:** React-Bootstrap, Bootstrap CSS
-   **상태 관리:** React Hooks (useState, useEffect 등)
-   **라우팅:** React Router DOM
-   **API 통신:** Axios

## ⚙️ 서버 작동 순서

프로젝트를 로컬 환경에서 실행하기 위한 단계별 가이드입니다.

### 1. 환경 설정 (.env 파일)

프로젝트 루트 디렉토리 (`ecoooo/`)에 `.env` 파일을 생성하고 다음 환경 변수들을 설정합니다.

```dotenv
# 백엔드 데이터베이스 연결 정보
DATABASE_URL="mysql+pymysql://your_mysql_user:your_mysql_password@your_mysql_host:your_mysql_port/ecoooo_db"

# JWT 인증을 위한 비밀 키 (강력하고 무작위적인 문자열로 변경하세요)
SECRET_KEY="your-super-secret-key-please-change-this"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=30

# 서울시 공공 API 키 (서울시 열린데이터 광장에서 발급받으세요)
SEOUL_API_KEY="YOUR_SEOUL_API_KEY"

# AWS Bedrock 설정 (필요시)
# AWS_ACCESS_KEY_ID="YOUR_AWS_ACCESS_KEY_ID"
# AWS_SECRET_ACCESS_KEY="YOUR_AWS_SECRET_ACCESS_KEY"
# AWS_REGION="ap-northeast-2" # 사용하려는 AWS 리전
```

**주의:** `your_mysql_user`, `your_mysql_password`, `your_mysql_host`, `your_mysql_port`, `your_super-secret-key-please-change-this`, `YOUR_SEOUL_API_KEY`는 실제 값으로 변경해야 합니다. AWS Bedrock을 사용하려면 AWS 자격 증명도 설정해야 합니다.

### 2. 백엔드 서버 실행

1.  **백엔드 디렉토리로 이동:**
    ```bash
    cd backend
    ```
2.  **가상 환경 생성 및 활성화:**
    ```bash
    python -m venv .venv
    # Windows
    .\.venv\Scripts\activate
    # macOS/Linux
    # source ./.venv/bin/activate
    ```
3.  **필요한 Python 패키지 설치:**
    ```bash
    pip install -r requirements.txt
    ```
    **참고:** `mysqlclient` 설치 시 빌드 오류가 발생할 수 있습니다. 이는 MySQL C Connector 또는 MariaDB Connector/C 개발 라이브러리가 시스템에 설치되어 있지 않기 때문입니다. `requirements.txt`에는 `PyMySQL`로 대체되어 있으므로 대부분의 경우 문제가 없을 것입니다.

4.  **데이터베이스 초기화 및 서버 실행:**
    ```bash
    uvicorn app.main:app --reload
    ```
    이 명령어를 실행하면 FastAPI 서버가 시작되고, `app.main` 파일에 정의된 로직에 따라 데이터베이스 테이블이 생성되며 초기 데이터가 자동으로 로드됩니다.

    서버는 기본적으로 `http://127.0.0.1:8000`에서 실행됩니다.
    API 문서는 `http://127.0.0.1:8000/docs` (Swagger UI) 또는 `http://127.0.0.1:8000/redoc` (ReDoc)에서 확인할 수 있습니다.

### 3. 프론트엔드 애플리케이션 실행

1.  **프론트엔드 디렉토리로 이동:**
    ```bash
    cd frontend
    ```
2.  **Node.js 패키지 설치:**
    ```bash
    npm install
    ```
3.  **프론트엔드 개발 서버 실행:**
    ```bash
    npm run dev
    ```
    이 명령어를 실행하면 React 개발 서버가 시작됩니다.

    애플리케이션은 기본적으로 `http://localhost:5173`에서 실행됩니다.

## 🧪 테스트

-   **회원가입:** 프론트엔드에서 새로운 사용자를 등록합니다.
-   **로그인:** 등록된 사용자로 로그인하여 JWT 토큰을 발급받습니다.
-   **API 기능 테스트:** 로그인 후 대시보드, 이동 기록, 챌린지, 추천, 챗봇, 업적, 알림 페이지를 탐색하며 각 기능이 정상적으로 작동하는지 확인합니다.
-   **개발자 도구 활용:** 브라우저의 개발자 도구(F12)를 열어 네트워크 탭에서 백엔드 API 호출이 정상적으로 이루어지는지, 응답 데이터가 올바른지 확인합니다.

## 🤝 기여

프로젝트에 기여하고 싶으시다면, 언제든지 Pull Request를 보내주세요.

---
