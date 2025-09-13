## Ecoooo 프로젝트 실행 가이드

### 1. 가상환경 설정 및 의존성 설치

**참고:** `gunicorn`은 Windows에서 호환되지 않으므로 `requirements.txt`에서 제거하는 것이 좋습니다.

```
# requirements.txt

fastapi
uvicorn
# gunicorn  # 이 줄은 제거하거나 주석 처리합니다.
...
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

`main.py` 파일이 `uvicorn`을 단일 워커로 실행하도록 수정되었습니다. 이는 Windows 환경에서 안정적인 실행을 위한 조치입니다. 백엔드 서버를 실행하려면 `backend` 폴더로 이동하여 `main.py` 파일을 직접 실행하면 됩니다.

```bash
# backend 폴더로 이동
cd backend

# 백엔드 서버 실행
python main.py
```

이 명령은 `main.py` 내부에 정의된 `uvicorn.run` 설정을 사용하여 서버를 시작합니다. 이제 단일 워커로 `0.0.0.0:8000`에서 실행됩니다. Windows에서 진정한 멀티프로세싱이 필요한 경우, 여러 개의 `python main.py` 인스턴스를 수동으로 실행하는 등의 다른 접근 방식이 필요할 수 있습니다.

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
push하기전 pull 먼저 하는거 ㄹㅇ 필수임 진짜 이거 안하면 병신 진짜 ㅈ됨!!!!!!!!!!!!!!!!!!!!

이제 웹 브라우저에서 프론트엔드 애플리케이션에 접속하여 백엔드와 통신하는 것을 확인할 수 있습니다.