import React, { useEffect, useState } from "react";
import { useCredits } from "../contexts/CreditsContext";
import { useUser } from "../contexts/UserContext";
import { useAppData } from "../contexts/AppDataContext";
import { useLoading } from "../contexts/LoadingContext";
import { sessionService } from "../services/sessionService";
import { creditService } from "../services/creditService";
import PageHeader from "../components/PageHeader";
import { getAuthHeaders } from "../contexts/CreditsContext";
import "./MyGarden.css";

// 🌿 레벨별 이미지 (public/0.png ~ public/10.png)
const levelImages: string[] = Array.from({ length: 11 }, (_, i) => `/${i}.png`);

// 💧 물주기 비용 및 단계 설정
const WATER_COST = 10;
const WATERS_PER_STAGE = 10;

// 🌱 Garden 데이터 타입
interface GardenStatus {
  level_number: number;
  level_name: string;
  waters_count: number;
  required_waters: number;
}

// 🌿 정원 진행상황 저장 타입
interface GardenProgress {
  stage: number;
  waterCount: number;
  lastUpdated: string;
}

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
  const { creditsData, refreshCredits } = useCredits();
  const { user } = useUser();
  const { refreshAllData } = useAppData();
  const { showLoading } = useLoading();

  const [gardenStatus, setGardenStatus] = useState<GardenStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("");

  const [isPreview, setIsPreview] = useState(false);

  // 진행상황 저장 함수
  const saveGardenProgress = async (currentStage: number, currentWaterCount: number) => {
    const progress: GardenProgress = {
      stage: currentStage,
      waterCount: currentWaterCount,
      lastUpdated: new Date().toISOString(),
    };
    try {
      await sessionService.saveSessionState("garden_progress", progress);
    } catch (error) {
      console.error("정원 진행상황 저장 실패:", error);
    }
  };

  // 진행상황 복원 함수
  const loadGardenProgress = async (): Promise<GardenProgress | null> => {
    try {
      const progress = await sessionService.getSessionState("garden_progress");
      if (progress) return progress as GardenProgress;
    } catch (error) {
      console.error("정원 진행상황 복원 실패:", error);
    }
    return null;
  };

  // 정원 데이터 불러오기
  const fetchGardenData = async () => {
    setLoading(true);
    if (!user || !user.id) {
      setStatusMessage("사용자 정보를 불러올 수 없습니다.");
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/credits/garden/${user.id}`,
        { headers: getAuthHeaders() }
      );
      if (!response.ok) throw new Error("Failed to fetch garden data");
      const data = await response.json();
      setGardenStatus(data);

      // 진행상황 저장
      await saveGardenProgress(data.level_number, data.waters_count);
    } catch (error) {
      console.error("Error fetching garden data:", error);
      setStatusMessage("정원 정보를 불러오는 데 실패했습니다. (데모 데이터 사용)");

      // 데모 데이터 fallback
      const demo: GardenStatus = {
        level_number: 3,
        level_name: "새싹 단계 🌱",
        waters_count: 4,
        required_waters: WATERS_PER_STAGE,
      };
      setGardenStatus(demo);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 페이지 진입 시 스크롤을 최상단으로 이동
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  useEffect(() => {
    // 미리보기 모드 확인
    const urlParams = new URLSearchParams(window.location.search);
    setIsPreview(urlParams.get("preview") === "1");

    // 저장된 진행상황 복원 우선
    const init = async () => {
      try {
        const saved = await loadGardenProgress();
        if (saved) {
          setGardenStatus({
            level_number: saved.stage,
            level_name: getPlantStage(saved.stage),
            waters_count: saved.waterCount,
            required_waters: WATERS_PER_STAGE,
          });
          setLoading(false);
        } else {
          fetchGardenData();
        }
      } catch (error) {
        console.error("Error loading garden progress:", error);
        // 오류 발생 시 데모 데이터로 fallback
        setGardenStatus({
          level_number: 3,
          level_name: "새싹 단계 🌱",
          waters_count: 4,
          required_waters: WATERS_PER_STAGE,
        });
        setLoading(false);
      }
    };
    init();
  }, [user, fetchGardenData]);

  const handleWater = async () => {
    if (!gardenStatus) return;

    if (creditsData.totalCredits < WATER_COST) {
      setStatusMessage("크레딧이 부족합니다!");
      return;
    }

    setAnimate(true);
    setTimeout(() => setAnimate(false), 500);

    try {
      // creditService + waterGarden 병행
      const result = await creditService.waterGarden(WATER_COST);
      if (result.success) {
        setStatusMessage(`물주기 완료! -${WATER_COST}C`);

        await Promise.all([fetchGardenData(), refreshCredits(), refreshAllData()]);
      } else {
        setStatusMessage(result.message || "물주기에 실패했습니다.");
      }
    } catch (error) {
      console.error("물주기 실패:", error);
      setStatusMessage("물주기에 실패했습니다.");
      // 실패 시 복구
      const saved = await loadGardenProgress();
      if (saved) {
        setGardenStatus({
          level_number: saved.stage,
          level_name: getPlantStage(saved.stage),
          waters_count: saved.waterCount,
          required_waters: WATERS_PER_STAGE,
        });
      }
    }
  };

  // 로딩 화면
  if (loading) {
    showLoading("정원 정보를 불러오는 중...");
    return null;
  }

  if (!gardenStatus) {
    return (
      <div className="garden-card">
        <div style={{ textAlign: "center", padding: "3rem" }}>
          정원 정보를 불러올 수 없습니다.
        </div>
      </div>
    );
  }

  const { level_number, waters_count, required_waters } = gardenStatus;
  const plantStage = getPlantStage(level_number);
  const progressPercentage = (waters_count / required_waters) * 100;

  // 미리보기 모드
  if (isPreview) {
    return (
      <div className="garden-preview-card">
        <div className="preview-header">
          <h3>🌿 나만의 정원</h3>
          <div className="preview-stats">
            <span className="stat-item">C {creditsData.totalCredits}</span>
            <span className="stat-item">Lv.{level_number}</span>
          </div>
        </div>
        <div className="preview-garden">
          <img
            src={levelImages[Math.min(level_number - 1, levelImages.length - 1)]}
            alt={plantStage}
            className="preview-plant"
          />
        </div>
        <div className="preview-info">
          <p className="preview-stage">{plantStage}</p>
          <p className="preview-carbon">
            탄소 절감: {creditsData.totalCarbonReduced.toFixed(2)}kg
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="garden-card">
      <PageHeader
        title="나만의 정원"
        subtitle="크레딧으로 가상 정원을 꾸며보세요"
        icon="🌿"
      />

      <div className="garden-content">
        {/* 상단 요약 칩 */}
        <div className="garden-chips">
          <span className="chip chip-credits">
            C {creditsData.totalCredits.toLocaleString()}
          </span>
          <span className="chip chip-stage">{plantStage}</span>
          <span className="chip chip-level">Lv.{level_number}</span>
        </div>

        {/* 현재 단계 이미지 */}
        <div className="garden-container">
          <div className="garden-stage">
            <img
              src={levelImages[Math.min(level_number - 1, levelImages.length - 1)]}
              alt={plantStage}
              className={animate ? "plant animate" : "plant"}
            />
          </div>
          <button
            onClick={handleWater}
            className="water-btn"
            disabled={creditsData.totalCredits < WATER_COST}
          >
            💧 물 주기 ({waters_count}/{required_waters}) — -{WATER_COST}C
          </button>
        </div>

        {/* 데이터 표시 */}
        <div className="garden-stats">
          총 탄소 절감량: {creditsData.totalCarbonReduced.toFixed(2)} kg
        </div>

        {statusMessage && (
          <div
            className={`garden-message ${
              statusMessage.includes("실패") || statusMessage.includes("부족")
                ? "error"
                : "success"
            }`}
          >
            {statusMessage}
          </div>
        )}

        {/* 진행상황 바 */}
        <div className="progress-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
          <div className="progress-text">
            {waters_count}/{required_waters} 단계 진행중 ({progressPercentage.toFixed(0)}%)
          </div>
        </div>

        {/* 다음 레벨까지 남은 물주기 횟수 표시 */}
        {required_waters - waters_count > 0 && (
          <div className="next-level-info">
            다음 레벨까지 {required_waters - waters_count}번의 물주기가 필요합니다.
          </div>
        )}
      </div>
    </div>
  );
};

export default MyGarden;
