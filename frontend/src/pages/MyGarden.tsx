import React, { useEffect, useState } from "react";
import { useCredits } from "../contexts/CreditsContext";
import PageHeader from "../components/PageHeader";
import "./MyGarden.css";

// 🌿 레벨별 이미지 (public/0.png ~ public/10.png)
const levelImages: string[] = Array.from({ length: 11 }, (_, i) => `/${i}.png`);

// 💧 물주기 비용 및 단계 설정
const WATER_COST = 10;
const WATERS_PER_STAGE = 10;
const ALLOW_FREE_WATER_WHEN_NO_CREDIT = true;

// 🌱 Garden 데이터 타입
interface GardenData {
  totalCarbonReduced: number;
  ecoPoints: number;
}

// ecoPoints → 초기 단계 변환
const getStageFromPoints = (ecoPoints: number): number => {
  if (ecoPoints < 100) return 0; 
  if (ecoPoints < 200) return 1; 
  if (ecoPoints < 300) return 2; 
  return 3; 
};

// 레벨 → 텍스트
const levelNames: string[] = [
  "씨앗 단계 🌰",
  "싹 트는 단계 🌱",
  "새싹 단계 🌱",
  "어린 줄기 단계 🌿",
  "잎 전개 단계 🍃",
  "꽃봉오리 단계 🌼",
  "꽃 단계 🌸",
  "어린 나무 단계 🌳",
  "자라는 나무 단계 🌳",
  "우거진 나무 단계 🌳",
  "정원 완성 단계 🏡",
];
const getPlantStage = (level: number): string =>
  levelNames[Math.min(Math.max(level - 1, 0), levelNames.length - 1)];

const MyGarden: React.FC = () => {
  const { creditsData, addCredits, waterGarden } = useCredits();
  const [gardenData, setGardenData] = useState<GardenData>({
    totalCarbonReduced: creditsData.totalCarbonReduced,
    ecoPoints: creditsData.totalCredits,
  });
  const [loading, setLoading] = useState(true);
  const [isPreview, setIsPreview] = useState(false);

  const [stage, setStage] = useState(0);
  const [waterCount, setWaterCount] = useState(0);
  const [animate, setAnimate] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("");

  useEffect(() => {
    // 미리보기 모드 확인
    const urlParams = new URLSearchParams(window.location.search);
    const previewMode = urlParams.get('preview') === '1';
    setIsPreview(previewMode);

    const fetchGardenData = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8001/garden/prototype_user"
        );
        const data = await response.json();
        setGardenData({
          totalCarbonReduced: data.total_carbon_reduced,
          ecoPoints: data.total_points,
        });

        const initialStage = getStageFromPoints(data.total_points);
        setStage(initialStage);
      } catch (error) {
        console.error("Error fetching garden data:", error);
        // 오류 시 CreditsContext 데이터 사용
        setGardenData({
          totalCarbonReduced: creditsData.totalCarbonReduced,
          ecoPoints: creditsData.totalCredits,
        });
        const initialStage = getStageFromPoints(creditsData.totalCredits);
        setStage(initialStage);
      } finally {
        setLoading(false);
      }
    };

    fetchGardenData();
  }, []); // 의존성 배열에서 creditsData 제거하여 무한 루프 방지

  // 크레딧 데이터가 변경될 때마다 gardenData 업데이트
  useEffect(() => {
    setGardenData(prev => ({
      ...prev,
      totalCarbonReduced: creditsData.totalCarbonReduced,
      ecoPoints: creditsData.totalCredits,
    }));
    
    // 크레딧 변경 시 단계도 업데이트
    const newStage = getStageFromPoints(creditsData.totalCredits);
    setStage(newStage);
  }, [creditsData.totalCredits, creditsData.totalCarbonReduced]);

  const handleWater = async () => {
    setAnimate(true);
    setTimeout(() => setAnimate(false), 500);

    try {
      // 새로운 waterGarden API 사용
      const result = await waterGarden(WATER_COST);
      
      if (result.success) {
        setStatusMessage(`물주기 완료! -${WATER_COST}C`);
        
        const newCount = waterCount + 1;

        if (newCount >= WATERS_PER_STAGE) {
          if (stage >= 10) {
            setStatusMessage("최고 단계에 도달했습니다 🎉");
            setWaterCount(WATERS_PER_STAGE);
          } else {
            setStatusMessage("다음 단계로 넘어가요! 🌱");
            setStage((s) => Math.min(s + 1, 10));
            setWaterCount(0);
          }
        } else {
          setWaterCount(newCount);
          setStatusMessage(`물주기 완료! (${newCount}/${WATERS_PER_STAGE})`);
        }
      } else {
        setStatusMessage(result.message || "물주기에 실패했습니다.");
      }
    } catch (error) {
      console.error("물주기 실패:", error);
      setStatusMessage("물주기에 실패했습니다.");
    }
  };

  if (loading) {
    return <div className="garden-card">불러오는 중...</div>;
  }

  const plantStage = getPlantStage(stage + 1);
  const weatherClass =
    gardenData.totalCarbonReduced > 1000 ? "weather-sunny" : "weather-rainy";

  // 미리보기 모드일 때 간소화된 디자인
  if (isPreview) {
    return (
      <div className="garden-preview-card">
        <div className="preview-header">
          <h3>🌿 나만의 정원</h3>
          <div className="preview-stats">
            <span className="stat-item">C {gardenData.ecoPoints}</span>
            <span className="stat-item">Lv.{stage + 1}</span>
          </div>
        </div>
        
        <div className="preview-garden">
          <img
            src={levelImages[Math.min(stage, levelImages.length - 1)]}
            alt={getPlantStage(stage + 1)}
            className="preview-plant"
          />
        </div>
        
        <div className="preview-info">
          <p className="preview-stage">{plantStage}</p>
          <p className="preview-carbon">탄소 절감: {gardenData.totalCarbonReduced}kg</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`garden-card ${weatherClass}`}>
      <PageHeader 
        title="나만의 정원" 
        subtitle="크레딧으로 가상 정원을 꾸며보세요"
        icon="🌿"
      />

      <div className="garden-content">
        {/* 상단 요약 칩 */}
        <div className="garden-chips">
        <span className="chip chip-credits">C {gardenData.ecoPoints}</span>
        <span className="chip chip-stage">{plantStage}</span>
        <span className="chip chip-level">Lv.{stage + 1}</span>
      </div>

      {/* 현재 단계 이미지 */}
      <div className="garden-container">
        <div className="garden-stage">
          <img
            src={levelImages[Math.min(stage, levelImages.length - 1)]}
            alt={getPlantStage(stage + 1)}
            className={animate ? "plant animate" : "plant"}
          />
        </div>
        <button onClick={handleWater} className="water-btn">
          💧 물 주기 ({waterCount}/{WATERS_PER_STAGE}) — -{WATER_COST}C
        </button>
      </div>

      {/* 데이터 표시 */}
      <p className="garden-stats">
        총 탄소 절감량: {gardenData.totalCarbonReduced} kg
      </p>

      <p className="garden-message">
        {statusMessage ||
          (stage >= 10 && waterCount >= WATERS_PER_STAGE
            ? "최고 단계에 도달했습니다 🎉"
            : `물주기 완료! (${waterCount}/${WATERS_PER_STAGE})`)}
      </p>
      
      {/* 진행상황 바 */}
      <div className="progress-container">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${(waterCount / WATERS_PER_STAGE) * 100}%` }}
          ></div>
        </div>
        <div className="progress-text">
          {waterCount}/{WATERS_PER_STAGE} 단계 진행중
        </div>
      </div>
      </div>
    </div>
  );
};

export default MyGarden;
