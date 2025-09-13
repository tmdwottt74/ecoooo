import React from 'react';
import './MyGarden.css';

interface MyGardenProps {
  totalCarbonReduced: number;
}

const MyGarden: React.FC<MyGardenProps> = ({ totalCarbonReduced }) => {
  const getPlantStage = (carbonReduced: number) => {
    if (carbonReduced > 200) return { stage: '나무', className: 'tree' };
    if (carbonReduced > 100) return { stage: '꽃', className: 'flower' };
    if (carbonReduced > 50) return { stage: '성장', className: 'growing' };
    return { stage: '새싹', className: 'seedling' };
  };

  const { stage, className } = getPlantStage(totalCarbonReduced);

  const renderDecorations = () => {
    if (totalCarbonReduced > 150) {
      return (
        <div className="garden-decorations">
          <div className="sun"></div>
          <div className="bird"></div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="my-garden-container">
      {renderDecorations()}
      <div className="garden-soil"></div>
      <div className={`garden-plant ${className}`}>
        <div className="garden-plant-stem"></div>
        {className === 'flower' && (
          <div className="petals">
            <div className="petal"></div>
            <div className="petal"></div>
            <div className="petal"></div>
          </div>
        )}
        {className === 'tree' && (
          <div className="leaves">
            <div className="leaf"></div>
            <div className="leaf"></div>
            <div className="leaf"></div>
          </div>
        )}
      </div>
      <h3>나만의 정원</h3>
      <div className="garden-stats">
        <p>총 탄소 절감량: {totalCarbonReduced.toFixed(2)} kg</p>
        <p>현재 식물: {stage}</p>
      </div>
      <p className="garden-message">
        에코 활동을 통해 나만의 정원을 가꿔보세요!
      </p>
    </div>
  );
};

export default MyGarden;
