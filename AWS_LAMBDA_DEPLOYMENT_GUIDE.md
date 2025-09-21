# 🚀 AWS Lambda 챗봇 배포 가이드

## 1. AWS 계정 설정

### IAM 역할 생성
```bash
# Lambda 실행 역할 생성
aws iam create-role \
    --role-name lambda-execution-role \
    --assume-role-policy-document '{
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": {
                    "Service": "lambda.amazonaws.com"
                },
                "Action": "sts:AssumeRole"
            }
        ]
    }'

# Bedrock 권한 추가
aws iam attach-role-policy \
    --role-name lambda-execution-role \
    --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

aws iam attach-role-policy \
    --role-name lambda-execution-role \
    --policy-arn arn:aws:iam::aws:policy/AmazonBedrockFullAccess
```

## 2. Lambda 함수 배포

### 방법 1: AWS CLI 사용
```bash
# 1. 배포 패키지 생성
mkdir lambda_package
cd lambda_package
pip install boto3 -t .
cp ../lambda_chatbot.py .
zip -r lambda_chatbot.zip .

# 2. Lambda 함수 생성
aws lambda create-function \
    --function-name ecooo-chatbot \
    --runtime python3.11 \
    --role arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-execution-role \
    --handler lambda_chatbot.lambda_handler \
    --zip-file fileb://lambda_chatbot.zip \
    --timeout 30 \
    --memory-size 256 \
    --region us-east-1
```

### 방법 2: AWS 콘솔 사용
1. AWS Lambda 콘솔 접속
2. "함수 생성" 클릭
3. "새로 작성" 선택
4. 함수 이름: `ecooo-chatbot`
5. 런타임: `Python 3.11`
6. 실행 역할: 위에서 생성한 역할 선택
7. 함수 코드 업로드: `lambda_chatbot.zip`

## 3. API Gateway 설정

### REST API 생성
1. API Gateway 콘솔 접속
2. "API 생성" → "REST API" 선택
3. API 이름: `ecooo-chatbot-api`
4. 리소스 생성: `/chat`
5. POST 메서드 추가
6. Lambda 함수 연결: `ecooo-chatbot`
7. CORS 활성화
8. API 배포

### CORS 설정
```json
{
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
}
```

## 4. 프론트엔드 설정

### 환경 변수 설정
1. **환경 변수 파일 생성**:
   ```bash
   # frontend/.env.local 파일 생성
   echo "REACT_APP_LAMBDA_API_URL=https://YOUR_API_GATEWAY_ID.execute-api.us-east-1.amazonaws.com/default/chat" > frontend/.env.local
   ```

2. **또는 직접 설정**:
   - `frontend/.env.local` 파일을 생성하고 다음 내용 추가:
   ```
   REACT_APP_API_URL=http://127.0.0.1:8000
   REACT_APP_LAMBDA_API_URL=https://YOUR_API_GATEWAY_ID.execute-api.us-east-1.amazonaws.com/default/chat
   ```

3. **프론트엔드 재시작**:
   ```bash
   cd frontend
   npm start
   ```

### 테스트
- 브라우저에서 `http://localhost:3000/chat` 접속
- Lambda API가 정상 작동하는지 확인
- Fallback으로 로컬 API도 테스트

## 5. 비용 최적화

### Lambda 설정
- 메모리: 256MB (충분)
- 타임아웃: 30초
- 예약된 동시성: 필요시 설정

### 예상 비용 (월 1000회 요청)
- Lambda: $0.20
- API Gateway: $3.50
- Bedrock: $15.00 (Claude 3 Sonnet 기준)
- **총 예상 비용: $18.70/월**

## 6. 모니터링

### CloudWatch 설정
- 로그 그룹: `/aws/lambda/ecooo-chatbot`
- 메트릭: 호출 수, 오류율, 지연 시간
- 알람: 오류율 5% 이상 시 알림

## 7. 보안

### API 키 보호
- API Gateway에서 API 키 사용
- Rate Limiting 설정
- CORS 정책 엄격하게 설정

## 8. 확장성

### 추가 기능
- DynamoDB: 채팅 기록 저장
- S3: 파일 업로드 처리
- CloudFront: CDN 설정
- Route 53: 커스텀 도메인

## 9. 문제 해결

### 일반적인 오류
1. **권한 오류**: IAM 역할 확인
2. **타임아웃**: Lambda 타임아웃 증가
3. **메모리 부족**: Lambda 메모리 증가
4. **CORS 오류**: API Gateway CORS 설정 확인

### 로그 확인
```bash
aws logs describe-log-groups --log-group-name-prefix /aws/lambda/ecooo-chatbot
aws logs get-log-events --log-group-name /aws/lambda/ecooo-chatbot --log-stream-name STREAM_NAME
```
