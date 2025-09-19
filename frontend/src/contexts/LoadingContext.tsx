import React, { createContext, useContext, useState, ReactNode } from 'react';
import LoadingScreen from '../components/LoadingScreen';

interface LoadingContextType {
  isLoading: boolean;
  loadingMessage: string;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
  updateLoadingMessage: (message: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('로딩 중...');
  const [loadingStartTime, setLoadingStartTime] = useState<number>(0);
  const [minLoadingTime] = useState<number>(50); // 0.05초 (50ms)

  const showLoading = (message: string = '로딩 중...') => {
    setLoadingMessage(message);
    setLoadingStartTime(Date.now());
    setIsLoading(true);
  };

  const hideLoading = () => {
    const elapsedTime = Date.now() - loadingStartTime;
    const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
    
    if (remainingTime > 0) {
      // 최소 로딩 시간이 지나지 않았다면 남은 시간만큼 대기
      setTimeout(() => {
        setIsLoading(false);
      }, remainingTime);
    } else {
      // 이미 최소 로딩 시간이 지났다면 즉시 숨김
      setIsLoading(false);
    }
  };

  const updateLoadingMessage = (message: string) => {
    setLoadingMessage(message);
  };

  const value: LoadingContextType = {
    isLoading,
    loadingMessage,
    showLoading,
    hideLoading,
    updateLoadingMessage
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {isLoading && (
        <LoadingScreen 
          message={loadingMessage}
          overlay={true}
          size="medium"
        />
      )}
    </LoadingContext.Provider>
  );
};
