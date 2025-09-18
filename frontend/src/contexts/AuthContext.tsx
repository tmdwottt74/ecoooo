import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // 비밀번호 추가
  phone?: string; // 전화번호 추가
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
  signup: (userData: any) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 컴포넌트 마운트 시 로컬 스토리지에서 사용자 정보 확인
  useEffect(() => {
    const savedUser = localStorage.getItem('eco-user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to parse saved user data:', error);
        localStorage.removeItem('eco-user');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<User | null> => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: email, password: password }), // Backend expects username, frontend uses email
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Login failed:', errorData.detail || 'Unknown error');
        return null;
      }

      const userData = await response.json();
      // Backend returns user_id, username, role. Map to frontend User interface.
      const loggedInUser: User = {
        id: userData.user_id.toString(), // Ensure ID is string
        name: userData.username,
        email: email, // Use provided email for consistency
        role: userData.role
      };

      localStorage.setItem('eco-user', JSON.stringify(loggedInUser));
      
      setUser(loggedInUser);
      setIsAuthenticated(true);
      
      return loggedInUser;
    } catch (error) {
      console.error('Login failed:', error);
      return null;
    }
  };

  const signup = async (userData: any): Promise<boolean> => {
    try {
      // 실제 API 호출 대신 데모용 로직
      // 실제 환경에서는 서버에 회원가입 요청을 보내야 함
      
      // 회원가입 시 입력한 모든 정보를 저장하는 사용자 데이터
      const newUser: User = {
        id: Date.now().toString(),
        name: userData.name,
        email: userData.email,
        password: userData.password, // 입력한 비밀번호 저장
        phone: userData.phone, // 입력한 전화번호 저장
        role: '사용자'
      };

      // 로컬 스토리지에 사용자 정보 저장
      localStorage.setItem('eco-user', JSON.stringify(newUser));
      
      setUser(newUser);
      setIsAuthenticated(true);
      
      return true;
    } catch (error) {
      console.error('Signup failed:', error);
      return false;
    }
  };

  const logout = () => {
    // 로컬 스토리지에서 사용자 정보 제거
    localStorage.removeItem('eco-user');
    
    setUser(null);
    setIsAuthenticated(false);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    login,
    logout,
    signup
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
