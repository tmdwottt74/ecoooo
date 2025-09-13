## Ecoooo 프로젝트 실행 가이드

### 1. 가상환경 설정 및 의존성 설치
```

아래의 명령어를 순서대로 실행하여 가상환경을 설정하고 필요한 라이브러리를 설치합니다.

```bash
# 1. 가상환경 생성
py -m venv .venv

# 2. 가상환경 활성화
.\.venv\Scripts\activate

# 3. 의존성 설치
pip install -r requirements.txt
```

### 2. 백엔드 서버 실행

`main.py` 파일에 `uvicorn`을 사용하여 여러 워커로 실행하는 코드가 추가되었습니다. 이제 백엔드 서버를 실행하려면 `backend` 폴더로 이동하여 `main.py` 파일을 직접 실행하면 됩니다.

```bash
# backend 폴더로 이동
cd backend

# 백엔드 서버 실행
python main.py
```

이 명령은 `main.py` 내부에 정의된 `uvicorn.run` 설정을 사용하여 서버를 시작합니다. 기본적으로 4개의 워커를 사용하여 `0.0.0.0:8000`에서 실행됩니다.

### 3. 프론트엔드 서버 실행

새로운 터미널을 열고 아래의 명령어를 실행하여 프론트엔드 개발 서버를 시작합니다.

```bash
# frontend 폴더로 이동
cd frontend

# 의존성 설치 (최초 실행 시 또는 package.json 변경 시)
npm install

# 프론트엔드 개발 서버 실행
npm start
```

이제 웹 브라우저에서 프론트엔드 애플리케이션에 접속하여 백엔드와 통신하는 것을 확인할 수 있습니다.
