import React, { useEffect, useState } from "react";
import "./MyGarden.css";

interface GardenData {
  totalCarbonReduced: number;
  ecoPoints: number;
}

// 레벨 계산 로직
const getGardenLevel = (ecoPoints: number): number => {
  if (ecoPoints < 100) return 1;
  if (ecoPoints < 200) return 2;
  if (ecoPoints < 300) return 3;
  return 4;
};

// 진행도 계산
const getProgressPercent = (ecoPoints: number): number => {
  if (ecoPoints < 100) return (ecoPoints / 100) * 100;
  if (ecoPoints < 200) return ((ecoPoints - 100) / 100) * 100;
  if (ecoPoints < 300) return ((ecoPoints - 200) / 100) * 100;
  return 100;
};

// 레벨별 식물 단계
const getPlantStage = (level: number): string => {
  switch (level) {
    case 1:
      return "씨앗 단계 🌰";
    case 2:
      return "새싹 단계 🌱";
    case 3:
      return "꽃 단계 🌸";
    case 4:
      return "나무 단계 🌳";
    default:
      return "알 수 없음 ❓";
  }
};

// ✅ 수정: 이미지 경로를 객체로 정의
const plantImages: { [key: number]: string } = {
  1: "/seed.png",
  2: "/sprout.png",
  3: "/flower.png",
  4: "/tree.png",
};

const MyGarden: React.FC = () => {
  const [gardenData, setGardenData] = useState<GardenData>({
    totalCarbonReduced: 0,
    ecoPoints: 0,
  });
  const [loading, setLoading] = useState(true);

  // ✅ DB 연동: FastAPI에서 데이터 불러오기
  useEffect(() => {
    const fetchGardenData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/garden/prototype_user");
        const data = await response.json();
        setGardenData({
          totalCarbonReduced: data.total_carbon_reduced,
          ecoPoints: data.total_points,
        });
      } catch (error) {
        console.error("Error fetching garden data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGardenData();
  }, []);

  if (loading) {
    return <div className="garden-card">불러오는 중...</div>;
  }

  const gardenLevel = getGardenLevel(gardenData.ecoPoints);
  const plantStage = getPlantStage(gardenLevel);
  const progressPercent = getProgressPercent(gardenData.ecoPoints);

  // ✅ 수정: plantImages 객체에서 이미지 경로를 가져옴
  const plantImage = plantImages[gardenLevel];
  const weatherClass = gardenData.totalCarbonReduced > 1000 ? "weather-sunny" : "weather-rainy";

  return (
    <div className={`garden-card ${weatherClass}`}>
      <h3>🌱 나만의 정원</h3>
      <div className="plant-display">
        <img
          src={plantImage} // ✅ 수정: 동적 이미지 경로 사용
          alt="Plant"
          className={`plant-stage-${gardenLevel}`} // ✅ 수정: 레벨에 따른 클래스 적용
        />
      </div>
      <p>총 탄소 절감량: {gardenData.totalCarbonReduced} kg</p>
      <p>에코 포인트: {gardenData.ecoPoints} 점</p>
      <p>현재 식물: {plantStage}</p>
      <div className="progress-bar">
        <div
          className="progress"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>
      <p className="garden-message">
        {gardenLevel < 4
          ? `다음 레벨까지 ${(100 - progressPercent).toFixed(0)}% 남았어요!`
          : "최고 단계에 도달했습니다 🎉"}
      </p>
    </div>
  );
};

export default MyGarden;