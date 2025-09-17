import React, { useEffect, useState } from "react";
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
  const [gardenData, setGardenData] = useState<GardenData>({
    totalCarbonReduced: 18.5,
    ecoPoints: 1240,
  });
  const [loading, setLoading] = useState(true);

  const [stage, setStage] = useState(0);
  const [waterCount, setWaterCount] = useState(0);
  const [animate, setAnimate] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("");

  useEffect(() => {
    const fetchGardenData = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/garden/prototype_user"
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
      } finally {
        setLoading(false);
      }
    };

    fetchGardenData();
  }, []);

  const handleWater = () => {
    const hasEnough = gardenData.ecoPoints >= WATER_COST;
    if (!hasEnough && !ALLOW_FREE_WATER_WHEN_NO_CREDIT) {
      alert("크레딧이 부족합니다. 대중교통 이용 등으로 크레딧을 모아주세요.");
      return;
    }

    setAnimate(true);
    setTimeout(() => setAnimate(false), 500);

    if (hasEnough) {
      setGardenData((prev) => ({
        ...prev,
        ecoPoints: Math.max(0, prev.ecoPoints - WATER_COST),
      }));
    }

    const newCount = waterCount + 1;

    if (newCount >= WATERS_PER_STAGE) {
      if (stage >= 10) {
        setStatusMessage("최고 단계에 도달했습니다 🎉");
        setWaterCount(WATERS_PER_STAGE);
      } else {
        setStatusMessage("다음 단계로 넘어가요!");
        setStage((s) => Math.min(s + 1, 10));
        setWaterCount(0);
      }
    } else {
      setWaterCount(newCount);
      setStatusMessage("");
    }
  };

  if (loading) {
    return <div className="garden-card">불러오는 중...</div>;
  }

  const plantStage = getPlantStage(stage + 1);
  const weatherClass =
    gardenData.totalCarbonReduced > 1000 ? "weather-sunny" : "weather-rainy";

  return (
    <div className={`garden-card ${weatherClass}`}>
      <h3>🌱 나만의 정원</h3>

      {/* 상단 요약 칩 */}
      <div className="garden-chips">
        <span className="chip chip-points">P {gardenData.ecoPoints}</span>
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
          💧 물 주기 ({waterCount}/{WATERS_PER_STAGE}) —{" "}
          {gardenData.ecoPoints >= WATER_COST ? `-${WATER_COST}P` : "무료(데모)"}
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
            : `레벨 진행도: ${waterCount}/${WATERS_PER_STAGE}`)}
      </p>
    </div>
  );
};

export default MyGarden;
