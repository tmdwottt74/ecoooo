import React from 'react';
import './MyGarden.css';

interface GardenData {
  totalCarbonReduced: number;
  ecoPoints: number;
  plantStage: string;
}

const MyGarden: React.FC = () => {
  // 더미 데이터
  const gardenData: GardenData = {
    totalCarbonReduced: 37, // 예시 값
    ecoPoints: 150,
    plantStage: '새싹', // 식물 성장 단계 (새싹, 성장, 성숙 등)
  };

  return (
    <div className="my-garden-container">
      <div className="garden-soil"></div>
      <div className="garden-plant">
        <div className="garden-plant-stem"></div>
      </div>
      <h3>나만의 정원</h3>
      <div className="garden-stats">
        <p>총 탄소 절감량: {gardenData.totalCarbonReduced} kg</p>
        <p>에코 포인트: {gardenData.ecoPoints} 점</p>
        <p>현재 식물: {gardenData.plantStage}</p>
      </div>
      <p className="garden-message">
        에코 활동을 통해 나만의 정원을 가꿔보세요!
      </p>
    </div>
  );
};

export default MyGarden;
