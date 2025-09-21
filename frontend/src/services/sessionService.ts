// 세션 상태 관리 서비스
const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

export interface ChatMessage {
  sender: "user" | "bot";
  text: string;
  timestamp?: Date;
}

export interface SessionData {
  [key: string]: any;
}

class SessionService {
  private userId: string;

  constructor() {
    this.userId = localStorage.getItem('userId') || '1';
  }

  // 세션 상태 저장
  async saveSessionState(sessionKey: string, data: SessionData): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/api/session/${this.userId}/${sessionKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('세션 상태 저장 실패:', error);
      return false;
    }
  }

  // 세션 상태 조회
  async getSessionState(sessionKey: string): Promise<SessionData | null> {
    try {
      const response = await fetch(`${API_URL}/api/session/${this.userId}/${sessionKey}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('세션 상태 조회 실패:', error);
      return null;
    }
  }

  // 세션 상태 삭제
  async deleteSessionState(sessionKey: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/api/session/${this.userId}/${sessionKey}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('세션 상태 삭제 실패:', error);
      return false;
    }
  }

  // 모든 세션 상태 삭제 (로그아웃 시)
  async clearAllSessionStates(): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/api/session/${this.userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('모든 세션 상태 삭제 실패:', error);
      return false;
    }
  }

  // 채팅 메시지 저장
  async saveChatMessages(messages: ChatMessage[]): Promise<boolean> {
    const chatData = {
      messages: messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp || new Date()
      })),
      last_updated: new Date()
    };

    return await this.saveSessionState('chat_messages', chatData);
  }

  // 채팅 메시지 조회
  async getChatMessages(): Promise<ChatMessage[]> {
    const chatData = await this.getSessionState('chat_messages');
    return chatData?.messages || [];
  }

  // 활성 탭 저장
  async saveActiveTab(tabName: string): Promise<boolean> {
    return await this.saveSessionState('active_tab', { tabName });
  }

  // 활성 탭 조회
  async getActiveTab(): Promise<string | null> {
    const tabData = await this.getSessionState('active_tab');
    return tabData?.tabName || null;
  }

  // 사용자 설정 저장
  async saveUserSettings(settings: SessionData): Promise<boolean> {
    return await this.saveSessionState('user_settings', settings);
  }

  // 사용자 설정 조회
  async getUserSettings(): Promise<SessionData | null> {
    return await this.getSessionState('user_settings');
  }
}

export const sessionService = new SessionService();

