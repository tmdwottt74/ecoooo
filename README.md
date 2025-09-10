##가상환경 세팅##
(venv) $ pip freeze > requirements.txt  // 지금 쓰고있는 모델 버전 생성
(venv) $ >> pip install -r requirements.txt // 실행

******************************실행순서******************************
1. py -m venv .venv
2. .\.venv\Scripts\activate
3. pip install -r requirements.txt          // 없으면
4. cd backend                               //backend 폴더로 가야함 (main파일 여기 있어서)
5. uvicorn main:app --reload                //백엔드 서버 실행 -> 잘되면 127.0.0.1 에서 실행인거 보임
6. 터미널 쉘 하나 더 열기!
7. cd frontend                              // frontend 폴더로 가셈
8. npm start                                 // 프론트 엔드 스타트 -> 기다리면 웹 열림
************************************************************************
