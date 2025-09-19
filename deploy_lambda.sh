#!/bin/bash

# Lambda 배포 스크립트

echo "🚀 AWS Lambda 챗봇 배포 시작..."

# 1. 배포 패키지 디렉토리 생성
mkdir -p lambda_package
cd lambda_package

# 2. 필요한 패키지 설치
pip install -r ../requirements_lambda.txt -t .

# 3. Lambda 함수 코드 복사
cp ../lambda_chatbot.py .

# 4. ZIP 파일 생성
zip -r lambda_chatbot.zip .

# 5. AWS CLI로 Lambda 함수 생성/업데이트
echo "📦 Lambda 함수 배포 중..."

# Lambda 함수 생성 (처음 실행 시)
aws lambda create-function \
    --function-name ecooo-chatbot \
    --runtime python3.11 \
    --role arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-execution-role \
    --handler lambda_chatbot.lambda_handler \
    --zip-file fileb://lambda_chatbot.zip \
    --timeout 30 \
    --memory-size 256 \
    --environment Variables='{}' \
    --region us-east-1

# 또는 기존 함수 업데이트
# aws lambda update-function-code \
#     --function-name ecooo-chatbot \
#     --zip-file fileb://lambda_chatbot.zip \
#     --region us-east-1

echo "✅ Lambda 함수 배포 완료!"

# 6. 정리
cd ..
rm -rf lambda_package

echo "🎉 배포 완료! API Gateway 설정을 진행하세요."
