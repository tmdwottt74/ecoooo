import boto3
import json
import os
import requests
import re
from bs4 import BeautifulSoup
from fastapi import APIRouter
from pydantic import BaseModel

# --- 설정 ---
AWS_DEFAULT_REGION = "us-east-1"
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")
GOOGLE_CSE_ID = os.getenv("GOOGLE_CSE_ID", "")
BEDROCK_MODEL_ARN = os.getenv(
    "BEDROCK_MODEL_ARN",
    "arn:aws:bedrock:us-east-1:327784329358:inference-profile/us.anthropic.claude-opus-4-20250514-v1:0"
)
BEDROCK_KNOWLEDGE_BASE_ID = os.getenv("BEDROCK_KNOWLEDGE_BASE_ID", "")

# --- Boto3 클라이언트 초기화 ---
bedrock_runtime_client = None
bedrock_agent_runtime_client = None
try:
    bedrock_runtime_client = boto3.client("bedrock-runtime", region_name=AWS_DEFAULT_REGION)
    bedrock_agent_runtime_client = boto3.client("bedrock-agent-runtime", region_name=AWS_DEFAULT_REGION)
    print("[알림] AWS Bedrock 클라이언트가 성공적으로 초기화되었습니다.")
except Exception as e:
    print(f"[오류] AWS 클라이언트 생성 중 오류: {e}")

# FastAPI 라우터 생성
router = APIRouter(prefix="/chat", tags=["Chatbot"])

# 요청 모델
class ChatRequest(BaseModel):
    user_id: int
    message: str


# -----------------------
# LLM 호출
# -----------------------
def invoke_llm(system_prompt: str, user_prompt: str):
    """Bedrock LLM 호출 함수"""
    if not bedrock_runtime_client:
        print("[경고] Bedrock runtime client 없음")
        return None
    try:
        request_body = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 2048,
            "system": system_prompt,
            "messages": [{"role": "user", "content": user_prompt}],
        }
        response = bedrock_runtime_client.invoke_model(
            modelId=BEDROCK_MODEL_ARN,
            body=json.dumps(request_body),
        )
        body_raw = response.get("body")
        if hasattr(body_raw, "read"):
            response_body = json.loads(body_raw.read())
        else:
            response_body = json.loads(body_raw)

        return (
            response_body.get("content", [{}])[0].get("text")
            or response_body.get("output_text")
            or ""
        )
    except Exception as e:
        print(f"[오류] Bedrock 모델 호출 실패: {e}")
        return None


# -----------------------
# 지식 기반 검색
# -----------------------
def query_knowledge_base(query: str):
    """Bedrock Knowledge Base 검색"""
    if not bedrock_agent_runtime_client:
        print("[경고] Bedrock agent runtime client 없음")
        return None
    print(f"\n[알림] 지식 기반 검색: {query}")
    try:
        response = bedrock_agent_runtime_client.retrieve_and_generate(
            input={"text": query},
            retrieveAndGenerateConfiguration={
                "type": "KNOWLEDGE_BASE",
                "knowledgeBaseConfiguration": {
                    "knowledgeBaseId": BEDROCK_KNOWLEDGE_BASE_ID,
                    "modelArn": BEDROCK_MODEL_ARN,
                },
            },
        )
        answer = response.get("output", {}).get("text")
        if not answer:
            return None

        sources = []
        for citation in response.get("citations", []):
            refs = citation.get("retrievedReferences", [])
            if refs:
                uri = refs[0].get("location", {}).get("s3Location", {}).get("uri")
                if uri:
                    sources.append(uri)

        if sources:
            return answer + "\n\n--- 출처 ---\n" + "\n".join(sources)
        return answer
    except Exception as e:
        print(f"[오류] Bedrock 지식 기반 검색 실패: {e}")
        return None


# -----------------------
# 웹 검색
# -----------------------
def perform_web_search(query: str):
    """Google Custom Search + 웹 페이지 크롤링"""
    print(f"\n[알림] 웹 검색 시작: {query}")
    try:
        search_url = "https://www.googleapis.com/customsearch/v1"
        params = {"key": GOOGLE_API_KEY, "cx": GOOGLE_CSE_ID, "q": query, "num": 3}
        resp = requests.get(search_url, params=params, timeout=10)
        resp.raise_for_status()
        items = resp.json().get("items", [])

        if not items:
            return "웹 검색 결과가 없습니다."

        full_context = ""
        headers = {"User-Agent": "Mozilla/5.0"}
        for item in items:
            link = item.get("link")
            if not link:
                continue
            try:
                page_resp = requests.get(link, headers=headers, timeout=10)
                page_resp.raise_for_status()
                soup = BeautifulSoup(page_resp.text, "lxml")
                text_parts = []
                for tag in ["h1", "h2", "h3", "p"]:
                    text_parts += [el.get_text(strip=True) for el in soup.find_all(tag)]
                page_text = "\n".join(text_parts)
                full_context += f"--- URL: {link} ---\n{page_text}\n\n"
            except Exception as e:
                print(f"[경고] {link} 크롤링 실패: {e}")
                continue

        return full_context or "웹페이지 내용을 가져올 수 없습니다."
    except Exception as e:
        print(f"[오류] 웹 검색 실패: {e}")
        return "웹 검색 오류"


# -----------------------
# 채팅 엔드포인트
# -----------------------
@router.post("/")
async def chatbot_endpoint(request: ChatRequest):
    user_query = request.message
    print(f"\n사용자 질문: {user_query}")

    # Step 1. Router LLM → 액션 결정
    router_system_prompt = """
    You are a smart orchestrator that decides the next action.
    Respond ONLY in JSON: {"action": "...", "query" or "answer": "..."}
    """
    router_output_str = invoke_llm(router_system_prompt, user_query)

    action = "general_search"
    router_decision = {"query": user_query}
    try:
        if router_output_str:
            json_match = re.search(r"\{.*\}", router_output_str, re.DOTALL)
            if json_match:
                router_decision = json.loads(json_match.group())
                action = router_decision.get("action", "general_search")
    except Exception as e:
        print(f"[경고] Router 출력 파싱 실패: {e}")

    # Step 2. 액션 실행
    final_answer = None
    query = router_decision.get("query", user_query)
    original_action = action

    if action == "knowledge_base_search":
        print("[알림] 지식 기반 검색 실행")
        final_answer = query_knowledge_base(query)
        if not final_answer:
            print("[알림] 지식 기반 결과 없음 → 웹 검색 fallback")
            action = "general_search"

    if action == "general_search":
        print("[알림] 웹 검색 실행")
        search_results = perform_web_search(query)
        if "오류" in search_results or "없습니다" in search_results:
            final_answer = search_results
        else:
            short_results = search_results[:20000]
            system_prompt = """
            너는 친절한 AI 어시스턴트다.
            검색 결과 안의 정보만 사용해서 답해라.
            모르면 "검색된 정보로는 답변을 찾을 수 없습니다."라고 말해라.
            마지막엔 환경 보호 관련 팁을 한 문장 추가해라.
            """
            final_answer = invoke_llm(system_prompt, f"<검색 결과>\n{short_results}\n</검색 결과>\n\n질문: {user_query}")

    if action == "direct_answer":
        final_answer = router_decision.get("answer", "안녕하세요! 무엇을 도와드릴까요?")

    if not final_answer:
        final_answer = "죄송합니다. 답변을 생성할 수 없습니다."

    print("\n--- 최종 답변 ---")
    print(final_answer)
    return {"response": final_answer}

