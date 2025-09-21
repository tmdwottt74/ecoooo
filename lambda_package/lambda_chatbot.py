import json
import boto3
import os
from typing import Dict, Any

# Bedrock 클라이언트 초기화
bedrock = boto3.client('bedrock-runtime', region_name='us-east-1')

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    AWS Lambda 핸들러 함수
    프론트엔드에서 전송된 메시지를 받아 Bedrock Claude로 처리
    """
    try:
        # CORS 헤더 설정
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'POST, OPTIONS'
        }
        
        # OPTIONS 요청 처리 (CORS preflight)
        if event.get('httpMethod') == 'OPTIONS':
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'message': 'CORS preflight'})
            }
        
        # 요청 본문 파싱
        if isinstance(event.get('body'), str):
            body = json.loads(event['body'])
        else:
            body = event.get('body', {})
        
        user_message = body.get('message', '')
        user_id = body.get('user_id', 1)
        
        if not user_message:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({
                    'error': '메시지가 필요합니다.'
                })
            }
        
        # 개인화된 프롬프트 생성
        personalized_prompt = create_personalized_prompt(user_message, user_id)
        
        # Bedrock Claude 호출
        bot_response = call_bedrock_claude(personalized_prompt)
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'response': bot_response,
                'user_id': user_id
            })
        }
        
    except Exception as e:
        print(f"Lambda 오류: {str(e)}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({
                'error': '서버 오류가 발생했습니다.',
                'response': '죄송합니다. AI 챗봇 서비스에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.'
            })
        }

def create_personalized_prompt(user_message: str, user_id: int) -> str:
    """
    사용자 메시지를 개인화된 프롬프트로 변환
    """
    system_prompt = """
    당신은 친환경 생활을 도와주는 AI 어시스턴트입니다.
    사용자의 탄소 절감 활동을 격려하고, 환경 보호에 대한 실용적인 조언을 제공해주세요.
    
    답변 시 다음 사항을 고려해주세요:
    1. 친근하고 격려하는 톤으로 답변
    2. 구체적이고 실천 가능한 조언 제공
    3. 환경 보호의 중요성 강조
    4. 사용자의 노력을 인정하고 격려
    5. 한국어로 답변
    
    답변은 200자 이내로 간결하게 작성해주세요.
    """
    
    return f"{system_prompt}\n\n사용자 질문: {user_message}"

def call_bedrock_claude(prompt: str) -> str:
    """
    Bedrock Claude 모델 호출
    """
    try:
        # Bedrock Claude 모델 호출
        response = bedrock.invoke_model(
            modelId='anthropic.claude-3-sonnet-20240229-v1:0',
            body=json.dumps({
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 1000,
                "temperature": 0.7,
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            })
        )
        
        # 응답 파싱
        response_body = json.loads(response['body'].read())
        bot_response = response_body['content'][0]['text']
        
        return bot_response
        
    except Exception as e:
        print(f"Bedrock 호출 오류: {str(e)}")
        return "죄송합니다. AI 서비스에 일시적인 문제가 발생했습니다. 환경 보호에 대한 질문을 해주시면 도움을 드릴 수 있습니다! 🌱"

# 테스트용 함수
if __name__ == "__main__":
    # 로컬 테스트
    test_event = {
        'httpMethod': 'POST',
        'body': json.dumps({
            'message': '환경 보호를 위해 어떤 일을 할 수 있나요?',
            'user_id': 1
        })
    }
    
    result = lambda_handler(test_event, None)
    print(json.dumps(result, indent=2, ensure_ascii=False))
