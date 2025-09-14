import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000'; // 백엔드 API 기본 URL

interface AuthToken {
  access_token: string;
  token_type: string;
}

// 로그인 함수
export const login = async (username: string, password: string): Promise<AuthToken> => {
  const response = await axios.post<AuthToken>(
    `${API_BASE_URL}/auth/token`,
    new URLSearchParams({ username, password }), // x-www-form-urlencoded 형식으로 전송
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );
  return response.data;
};

// 회원가입 함수
export const register = async (username: string, email: string, password: string): Promise<any> => {
  const response = await axios.post(
    `${API_BASE_URL}/users/`,
    { username, email, password }
  );
  return response.data;
};

// 현재 사용자 정보 가져오기
export const fetchCurrentUser = async (): Promise<any> => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    throw new Error('No access token found');
  }

  const response = await axios.get(`${API_BASE_URL}/auth/me/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// 인증된 요청을 위한 Axios 인스턴스
export const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: 모든 요청에 토큰 추가
authApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 401 에러 발생 시 로그아웃 처리
authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('access_token');
      // window.location.href = '/login'; // 로그인 페이지로 리다이렉트
    }
    return Promise.reject(error);
  }
);
