import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useUser } from "../contexts/UserContext";
import { useCredits } from "../contexts/CreditsContext";
import { useAppData } from "../contexts/AppDataContext";
import { useLoading } from "../contexts/LoadingContext";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import "../App.css";
import "./DashboardPage.css";

// 📌 타입 정의
interface DailySaving {
  date: string;
  saved_g: number;
}

interface Challenge {
  goal: number;
  progress: number;
}

interface DashboardData {
  co2_saved_today: number; // 오늘 절약량 (g)
  eco_credits_earned: number; // 오늘 획득 크레딧
  garden_level: number; // 정원 레벨
  total_saved: number; // 누적 절약량 (kg)
  total_points: number; // 누적 크레딧
  last7days: DailySaving[];
  modeStats: { mode: string; saved_g: number }[];
  challenge: Challenge;
}

// 탄소 절감 트렌드 데이터 타입
interface TrendData {
  date: string;
  carbonReduced: number;
  creditsEarned: number;
  transportMode: string;
}

// 개인 탄소 발자국 데이터 타입
interface CarbonFootprint {
  total: number;
  transport: number;
  energy: number;
  lifestyle: number;
  comparison: {
    national: number;
    regional: number;
    friends: number;
  };
}

// 지역별 환경 지수 데이터 타입
interface RegionalIndex {
  region: string;
  airQuality: number;
  greenSpace: number;
  publicTransport: number;
  recyclingRate: number;
  overallScore: number;
}

// 배지 시스템 타입
interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

// 리더보드 타입
interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  totalCredits: number;
  carbonReduced: number;
  badgeCount: number;
  isCurrentUser: boolean;
}

// 시즌 이벤트 타입
interface SeasonEvent {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  challenges: {
    id: string;
    title: string;
    description: string;
    reward: number;
    completed: boolean;
  }[];
  totalReward: number;
}

const COLORS = ["#1abc9c", "#16a085", "#f39c12", "#e74c3c"];

// ✅ 데모 버전 - 모든 사용자가 동일한 데이터
const DEMO_DATA: DashboardData = {
  co2_saved_today: 1850,
  eco_credits_earned: 185, // 10g당 1크레딧
  garden_level: 3, // 고정 레벨
  total_saved: 18.5,
  total_points: 185, // 고정 크레딧
  last7days: [
    { date: "01/09", saved_g: 1200 },
    { date: "01/10", saved_g: 1500 },
    { date: "01/11", saved_g: 1800 },
    { date: "01/12", saved_g: 1600 },
    { date: "01/13", saved_g: 1900 },
    { date: "01/14", saved_g: 1700 },
    { date: "01/15", saved_g: 1850 },
  ],
  modeStats: [
    { mode: "지하철", saved_g: 8500 },
    { mode: "자전거", saved_g: 4200 },
    { mode: "버스", saved_g: 2800 },
    { mode: "도보", saved_g: 1500 },
  ],
  challenge: { goal: 20, progress: 8.76 }, // 43.8%에 해당하는 안정적인 값
};

const DashboardPage: React.FC = () => {
  const { user: authUser } = useAuth();
  const { user } = useUser();
  const { creditsData } = useCredits();
  const { showLoading, hideLoading } = useLoading();
  const [data, setData] = useState<DashboardData | null>(DEMO_DATA); // 초기값으로 데모 데이터 설정
  const [loading, setLoading] = useState(false); // 초기 로딩 상태를 false로 설정
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string | null>(null);
  
  // 데이터 분석 관련 상태
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [carbonFootprint, setCarbonFootprint] = useState<CarbonFootprint | null>(null);
  const [regionalIndex, setRegionalIndex] = useState<RegionalIndex | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  // 게임화 관련 상태
  const [badges, setBadges] = useState<Badge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentSeason, setCurrentSeason] = useState<SeasonEvent | null>(null);
  const [showGameFeatures, setShowGameFeatures] = useState(false);

  // 실시간 크레딧 변경 애니메이션을 위한 상태
  const [creditChange, setCreditChange] = useState<{amount: number, type: 'earn' | 'spend' | null}>({amount: 0, type: null});
  const [showCreditAnimation, setShowCreditAnimation] = useState(false);

  // 크레딧 변경 시 애니메이션 표시
  useEffect(() => {
    const handleCreditUpdate = (event: CustomEvent) => {
      const { change } = event.detail;
      if (change !== 0) {
        setCreditChange({
          amount: Math.abs(change),
          type: change > 0 ? 'earn' : 'spend'
        });
        setShowCreditAnimation(true);
        
        // 3초 후 애니메이션 숨기기
        setTimeout(() => {
          setShowCreditAnimation(false);
          setCreditChange({amount: 0, type: null});
        }, 3000);
      }
    };

    window.addEventListener('creditUpdated', handleCreditUpdate as EventListener);
    return () => window.removeEventListener('creditUpdated', handleCreditUpdate as EventListener);
  }, []);

  const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";
  const userId = 1; // 실제 로그인 사용자 ID로 대체 필요

  // 탄소 절감 트렌드 데이터 생성
  useEffect(() => {
    const generateTrendData = () => {
      const data: TrendData[] = [];
      const now = new Date();
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        data.push({
          date: date.toISOString().split('T')[0],
          carbonReduced: Math.random() * 2 + 0.5, // 0.5-2.5kg
          creditsEarned: Math.floor(Math.random() * 50) + 10, // 10-60 credits
          transportMode: ['지하철', '버스', '자전거', '도보'][Math.floor(Math.random() * 4)]
        });
      }
      
      return data;
    };

    setTrendData(generateTrendData());
  }, []);

  // 개인 탄소 발자국 계산 - 성능 최적화 (한 번만 로딩)
  useEffect(() => {
    const fetchCarbonFootprintData = async () => {
      try {
        const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";
        const userId = 1; // 실제 로그인 사용자 ID로 대체 필요
        
        // 친구 비교 데이터 가져오기
        const friendsResponse = await fetch(`${API_URL}/api/statistics/friends/comparison/${userId}`);
        if (friendsResponse.ok) {
          const friendsData = await friendsResponse.json();
          
          const total = creditsData.totalCarbonReduced;
          const transport = total * 0.6; // 교통수단이 60%
          const energy = total * 0.25; // 에너지 절약이 25%
          const lifestyle = total * 0.15; // 생활습관이 15%
          
          setCarbonFootprint({
            total,
            transport,
            energy,
            lifestyle,
            comparison: {
              national: friendsData.national_average_carbon_kg,
              regional: friendsData.friends_average_carbon_kg * 1.1, // 지역은 친구 평균의 110%
              friends: friendsData.friends_average_carbon_kg
            }
          });
        } else {
          // API 실패 시 기본값 사용
          const total = creditsData.totalCarbonReduced;
          const transport = total * 0.6;
          const energy = total * 0.25;
          const lifestyle = total * 0.15;
          
          setCarbonFootprint({
            total,
            transport,
            energy,
            lifestyle,
            comparison: {
              national: 12.5,
              regional: 10.8,
              friends: 8.2
            }
          });
        }
      } catch (error) {
        console.error('Failed to fetch carbon footprint data:', error);
        // 에러 시 기본값 사용
        const total = creditsData.totalCarbonReduced;
        const transport = total * 0.6;
        const energy = total * 0.25;
        const lifestyle = total * 0.15;
        
        setCarbonFootprint({
          total,
          transport,
          energy,
          lifestyle,
          comparison: {
            national: 12.5,
            regional: 10.8,
            friends: 8.2
          }
        });
      }
    };

    // 탄소 발자국 데이터는 한 번만 로딩
    if (!carbonFootprint) {
      fetchCarbonFootprintData();
    }
  }, [creditsData.totalCarbonReduced, carbonFootprint]);

  // 지역별 환경 지수 데이터 - 성능 최적화 (한 번만 로딩)
  useEffect(() => {
    const fetchRegionalData = async () => {
      try {
        const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";
        const region = '서울특별시'; // 실제 사용자 지역으로 대체 필요
        
        const response = await fetch(`${API_URL}/api/statistics/regional/${encodeURIComponent(region)}`);
        if (response.ok) {
          const data = await response.json();
          setRegionalIndex({
            region: data.region,
            airQuality: data.air_quality_index,
            greenSpace: data.green_space_index,
            publicTransport: data.public_transport_index,
            recyclingRate: data.recycling_rate_index,
            overallScore: data.overall_score
          });
        } else {
          // API 실패 시 기본값 사용
          setRegionalIndex({
            region: '서울특별시',
            airQuality: 75,
            greenSpace: 68,
            publicTransport: 92,
            recyclingRate: 85,
            overallScore: 80
          });
        }
      } catch (error) {
        console.error('Failed to fetch regional data:', error);
        // 에러 시 기본값 사용
        setRegionalIndex({
          region: '서울특별시',
          airQuality: 75,
          greenSpace: 68,
          publicTransport: 92,
          recyclingRate: 85,
          overallScore: 80
        });
      }
    };

    // 지역 데이터는 한 번만 로딩
    if (!regionalIndex) {
      fetchRegionalData();
    }
  }, [regionalIndex]);

  // 게임화 데이터 초기화
  useEffect(() => {
    // 배지 데이터 생성
    const badgeData: Badge[] = [
      {
        id: 'first_step',
        name: '첫 걸음',
        description: '첫 번째 탄소 절감 달성',
        icon: '🌱',
        rarity: 'common',
        unlocked: true,
        unlockedAt: '2024-01-15',
        progress: 1,
        maxProgress: 1
      },
      {
        id: 'eco_warrior',
        name: '에코 워리어',
        description: '10kg 탄소 절감 달성',
        icon: '🛡️',
        rarity: 'rare',
        unlocked: creditsData.totalCarbonReduced >= 10,
        progress: Math.min(creditsData.totalCarbonReduced, 10),
        maxProgress: 10
      },
      {
        id: 'credit_master',
        name: '크레딧 마스터',
        description: '1000 크레딧 획득',
        icon: '💎',
        rarity: 'epic',
        unlocked: creditsData.totalCredits >= 1000,
        progress: Math.min(creditsData.totalCredits, 1000),
        maxProgress: 1000
      },
      {
        id: 'transport_hero',
        name: '교통 영웅',
        description: '30일 연속 대중교통 이용',
        icon: '🚇',
        rarity: 'rare',
        unlocked: false,
        progress: 15,
        maxProgress: 30
      },
      {
        id: 'garden_legend',
        name: '정원의 전설',
        description: '정원 레벨 10 달성',
        icon: '🏆',
        rarity: 'legendary',
        unlocked: false,
        progress: 3,
        maxProgress: 10
      },
      {
        id: 'carbon_neutral',
        name: '탄소 중립',
        description: '100kg 탄소 절감 달성',
        icon: '🌍',
        rarity: 'legendary',
        unlocked: creditsData.totalCarbonReduced >= 100,
        progress: Math.min(creditsData.totalCarbonReduced, 100),
        maxProgress: 100
      }
    ];
    setBadges(badgeData);

    // 리더보드 데이터 생성 (API에서 가져오기)
    const fetchLeaderboardData = async () => {
      try {
        const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";
        const response = await fetch(`${API_URL}/api/statistics/leaderboard?limit=10&period=all`);
        
        if (response.ok) {
          const data = await response.json();
          const leaderboardData: LeaderboardEntry[] = data.map((entry: any, index: number) => ({
            rank: entry.rank,
            name: entry.name,
            avatar: ['🌱', '🌍', '🦋', '🌿', '🌸', '🌺', '🌻', '🌷', '🌹', '🌼'][index] || '🌱',
            totalCredits: entry.total_credits,
            carbonReduced: entry.carbon_reduced_kg,
            badgeCount: entry.badge_count,
            isCurrentUser: entry.user_id === 1 // 실제 사용자 ID로 대체 필요
          }));
          setLeaderboard(leaderboardData);
        } else {
          // API 실패 시 기본값 사용
          const defaultLeaderboard: LeaderboardEntry[] = [
            {
              rank: 1,
              name: '김환경',
              avatar: '🌱',
              totalCredits: 2500,
              carbonReduced: 45.2,
              badgeCount: 8,
              isCurrentUser: false
            },
            {
              rank: 2,
              name: '이지구',
              avatar: '🌍',
              totalCredits: 2200,
              carbonReduced: 38.7,
              badgeCount: 6,
              isCurrentUser: false
            },
            {
              rank: 3,
              name: '박에코',
              avatar: '🦋',
              totalCredits: 1950,
              carbonReduced: 32.1,
              badgeCount: 5,
              isCurrentUser: false
            },
            {
              rank: 4,
              name: '정그린',
              avatar: '🌿',
              totalCredits: 1800,
              carbonReduced: 28.5,
              badgeCount: 4,
              isCurrentUser: true
            },
            {
              rank: 5,
              name: '최자연',
              avatar: '🌸',
              totalCredits: 1650,
              carbonReduced: 25.3,
              badgeCount: 3,
              isCurrentUser: false
            }
          ];
          setLeaderboard(defaultLeaderboard);
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard data:', error);
        // 에러 시 기본값 사용
        const defaultLeaderboard: LeaderboardEntry[] = [
          {
            rank: 1,
            name: '김환경',
            avatar: '🌱',
            totalCredits: 2500,
            carbonReduced: 45.2,
            badgeCount: 8,
            isCurrentUser: false
          },
          {
            rank: 2,
            name: '이지구',
            avatar: '🌍',
            totalCredits: 2200,
            carbonReduced: 38.7,
            badgeCount: 6,
            isCurrentUser: false
          },
          {
            rank: 3,
            name: '박에코',
            avatar: '🦋',
            totalCredits: 1950,
            carbonReduced: 32.1,
            badgeCount: 5,
            isCurrentUser: false
          },
          {
            rank: 4,
            name: '정그린',
            avatar: '🌿',
            totalCredits: 1800,
            carbonReduced: 28.5,
            badgeCount: 4,
            isCurrentUser: true
          },
          {
            rank: 5,
            name: '최자연',
            avatar: '🌸',
            totalCredits: 1650,
            carbonReduced: 25.3,
            badgeCount: 3,
            isCurrentUser: false
          }
        ];
        setLeaderboard(defaultLeaderboard);
      }
    };

    fetchLeaderboardData();

    // 시즌 이벤트 데이터 생성
    const seasonData: SeasonEvent = {
      id: 'spring_2024',
      name: '봄의 새싹 챌린지',
      description: '봄철 환경 보호 특별 이벤트',
      startDate: '2024-03-01',
      endDate: '2024-05-31',
      isActive: true,
      challenges: [
        {
          id: 'spring_walk',
          title: '봄 산책하기',
          description: '일주일에 3번 이상 도보로 이동',
          reward: 100,
          completed: true
        },
        {
          id: 'plant_tree',
          title: '나무 심기',
          description: '가상 나무 5그루 심기',
          reward: 200,
          completed: false
        },
        {
          id: 'energy_save',
          title: '에너지 절약',
          description: '한 달간 전기 사용량 10% 절약',
          reward: 300,
          completed: false
        }
      ],
      totalReward: 600
    };
    setCurrentSeason(seasonData);
  }, [creditsData]);

  // ✅ 데이터 불러오기 - 성능 최적화
  useEffect(() => {
    // 페이지 진입 시 스크롤을 최상단으로 이동
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!authUser?.user_id) {
        setData(DEMO_DATA);
        return;
      }

      // Set base data depending on user role
      let baseData = authUser.role === 'admin' 
        ? { co2_saved_today: 0, last7days: [] } // Admin starts with 0
        : { ...DEMO_DATA }; // Test user starts with DEMO

      let dashboardData: DashboardData = { ...DEMO_DATA, ...baseData };

      try {
        const response = await fetch(`${API_URL}/api/dashboard/${authUser.user_id}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          const result = await response.json();
          dashboardData = { ...dashboardData, ...result };
        }
      } catch (e) {
        console.warn("Dashboard API 연결 실패", e);
      }

      // 1. Overwrite with live data from contexts
      dashboardData.total_points = creditsData.totalCredits;
      dashboardData.total_saved = creditsData.totalCarbonReduced;
      dashboardData.garden_level = user.gardenLevel;

      // 2. Handle chart data based on user role
      if (authUser.role === 'admin') {
        if (!dashboardData.last7days || dashboardData.last7days.length === 0) {
          dashboardData.last7days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return { date: d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }), saved_g: 0 };
          }).reverse();
        }
      } else {
        // For 'test' user, ensure chart uses DEMO_DATA
        dashboardData.last7days = DEMO_DATA.last7days;
      }
      
      setData(dashboardData);
    };

    fetchData();
  }, [authUser, creditsData, user, API_URL]);

  // 데모 버전 - 실시간 업데이트 제거

  // ✅ 챗봇으로 이동하는 함수
  const goToChat = () => {
    window.location.href = '/chat';
  };

  // ✅ 데이터 새로고침 함수
  const refreshData = async () => {
    try {
      setError(null);
      
      // API 호출 시도 (타임아웃 설정)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2초 타임아웃
      
      const response = await fetch(`${API_URL}/api/dashboard/${userId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else {
        console.warn("Dashboard API 응답 없음, 데모 데이터 사용");
        // 데모 데이터로 업데이트
        setData(DEMO_DATA);
      }
    } catch (e) {
      console.warn("Dashboard API 연결 실패, 데모 데이터 사용:", e);
      // 데모 데이터로 업데이트
      setData(DEMO_DATA);
    }
  };

  // 데이터 분석 함수들
  const getFilteredData = () => {
    const now = new Date();
    const filteredData = trendData.filter(item => {
      const itemDate = new Date(item.date);
      const diffTime = now.getTime() - itemDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      switch (selectedPeriod) {
        case 'week':
          return diffDays <= 7;
        case 'month':
          return diffDays <= 30;
        case 'year':
          return diffDays <= 365;
        default:
          return true;
      }
    });
    
    return filteredData;
  };

  const calculateStats = () => {
    const filteredData = getFilteredData();
    if (filteredData.length === 0) return null;
    
    const totalCarbon = filteredData.reduce((sum, item) => sum + item.carbonReduced, 0);
    const totalCredits = filteredData.reduce((sum, item) => sum + item.creditsEarned, 0);
    const avgDaily = totalCarbon / filteredData.length;
    const bestDay = filteredData.reduce((max, item) => 
      item.carbonReduced > max.carbonReduced ? item : max
    );
    
    return {
      totalCarbon,
      totalCredits,
      avgDaily,
      bestDay
    };
  };

  // 게임화 헬퍼 함수들
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return '#95a5a6';
      case 'rare': return '#3498db';
      case 'epic': return '#9b59b6';
      case 'legendary': return '#f39c12';
      default: return '#95a5a6';
    }
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'common': return '0 0 5px rgba(149, 165, 166, 0.3)';
      case 'rare': return '0 0 10px rgba(52, 152, 219, 0.4)';
      case 'epic': return '0 0 15px rgba(155, 89, 182, 0.5)';
      case 'legendary': return '0 0 20px rgba(243, 156, 18, 0.6)';
      default: return '0 0 5px rgba(149, 165, 166, 0.3)';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  // ✅ 상태 처리 - 데이터가 없으면 기본 데이터 사용
  if (!data) {
    // 데이터가 없을 때는 기본 데이터를 사용하여 화면을 표시
    const defaultData = DEMO_DATA;
    return (
      <div className="dashboard-container">
        <PageHeader 
          title="대시보드" 
          subtitle="나의 친환경 활동 현황을 한눈에 확인하세요"
          icon="📊"
        />
        
        {/* 메인 통계 카드 */}
        <div className="dashboard-grid">
          <div className="card main-card">
            <div className="card-icon">🌱</div>
            <div className="card-content">
              <h3>오늘 절약한 탄소</h3>
              <p className="metric">{defaultData.co2_saved_today} g</p>
              <p className="sub-metric">+{defaultData.eco_credits_earned} 크레딧</p>
            </div>
          </div>
          
          <div className="card main-card">
            <div className="card-icon">💰</div>
            <div className="card-content">
              <h3>누적 절약량</h3>
              <p className="metric">{defaultData.total_saved} kg</p>
              <div className="credit-display-container">
                <p className={`sub-metric ${showCreditAnimation ? 'credit-updated' : ''}`}>
                  총 {defaultData.total_points} 크레딧
                </p>
                {showCreditAnimation && (
                  <div className={`credit-change-animation ${creditChange.type}`}>
                    {creditChange.type === 'earn' ? '+' : '-'}{creditChange.amount}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="card main-card">
            <div className="card-icon">🌿</div>
            <div className="card-content">
              <h3>정원 레벨</h3>
              <p className="metric">Lv.{defaultData.garden_level}</p>
              <p className="sub-metric">다음 레벨까지 {10 - (defaultData.garden_level * 2)}%</p>
            </div>
          </div>
          
          <div className="card main-card">
            <div className="card-icon">🏆</div>
            <div className="card-content">
              <h3>챌린지 진행</h3>
              <p className="metric">{Math.round((defaultData.challenge.progress / defaultData.challenge.goal) * 100)}%</p>
              <p className="sub-metric">{defaultData.challenge.progress}/{defaultData.challenge.goal} kg</p>
            </div>
          </div>
        </div>
        
        {/* 추가 섹션들 */}
        <div className="dashboard-sections">
          <div className="section">
            <h3>📈 최근 7일 탄소 절약</h3>
            <div className="chart-container">
              <div className="chart-bars">
                {defaultData.last7days.map((day: any, index: number) => (
                  <div key={index} className="chart-bar">
                    <div 
                      className="bar-fill" 
                      style={{ height: `${(day.saved_g / 2000) * 100}%` }}
                    ></div>
                    <span className="bar-label">{day.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="section">
            <h3>🚌 이동 수단별 절약량</h3>
            <div className="mode-stats">
              {defaultData.modeStats.map((mode: any, index: number) => (
                <div key={index} className="mode-item">
                  <span className="mode-icon">
                    {mode.mode === '지하철' ? '🚇' : 
                     mode.mode === '자전거' ? '🚲' : 
                     mode.mode === '버스' ? '🚌' : '🚶'}
                  </span>
                  <div className="mode-info">
                    <span className="mode-name">{mode.mode}</span>
                    <span className="mode-amount">{mode.saved_g}g</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <PageHeader 
        title="대시보드" 
        subtitle="나의 친환경 활동 현황을 한눈에 확인하세요"
        icon="📊"
        actions={
          <button
            onClick={refreshData}
            style={{
              background: "linear-gradient(135deg, #1abc9c, #16a085)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "8px 16px",
              fontSize: "0.9rem",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.3s ease"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, #16a085, #138d75)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, #1abc9c, #16a085)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            🔄 새로고침
          </button>
        }
      />
      
      {/* 요약 카드 */}
      <div
        className="dashboard-grid"
        style={{ gridTemplateColumns: "repeat(4, 1fr)" }}
      >
        <Link to="/credit?tab=recent" className="card clickable-card">
          <h4>오늘 절약한 탄소</h4>
          <p className="metric">
            {data.co2_saved_today?.toFixed(2)} <span>g</span>
          </p>
        </Link>
        <Link to="/credit?tab=points" className="card clickable-card">
          <h4>누적 절약량</h4>
          <p className="metric">
            {data.total_saved} <span>kg</span>
          </p>
        </Link>
        <Link to="/credit" className="card clickable-card">
          <h4>에코 크레딧</h4>
          <div className="credit-display-container">
            <p className={`metric ${showCreditAnimation ? 'credit-updated' : ''}`}>
              {data.total_points} <span>C</span>
            </p>
            {showCreditAnimation && (
              <div className={`credit-change-animation ${creditChange.type}`}>
                {creditChange.type === 'earn' ? '+' : '-'}{creditChange.amount}
              </div>
            )}
          </div>
        </Link>
        <Link to="/mygarden" className="card clickable-card">
          <h4>정원 레벨</h4>
          <p className="metric">Lv. {data.garden_level} 🌱</p>
        </Link>
      </div>

      {/* 📈 최근 7일 절감량 */}
      <div style={{ marginTop: "2rem" }}>
        <h4 style={{ fontSize: "1.3rem", marginBottom: "1.5rem" }}>📈 최근 7일 절감량 추이</h4>
        <div style={{ 
          background: "linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)", 
          padding: "2.5rem", 
          borderRadius: "20px",
          border: "1px solid rgba(26, 188, 156, 0.1)",
          boxShadow: "0 8px 25px rgba(26, 188, 156, 0.1)",
          position: "relative",
          overflow: "hidden"
        }}>
          {/* 차트 배경 그리드 */}
          <div style={{
            position: "absolute",
            top: "2.5rem",
            left: "2.5rem",
            right: "2.5rem",
            height: "180px",
            background: `
              linear-gradient(to right, rgba(26, 188, 156, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(26, 188, 156, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "20px 30px",
            zIndex: 1
          }}></div>
          
          {/* Y축 라벨 */}
          <div style={{
            position: "absolute",
            left: "2rem",
            top: "2.5rem",
            height: "180px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            zIndex: 2
          }}>
            {[2000, 1500, 1000, 500, 0].map((value) => (
              <span key={value} style={{ 
                fontSize: "0.75rem", 
                color: "#6b7280",
                fontWeight: "600",
                background: "rgba(255, 255, 255, 0.9)",
                padding: "2px 6px",
                borderRadius: "4px"
              }}>
                {value}g
              </span>
            ))}
          </div>

          {/* Y축 제목 */}
          <div style={{
            position: "absolute",
            left: "0.8rem",
            top: "50%",
            transform: "translateY(-50%) rotate(-90deg)",
            fontSize: "0.85rem",
            color: "#4a5568",
            fontWeight: "700",
            zIndex: 2,
            background: "rgba(255, 255, 255, 0.9)",
            padding: "4px 8px",
            borderRadius: "4px"
          }}>
            탄소 절감량 (g)
          </div>

          {/* 차트 바 */}
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "end", 
            height: "180px", 
            marginBottom: "1.5rem",
            paddingLeft: "4rem",
            paddingRight: "1rem",
            position: "relative",
            zIndex: 3
          }}>
            {data?.last7days?.map((day, index) => {
              const maxValue = Math.max(...data.last7days.map(d => d.saved_g));
              const height = (day.saved_g / maxValue) * 150;
              return (
                <div key={index} style={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  alignItems: "center",
                  flex: 1,
                  margin: "0 4px",
                  position: "relative"
                }}>
                  {/* 호버 효과를 위한 투명한 영역 */}
                  <div style={{
                    position: "absolute",
                    top: "-10px",
                    left: "-5px",
                    right: "-5px",
                    height: `${height + 20}px`,
                    zIndex: 4
                  }}></div>
                  
                  {/* 차트 바 */}
                  <div style={{
                    width: "28px",
                    height: `${height}px`,
                    background: "linear-gradient(to top, #1abc9c, #16a085)",
                    borderRadius: "14px 14px 0 0",
                    marginBottom: "8px",
                    minHeight: "8px",
                    position: "relative",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 12px rgba(26, 188, 156, 0.3)"
                  }}></div>
                  
                  {/* 데이터 포인트 */}
                  <div style={{
                    width: "8px",
                    height: "8px",
                    background: "#1abc9c",
                    borderRadius: "50%",
                    position: "absolute",
                    top: `${150 - height + 4}px`,
                    left: "50%",
                    transform: "translateX(-50%)",
                    boxShadow: "0 2px 6px rgba(26, 188, 156, 0.4)"
                  }}></div>
                  
                  <span style={{ 
                    fontSize: "0.7rem", 
                    color: "#6b7280",
                    fontWeight: "600",
                    textAlign: "center",
                    background: "rgba(255, 255, 255, 0.9)",
                    padding: "2px 4px",
                    borderRadius: "3px",
                    marginBottom: "2px"
                  }}>
                    {day.date}
                  </span>
                  <span style={{ 
                    fontSize: "0.7rem", 
                    color: "#6b7280",
                    fontWeight: "500"
                  }}>
                    {day.saved_g}g
                  </span>
                </div>
              );
            })}
          </div>
          
          {/* X축 제목 */}
          <div style={{
            textAlign: "center",
            paddingTop: "1rem",
            fontSize: "0.9rem",
            color: "#4a5568",
            fontWeight: "700"
          }}>
            날짜
          </div>

          {/* Disclaimer for test user */}
          {authUser?.role !== 'admin' && (
            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#7f8c8d', marginTop: '1rem' }}>
              임의로 생성된 표입니다(관리자 모드에서 제대로 작동하는 걸 확인할 수 있습니다)
            </p>
          )}

          {/* 차트 하단 정보 */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "1rem",
            borderTop: "1px solid rgba(26, 188, 156, 0.1)"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <div style={{
                width: "12px",
                height: "12px",
                background: "linear-gradient(135deg, #1abc9c, #16a085)",
                borderRadius: "2px"
              }}></div>
              <span style={{ 
                fontSize: "0.9rem", 
                color: "#4b5563",
                fontWeight: "500"
              }}>
                일일 절감량
              </span>
            </div>
            <span style={{ 
              fontSize: "0.9rem", 
              color: "#1abc9c",
              fontWeight: "700"
            }}>
              평균: {data?.last7days ? Math.round(data.last7days.reduce((sum, day) => sum + day.saved_g, 0) / data.last7days.length) : 0}g
            </span>
          </div>
        </div>
      </div>

      {/* 🚋 교통수단 비율 */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        marginTop: "2rem",
        marginBottom: "1.5rem"
      }}>
        <h4 style={{ margin: 0, fontSize: "1.3rem" }}>🚋 교통수단별 절감 비율</h4>
        <Link 
          to="/credit?tab=recent" 
          style={{ 
            color: "#1abc9c", 
            textDecoration: "none",
            fontSize: "0.9rem",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            background: "rgba(26, 188, 156, 0.1)",
            padding: "8px 12px",
            borderRadius: "20px",
            transition: "all 0.3s ease"
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "rgba(26, 188, 156, 0.2)";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "rgba(26, 188, 156, 0.1)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          자세히 보기 →
        </Link>
      </div>
      <div style={{ 
        background: "linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)", 
        padding: "2rem", 
        borderRadius: "20px",
        border: "1px solid rgba(26, 188, 156, 0.1)",
        boxShadow: "0 8px 25px rgba(26, 188, 156, 0.1)"
      }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem" }}>
          {data?.modeStats?.map((mode, index) => {
            const total = data.modeStats.reduce((sum, m) => sum + m.saved_g, 0);
            const percentage = total > 0 ? Math.round((mode.saved_g / total) * 100) : 0;
            return (
              <div key={index} style={{ 
                display: "flex", 
                alignItems: "center", 
                background: "rgba(255, 255, 255, 0.9)",
                padding: "1.2rem",
                borderRadius: "12px",
                border: "1px solid rgba(26, 188, 156, 0.1)",
                flex: "1",
                minWidth: "220px",
                boxShadow: "0 4px 15px rgba(26, 188, 156, 0.1)",
                transition: "all 0.3s ease"
              }}>
                <div style={{
                  width: "16px",
                  height: "16px",
                  background: COLORS[index % COLORS.length],
                  borderRadius: "50%",
                  marginRight: "0.8rem",
                  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)"
                }}></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "bold", marginBottom: "0.3rem", fontSize: "1rem", color: "#2c3e50" }}>{mode.mode}</div>
                  <div style={{ fontSize: "0.95rem", color: "#6b7280", fontWeight: "500" }}>
                    {mode.saved_g}g ({percentage}%)
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <p style={{ 
          textAlign: "center", 
          color: "#1abc9c", 
          margin: "1.5rem 0 0 0",
          fontSize: "1rem",
          fontWeight: "600"
        }}>
          총 절감량: {data?.modeStats ? data.modeStats.reduce((sum, mode) => sum + mode.saved_g, 0) : 0}g
        </p>
      </div>

      {/* 🌱 AI 피드백 */}
      <div
        className="ai-feedback"
        style={{
          marginTop: "2rem",
          fontSize: "1.2rem",
          background: "#f8f9fa",
          padding: "1rem",
          borderRadius: "10px",
          textAlign: "center",
        }}
      >
        {data.co2_saved_today > 5
          ? "이번 주 아주 잘하고 있어요 👏"
          : "조금 더 노력해볼까요? 🌱"}
        <br />
        목표까지 200g 남았어요 💪
      </div>

      {/* 🔥 챌린지 진행 상황 */}
      <div style={{ marginTop: "2rem" }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          marginBottom: "1rem"
        }}>
          <h4 style={{ margin: 0 }}>🔥 챌린지 진행 상황</h4>
          <Link 
            to="/challenge-achievements" 
            style={{ 
              color: "#1abc9c", 
              textDecoration: "none",
              fontSize: "0.9rem",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            자세히 보기 →
          </Link>
        </div>
        
        <div style={{
          background: "linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)",
          padding: "1.5rem",
          borderRadius: "15px",
          border: "1px solid rgba(26, 188, 156, 0.1)",
          boxShadow: "0 4px 15px rgba(26, 188, 156, 0.1)",
          marginBottom: "1rem"
        }}>
          <div style={{ marginBottom: "1rem" }}>
            <h5 style={{ 
              margin: "0 0 0.5rem 0", 
              color: "#2c3e50",
              fontSize: "1.1rem"
            }}>
              🚇 대중교통 이용 챌린지
            </h5>
            <p style={{ 
              margin: 0, 
              color: "#7f8c8d",
              fontSize: "0.9rem"
            }}>
              {data.challenge.goal}kg 절감 목표 중 {data.challenge.progress}kg 달성!
            </p>
          </div>
          
          <div style={{
            background: "#ecf0f1",
            borderRadius: "10px",
            overflow: "hidden",
            height: "25px",
            position: "relative"
          }}>
            <div
              style={{
                width: `${Math.min((data.challenge.progress / data.challenge.goal) * 100, 100)}%`,
                background: "linear-gradient(90deg, #1abc9c, #16a085)",
                height: "100%",
                textAlign: "center",
                color: "#fff",
                fontSize: "0.8rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "600",
                transition: "width 0.3s ease"
              }}
            >
              {Math.round((data.challenge.progress / data.challenge.goal) * 100)}%
            </div>
          </div>
          
          <div style={{ 
            marginTop: "0.8rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <span style={{ 
              fontSize: "0.8rem", 
              color: "#1abc9c",
              fontWeight: "600"
            }}>
              목표까지 {data.challenge.goal - data.challenge.progress}kg 남음
            </span>
            <span style={{ 
              fontSize: "0.8rem", 
              color: "#7f8c8d"
            }}>
              챌린지&업적 탭과 연동됨
            </span>
          </div>
        </div>
      </div>

      {/* 🤖 AI 챗봇과 연결 */}
      <div style={{ marginTop: "2rem" }}>
        <h4 style={{ fontSize: "1.3rem", marginBottom: "1.5rem" }}>🤖 AI 챗봇과 활동 기록하기</h4>
        <div style={{ 
          background: "linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)", 
          padding: "2rem", 
          borderRadius: "20px",
          border: "1px solid rgba(26, 188, 156, 0.1)",
          boxShadow: "0 8px 25px rgba(26, 188, 156, 0.1)"
        }}>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between",
            marginBottom: "1.5rem"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{
                width: "60px",
                height: "60px",
                background: "linear-gradient(135deg, #1abc9c, #16a085)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2rem",
                boxShadow: "0 4px 15px rgba(26, 188, 156, 0.3)"
              }}>
                🤖
              </div>
              <div>
                <h5 style={{ 
                  margin: "0 0 0.5rem 0", 
                  color: "#2c3e50",
                  fontSize: "1.2rem"
                }}>
                  AI 챗봇과 친환경 활동하기
                </h5>
                <p style={{ 
                  margin: 0, 
                  color: "#7f8c8d",
                  fontSize: "0.95rem"
                }}>
                  대화하며 활동을 기록하고 크레딧을 획득하세요!
                </p>
              </div>
            </div>
            <button
              onClick={goToChat}
              style={{ 
                background: "linear-gradient(135deg, #1abc9c, #16a085)",
                color: "white",
                border: "none",
                padding: "12px 24px",
                borderRadius: "20px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(26, 188, 156, 0.3)",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(26, 188, 156, 0.4)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 15px rgba(26, 188, 156, 0.3)";
              }}
            >
              대화 시작하기 →
            </button>
          </div>
          
          <div style={{ 
            display: "flex", 
            gap: "1rem",
            flexWrap: "wrap"
          }}>
            <div style={{
              background: "rgba(26, 188, 156, 0.1)",
              padding: "1rem",
              borderRadius: "12px",
              flex: "1",
              minWidth: "200px",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>🚇</div>
              <div style={{ 
                fontSize: "0.9rem", 
                fontWeight: "600",
                color: "#2c3e50",
                marginBottom: "0.3rem"
              }}>
                대중교통 이용
              </div>
              <div style={{ 
                fontSize: "0.8rem", 
                color: "#7f8c8d"
              }}>
                +150C 획득
              </div>
            </div>
            <div style={{
              background: "rgba(26, 188, 156, 0.1)",
              padding: "1rem",
              borderRadius: "12px",
              flex: "1",
              minWidth: "200px",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>🚴</div>
              <div style={{ 
                fontSize: "0.9rem", 
                fontWeight: "600",
                color: "#2c3e50",
                marginBottom: "0.3rem"
              }}>
                자전거 이용
              </div>
              <div style={{ 
                fontSize: "0.8rem", 
                color: "#7f8c8d"
              }}>
                +100C 획득
              </div>
            </div>
            <div style={{
              background: "rgba(26, 188, 156, 0.1)",
              padding: "1rem",
              borderRadius: "12px",
              flex: "1",
              minWidth: "200px",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>🌱</div>
              <div style={{ 
                fontSize: "0.9rem", 
                fontWeight: "600",
                color: "#2c3e50",
                marginBottom: "0.3rem"
              }}>
                에너지 절약
              </div>
              <div style={{ 
                fontSize: "0.8rem", 
                color: "#7f8c8d"
              }}>
                +50C 획득
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 📊 데이터 분석 및 인사이트 섹션 */}
      <div style={{ marginTop: "2rem" }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          marginBottom: "1.5rem"
        }}>
          <h4 style={{ margin: 0, fontSize: "1.3rem" }}>📊 데이터 분석 & 인사이트</h4>
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            style={{
              background: showAnalytics ? "linear-gradient(135deg, #e74c3c, #c0392b)" : "linear-gradient(135deg, #1abc9c, #16a085)",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "20px",
              fontSize: "0.9rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}
          >
            {showAnalytics ? "분석 숨기기" : "상세 분석 보기"}
          </button>
        </div>

        {showAnalytics && (
          <div style={{
            background: "linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)",
            padding: "2rem",
            borderRadius: "20px",
            border: "1px solid rgba(26, 188, 156, 0.1)",
            boxShadow: "0 8px 25px rgba(26, 188, 156, 0.1)"
          }}>
            {/* 기간 선택 */}
            <div style={{ marginBottom: "2rem" }}>
              <h5 style={{ margin: "0 0 1rem 0", color: "#2c3e50" }}>📈 분석 기간</h5>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {['week', 'month', 'year'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period as 'week' | 'month' | 'year')}
                    style={{
                      background: selectedPeriod === period 
                        ? "linear-gradient(135deg, #1abc9c, #16a085)" 
                        : "#f8f9fa",
                      color: selectedPeriod === period ? "white" : "#6b7280",
                      border: "1px solid #e9ecef",
                      padding: "0.6rem 1.2rem",
                      borderRadius: "20px",
                      fontSize: "0.9rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.3s ease"
                    }}
                  >
                    {period === 'week' ? '최근 1주일' : period === 'month' ? '최근 1개월' : '최근 1년'}
                  </button>
                ))}
              </div>
            </div>

            {/* 탄소 절감 트렌드 분석 */}
            {(() => {
              const stats = calculateStats();
              if (!stats) return null;
              
              return (
                <div style={{ marginBottom: "2rem" }}>
                  <h5 style={{ margin: "0 0 1rem 0", color: "#2c3e50" }}>🌱 탄소 절감 트렌드 분석</h5>
                  <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
                    gap: "1rem",
                    marginBottom: "1.5rem"
                  }}>
                    <div style={{
                      background: "white",
                      padding: "1rem",
                      borderRadius: "10px",
                      border: "1px solid rgba(26, 188, 156, 0.2)",
                      textAlign: "center"
                    }}>
                      <h6 style={{ margin: "0 0 0.5rem 0", color: "#1abc9c" }}>총 절감량</h6>
                      <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: "700", color: "#2c3e50" }}>
                        {stats.totalCarbon.toFixed(1)}kg
                      </p>
                    </div>
                    <div style={{
                      background: "white",
                      padding: "1rem",
                      borderRadius: "10px",
                      border: "1px solid rgba(26, 188, 156, 0.2)",
                      textAlign: "center"
                    }}>
                      <h6 style={{ margin: "0 0 0.5rem 0", color: "#1abc9c" }}>일평균 절감량</h6>
                      <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: "700", color: "#2c3e50" }}>
                        {stats.avgDaily.toFixed(2)}kg
                      </p>
                    </div>
                    <div style={{
                      background: "white",
                      padding: "1rem",
                      borderRadius: "10px",
                      border: "1px solid rgba(26, 188, 156, 0.2)",
                      textAlign: "center"
                    }}>
                      <h6 style={{ margin: "0 0 0.5rem 0", color: "#1abc9c" }}>최고 기록</h6>
                      <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: "700", color: "#2c3e50" }}>
                        {stats.bestDay.carbonReduced.toFixed(1)}kg
                      </p>
                      <p style={{ margin: 0, fontSize: "0.8rem", color: "#6b7280" }}>
                        {stats.bestDay.date}
                      </p>
                    </div>
                    <div style={{
                      background: "white",
                      padding: "1rem",
                      borderRadius: "10px",
                      border: "1px solid rgba(26, 188, 156, 0.2)",
                      textAlign: "center"
                    }}>
                      <h6 style={{ margin: "0 0 0.5rem 0", color: "#1abc9c" }}>획득 크레딧</h6>
                      <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: "700", color: "#2c3e50" }}>
                        {stats.totalCredits}C
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 개인 탄소 발자국 분석 */}
            {carbonFootprint && (
              <div style={{ marginBottom: "2rem" }}>
                <h5 style={{ margin: "0 0 1rem 0", color: "#2c3e50" }}>👣 개인 탄소 발자국 분석</h5>
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
                  gap: "1rem"
                }}>
                  <div style={{
                    background: "white",
                    padding: "1.5rem",
                    borderRadius: "15px",
                    border: "1px solid rgba(26, 188, 156, 0.2)"
                  }}>
                    <h6 style={{ margin: "0 0 1rem 0", color: "#1abc9c" }}>분야별 기여도</h6>
                    <div style={{ marginBottom: "0.8rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                        <span style={{ fontSize: "0.9rem" }}>교통수단</span>
                        <span style={{ fontSize: "0.9rem", fontWeight: "600" }}>{carbonFootprint.transport.toFixed(1)}kg</span>
                      </div>
                      <div style={{
                        background: "#ecf0f1",
                        borderRadius: "10px",
                        height: "8px",
                        overflow: "hidden"
                      }}>
                        <div style={{
                          background: "linear-gradient(90deg, #1abc9c, #16a085)",
                          height: "100%",
                          width: `${(carbonFootprint.transport / carbonFootprint.total) * 100}%`,
                          transition: "width 0.3s ease"
                        }}></div>
                      </div>
                    </div>
                    <div style={{ marginBottom: "0.8rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                        <span style={{ fontSize: "0.9rem" }}>에너지 절약</span>
                        <span style={{ fontSize: "0.9rem", fontWeight: "600" }}>{carbonFootprint.energy.toFixed(1)}kg</span>
                      </div>
                      <div style={{
                        background: "#ecf0f1",
                        borderRadius: "10px",
                        height: "8px",
                        overflow: "hidden"
                      }}>
                        <div style={{
                          background: "linear-gradient(90deg, #f39c12, #e67e22)",
                          height: "100%",
                          width: `${(carbonFootprint.energy / carbonFootprint.total) * 100}%`,
                          transition: "width 0.3s ease"
                        }}></div>
                      </div>
                    </div>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                        <span style={{ fontSize: "0.9rem" }}>생활습관</span>
                        <span style={{ fontSize: "0.9rem", fontWeight: "600" }}>{carbonFootprint.lifestyle.toFixed(1)}kg</span>
                      </div>
                      <div style={{
                        background: "#ecf0f1",
                        borderRadius: "10px",
                        height: "8px",
                        overflow: "hidden"
                      }}>
                        <div style={{
                          background: "linear-gradient(90deg, #e74c3c, #c0392b)",
                          height: "100%",
                          width: `${(carbonFootprint.lifestyle / carbonFootprint.total) * 100}%`,
                          transition: "width 0.3s ease"
                        }}></div>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    background: "white",
                    padding: "1.5rem",
                    borderRadius: "15px",
                    border: "1px solid rgba(26, 188, 156, 0.2)"
                  }}>
                    <h6 style={{ margin: "0 0 1rem 0", color: "#1abc9c" }}>비교 분석</h6>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "0.9rem" }}>국가 평균</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span style={{ fontSize: "0.9rem", fontWeight: "600" }}>{carbonFootprint.comparison.national}kg</span>
                          <span style={{ 
                            fontSize: "0.8rem", 
                            color: carbonFootprint.total > carbonFootprint.comparison.national ? "#27ae60" : "#e74c3c"
                          }}>
                            {carbonFootprint.total > carbonFootprint.comparison.national ? "🏆 평균 이상" : "📈 개선 필요"}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "0.9rem" }}>지역 평균</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span style={{ fontSize: "0.9rem", fontWeight: "600" }}>{carbonFootprint.comparison.regional}kg</span>
                          <span style={{ 
                            fontSize: "0.8rem", 
                            color: carbonFootprint.total > carbonFootprint.comparison.regional ? "#27ae60" : "#e74c3c"
                          }}>
                            {carbonFootprint.total > carbonFootprint.comparison.regional ? "🌟 지역 리더" : "🌱 성장 중"}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "0.9rem" }}>친구들 평균</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span style={{ fontSize: "0.9rem", fontWeight: "600" }}>{carbonFootprint.comparison.friends}kg</span>
                          <span style={{ 
                            fontSize: "0.8rem", 
                            color: carbonFootprint.total > carbonFootprint.comparison.friends ? "#27ae60" : "#e74c3c"
                          }}>
                            {carbonFootprint.total > carbonFootprint.comparison.friends ? "👑 친구들 중 1위" : "🤝 함께 성장"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 지역별 환경 지수 */}
            {regionalIndex && (
              <div style={{ marginBottom: "2rem" }}>
                <h5 style={{ margin: "0 0 1rem 0", color: "#2c3e50" }}>🏘️ 지역별 환경 지수</h5>
                <div style={{
                  background: "white",
                  padding: "1.5rem",
                  borderRadius: "15px",
                  border: "1px solid rgba(26, 188, 156, 0.2)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <h6 style={{ margin: 0, color: "#1abc9c" }}>{regionalIndex.region} 종합 점수</h6>
                    <div style={{
                      background: "linear-gradient(135deg, #1abc9c, #16a085)",
                      color: "white",
                      padding: "0.8rem 1.2rem",
                      borderRadius: "50%",
                      fontSize: "1.2rem",
                      fontWeight: "700",
                      minWidth: "60px",
                      textAlign: "center"
                    }}>
                      {regionalIndex.overallScore}
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                    {[
                      { label: "대기질", value: regionalIndex.airQuality, color: "#3498db" },
                      { label: "녹지율", value: regionalIndex.greenSpace, color: "#27ae60" },
                      { label: "대중교통", value: regionalIndex.publicTransport, color: "#1abc9c" },
                      { label: "재활용률", value: regionalIndex.recyclingRate, color: "#f39c12" }
                    ].map((item, index) => (
                      <div key={index}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                          <span style={{ fontSize: "0.9rem" }}>{item.label}</span>
                          <span style={{ fontSize: "0.9rem", fontWeight: "600" }}>{item.value}점</span>
                        </div>
                        <div style={{
                          background: "#ecf0f1",
                          borderRadius: "10px",
                          height: "8px",
                          overflow: "hidden"
                        }}>
                          <div style={{
                            background: item.color,
                            height: "100%",
                            width: `${item.value}%`,
                            transition: "width 0.3s ease"
                          }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* AI 인사이트 */}
            <div>
              <h5 style={{ margin: "0 0 1rem 0", color: "#2c3e50" }}>🤖 AI 인사이트</h5>
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
                gap: "1rem" 
              }}>
                <div style={{
                  background: "white",
                  padding: "1.5rem",
                  borderRadius: "15px",
                  border: "1px solid rgba(26, 188, 156, 0.2)"
                }}>
                  <h6 style={{ margin: "0 0 0.8rem 0", color: "#1abc9c" }}>💡 개인화된 조언</h6>
                  <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: "1.5", color: "#2c3e50" }}>
                    {carbonFootprint && carbonFootprint.total > 10 
                      ? "환경 리더로서의 역할을 잘 수행하고 있습니다! 이제 주변 사람들에게 영향력을 전파해보세요."
                      : "탄소 절감량을 늘리기 위해 대중교통 이용을 늘리고, 에너지 절약 습관을 만들어보세요."
                    }
                  </p>
                </div>
                <div style={{
                  background: "white",
                  padding: "1.5rem",
                  borderRadius: "15px",
                  border: "1px solid rgba(26, 188, 156, 0.2)"
                }}>
                  <h6 style={{ margin: "0 0 0.8rem 0", color: "#1abc9c" }}>📈 성장 전략</h6>
                  <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: "1.5", color: "#2c3e50" }}>
                    {(() => {
                      const stats = calculateStats();
                      return stats && stats.avgDaily > 1.5
                        ? "현재 페이스가 훌륭합니다! 이 추세를 유지하면서 새로운 챌린지에 도전해보세요."
                        : "일일 목표를 1.5kg로 설정하고, 꾸준한 실천을 통해 목표를 달성해보세요.";
                    })()}
                  </p>
                </div>
                <div style={{
                  background: "white",
                  padding: "1.5rem",
                  borderRadius: "15px",
                  border: "1px solid rgba(26, 188, 156, 0.2)"
                }}>
                  <h6 style={{ margin: "0 0 0.8rem 0", color: "#1abc9c" }}>🌍 지역 기여도</h6>
                  <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: "1.5", color: "#2c3e50" }}>
                    {regionalIndex && regionalIndex.overallScore > 75
                      ? "우리 지역의 환경 지수가 높습니다! 지역 환경 개선에 기여하고 있습니다."
                      : "지역 환경 개선을 위해 더 많은 환경 활동에 참여해보세요."
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 🎮 게임화 기능 섹션 */}
      <div style={{ marginTop: "2rem" }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          marginBottom: "1.5rem"
        }}>
          <h4 style={{ margin: 0, fontSize: "1.3rem" }}>🎮 게임화 & 성취</h4>
          <button
            onClick={() => setShowGameFeatures(!showGameFeatures)}
            style={{
              background: showGameFeatures ? "linear-gradient(135deg, #e74c3c, #c0392b)" : "linear-gradient(135deg, #9b59b6, #8e44ad)",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "20px",
              fontSize: "0.9rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}
          >
            {showGameFeatures ? "게임 기능 숨기기" : "게임 기능 보기"}
          </button>
        </div>

        {showGameFeatures && (
          <div style={{
            background: "linear-gradient(135deg, #ffffff 0%, #f8f4ff 100%)",
            padding: "2rem",
            borderRadius: "20px",
            border: "1px solid rgba(155, 89, 182, 0.1)",
            boxShadow: "0 8px 25px rgba(155, 89, 182, 0.1)"
          }}>
            {/* 배지 시스템 */}
            <div style={{ marginBottom: "2rem" }}>
              <h5 style={{ margin: "0 0 1rem 0", color: "#2c3e50" }}>🏆 배지 시스템</h5>
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
                gap: "1rem",
                marginBottom: "1.5rem"
              }}>
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    style={{
                      background: badge.unlocked 
                        ? "linear-gradient(135deg, #ffffff, #f8f9fa)" 
                        : "linear-gradient(135deg, #f8f9fa, #e9ecef)",
                      padding: "1.5rem",
                      borderRadius: "15px",
                      border: `2px solid ${badge.unlocked ? getRarityColor(badge.rarity) : '#dee2e6'}`,
                      textAlign: "center",
                      position: "relative",
                      opacity: badge.unlocked ? 1 : 0.6,
                      boxShadow: badge.unlocked ? getRarityGlow(badge.rarity) : "0 2px 5px rgba(0,0,0,0.1)",
                      transition: "all 0.3s ease"
                    }}
                  >
                    {badge.unlocked && (
                      <div style={{
                        position: "absolute",
                        top: "-8px",
                        right: "-8px",
                        background: getRarityColor(badge.rarity),
                        color: "white",
                        borderRadius: "50%",
                        width: "24px",
                        height: "24px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.8rem",
                        fontWeight: "700"
                      }}>
                        ✓
                      </div>
                    )}
                    <div style={{ fontSize: "2.5rem", marginBottom: "0.8rem" }}>
                      {badge.icon}
                    </div>
                    <h6 style={{ 
                      margin: "0 0 0.5rem 0", 
                      color: badge.unlocked ? getRarityColor(badge.rarity) : "#6c757d",
                      fontSize: "1rem",
                      fontWeight: "700"
                    }}>
                      {badge.name}
                    </h6>
                    <p style={{ 
                      margin: "0 0 0.8rem 0", 
                      fontSize: "0.8rem", 
                      color: "#6c757d",
                      lineHeight: "1.4"
                    }}>
                      {badge.description}
                    </p>
                    {badge.progress !== undefined && badge.maxProgress !== undefined && (
                      <div>
                        <div style={{
                          background: "#e9ecef",
                          borderRadius: "10px",
                          height: "6px",
                          overflow: "hidden",
                          marginBottom: "0.3rem"
                        }}>
                          <div style={{
                            background: badge.unlocked ? getRarityColor(badge.rarity) : "#6c757d",
                            height: "100%",
                            width: `${(badge.progress / badge.maxProgress) * 100}%`,
                            transition: "width 0.3s ease"
                          }}></div>
                        </div>
                        <span style={{ 
                          fontSize: "0.7rem", 
                          color: "#6c757d",
                          fontWeight: "600"
                        }}>
                          {badge.progress}/{badge.maxProgress}
                        </span>
                      </div>
                    )}
                    {badge.unlocked && badge.unlockedAt && (
                      <p style={{ 
                        margin: "0.5rem 0 0 0", 
                        fontSize: "0.7rem", 
                        color: getRarityColor(badge.rarity),
                        fontWeight: "600"
                      }}>
                        {badge.unlockedAt} 획득
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 리더보드 */}
            <div style={{ marginBottom: "2rem" }}>
              <h5 style={{ margin: "0 0 1rem 0", color: "#2c3e50" }}>🏅 친구 리더보드</h5>
              <div style={{
                background: "white",
                padding: "1.5rem",
                borderRadius: "15px",
                border: "1px solid rgba(155, 89, 182, 0.2)"
              }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                  {leaderboard.map((entry) => (
                    <div
                      key={entry.rank}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "1rem",
                        borderRadius: "10px",
                        background: entry.isCurrentUser 
                          ? "linear-gradient(135deg, #e8f5e8, #f0f8f0)" 
                          : "#f8f9fa",
                        border: entry.isCurrentUser 
                          ? "2px solid #27ae60" 
                          : "1px solid #e9ecef",
                        transition: "all 0.3s ease"
                      }}
                    >
                      <div style={{ 
                        fontSize: "1.5rem", 
                        marginRight: "1rem",
                        minWidth: "40px",
                        textAlign: "center"
                      }}>
                        {getRankIcon(entry.rank)}
                      </div>
                      <div style={{ 
                        fontSize: "1.5rem", 
                        marginRight: "1rem" 
                      }}>
                        {entry.avatar}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h6 style={{ 
                          margin: "0 0 0.3rem 0", 
                          color: entry.isCurrentUser ? "#27ae60" : "#2c3e50",
                          fontWeight: "700"
                        }}>
                          {entry.name} {entry.isCurrentUser && "(나)"}
                        </h6>
                        <div style={{ display: "flex", gap: "1rem", fontSize: "0.8rem", color: "#6c757d" }}>
                          <span>💎 {entry.totalCredits}C</span>
                          <span>🌱 {entry.carbonReduced}kg</span>
                          <span>🏆 {entry.badgeCount}개</span>
                        </div>
                      </div>
                      {entry.rank <= 3 && (
                        <div style={{
                          background: entry.rank === 1 ? "#f39c12" : entry.rank === 2 ? "#95a5a6" : "#cd7f32",
                          color: "white",
                          padding: "0.3rem 0.8rem",
                          borderRadius: "15px",
                          fontSize: "0.8rem",
                          fontWeight: "700"
                        }}>
                          {entry.rank === 1 ? "1위" : entry.rank === 2 ? "2위" : "3위"}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 시즌 이벤트 */}
            {currentSeason && (
              <div style={{ marginBottom: "2rem" }}>
                <h5 style={{ margin: "0 0 1rem 0", color: "#2c3e50" }}>🌸 시즌 이벤트</h5>
                <div style={{
                  background: "white",
                  padding: "1.5rem",
                  borderRadius: "15px",
                  border: "1px solid rgba(155, 89, 182, 0.2)"
                }}>
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center",
                    marginBottom: "1rem"
                  }}>
                    <div>
                      <h6 style={{ margin: "0 0 0.3rem 0", color: "#9b59b6", fontSize: "1.1rem" }}>
                        {currentSeason.name}
                      </h6>
                      <p style={{ margin: 0, fontSize: "0.9rem", color: "#6c757d" }}>
                        {currentSeason.description}
                      </p>
                    </div>
                    <div style={{
                      background: currentSeason.isActive 
                        ? "linear-gradient(135deg, #27ae60, #2ecc71)" 
                        : "linear-gradient(135deg, #95a5a6, #7f8c8d)",
                      color: "white",
                      padding: "0.5rem 1rem",
                      borderRadius: "20px",
                      fontSize: "0.8rem",
                      fontWeight: "700"
                    }}>
                      {currentSeason.isActive ? "진행중" : "종료"}
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: "1rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                      <span style={{ fontSize: "0.9rem", color: "#2c3e50" }}>이벤트 기간</span>
                      <span style={{ fontSize: "0.9rem", color: "#6c757d" }}>
                        {currentSeason.startDate} ~ {currentSeason.endDate}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "0.9rem", color: "#2c3e50" }}>총 보상</span>
                      <span style={{ fontSize: "0.9rem", color: "#9b59b6", fontWeight: "700" }}>
                        {currentSeason.totalReward} 크레딧
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                    {currentSeason.challenges.map((challenge) => (
                      <div
                        key={challenge.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          padding: "1rem",
                          borderRadius: "10px",
                          background: challenge.completed 
                            ? "linear-gradient(135deg, #e8f5e8, #f0f8f0)" 
                            : "#f8f9fa",
                          border: challenge.completed 
                            ? "2px solid #27ae60" 
                            : "1px solid #e9ecef"
                        }}
                      >
                        <div style={{ 
                          fontSize: "1.2rem", 
                          marginRight: "1rem",
                          color: challenge.completed ? "#27ae60" : "#6c757d"
                        }}>
                          {challenge.completed ? "✅" : "⏳"}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h6 style={{ 
                            margin: "0 0 0.3rem 0", 
                            color: challenge.completed ? "#27ae60" : "#2c3e50",
                            fontSize: "0.9rem"
                          }}>
                            {challenge.title}
                          </h6>
                          <p style={{ 
                            margin: 0, 
                            fontSize: "0.8rem", 
                            color: "#6c757d",
                            lineHeight: "1.4"
                          }}>
                            {challenge.description}
                          </p>
                        </div>
                        <div style={{
                          background: challenge.completed ? "#27ae60" : "#6c757d",
                          color: "white",
                          padding: "0.3rem 0.8rem",
                          borderRadius: "15px",
                          fontSize: "0.8rem",
                          fontWeight: "700"
                        }}>
                          +{challenge.reward}C
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 가상 아이템 미리보기 */}
            <div>
              <h5 style={{ margin: "0 0 1rem 0", color: "#2c3e50" }}>🎨 가상 아이템</h5>
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", 
                gap: "1rem" 
              }}>
                <div style={{
                  background: "white",
                  padding: "1.5rem",
                  borderRadius: "15px",
                  border: "1px solid rgba(155, 89, 182, 0.2)",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.3s ease"
                }}>
                  <div style={{ fontSize: "2rem", marginBottom: "0.8rem" }}>🌻</div>
                  <h6 style={{ margin: "0 0 0.5rem 0", color: "#2c3e50" }}>정원 꾸미기</h6>
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "#6c757d" }}>
                    정원에 특별한 아이템 추가
                  </p>
                </div>
                <div style={{
                  background: "white",
                  padding: "1.5rem",
                  borderRadius: "15px",
                  border: "1px solid rgba(155, 89, 182, 0.2)",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.3s ease"
                }}>
                  <div style={{ fontSize: "2rem", marginBottom: "0.8rem" }}>👤</div>
                  <h6 style={{ margin: "0 0 0.5rem 0", color: "#2c3e50" }}>아바타 커스터마이징</h6>
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "#6c757d" }}>
                    나만의 아바타 만들기
                  </p>
                </div>
                <div style={{
                  background: "white",
                  padding: "1.5rem",
                  borderRadius: "15px",
                  border: "1px solid rgba(155, 89, 182, 0.2)",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.3s ease"
                }}>
                  <div style={{ fontSize: "2rem", marginBottom: "0.8rem" }}>🏠</div>
                  <h6 style={{ margin: "0 0 0.5rem 0", color: "#2c3e50" }}>환경 인테리어</h6>
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "#6c757d" }}>
                    친환경 인테리어 아이템
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
