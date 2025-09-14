import { authApi } from './auth'; // 인증된 API 호출을 위한 axios 인스턴스

interface ChatbotResponse {
  response: string;
}

// 챗봇에게 질문하기
export const askChatbot = async (userQuery: string): Promise<ChatbotResponse> => {
  const response = await authApi.post<ChatbotResponse>(`/chatbot/ask?user_query=${encodeURIComponent(userQuery)}`);
  return response.data;
};
