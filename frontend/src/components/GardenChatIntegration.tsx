import React, { createContext, useCallback, useContext, useMemo, useReducer, useRef, useState, useEffect } from "react";

/**
 * GardenChatIntegration.tsx
 * 
 * 목적: "나만의 정원"과 챗봇 UI를 실시간으로 연동하는 최소 구현 예시.
 * - 챗봇 메시지(대중교통 이용/칭찬 피드백 등)가 정원 상태(경험치, 애니메이션, 아이템 잠금해제)에 즉시 반영됩니다.
 * - 기존 프로젝트에 드롭인 하도록 단일 파일로 구성했습니다.
 * 
 * 설치/연결 가이드
 * 1) 이 파일을 src/components/GardenChatIntegration.tsx 로 저장
 * 2) App 또는 MyGarden 페이지에서 <GardenProvider><GardenWithChat/></GardenProvider> 로 감싸 사용
 * 3) 실제 백엔드 연동은 TODO 라고 표시된 부분을 FastAPI API 경로에 맞게 수정
 * 4) CSS는 Tailwind 유무와 상관없이 동작 (내장 스타일 포함). Tailwind를 쓰면 className만 유지해도 됩니다.
 */

/**************************
 * 1) 정원 상태 & 액션 정의
 **************************/

type UnlockedItem = "watering_can" | "sparkle_effect" | "flower_pot" | "butterfly";

type GardenState = {
  level: number;          // 정원 레벨 (누적 경험치 기반)
  xp: number;             // 경험치 (g CO2 절감량 등으로 환산)
  waterGauge: number;     // 물 주기 게이지 (0~100)
  sparkles: boolean;      // 반짝임 효과 on/off
  unlocked: Set<UnlockedItem>; // 잠금 해제 아이템
  lastEvent?: string;     // 마지막 트리거 이름 (UI 표시용)
};

type GardenAction =
  | { type: "EARN_XP_FROM_CO2"; grams: number }           // 탄소 절감량(g)을 경험치로 전환
  | { type: "WATER_PLANT"; amount?: number }              // 물주기
  | { type: "POSITIVE_FEEDBACK" }                         // AI 칭찬 → 반짝임 효과 & 소량 XP
  | { type: "UNLOCK"; item: UnlockedItem }                // 아이템 잠금해제
  | { type: "TOGGLE_SPARKLES"; on: boolean }
  | { type: "RESET_EVENT" };

const initialState: GardenState = {
  level: 1,
  xp: 0,
  waterGauge: 0,
  sparkles: false,
  unlocked: new Set<UnlockedItem>(["watering_can"]) // 기본 지급 아이템
};

function xpToLevel(xp: number): number {
  // 매우 단순한 레벨 곡선: 1000xp마다 레벨 +1
  return Math.max(1, Math.floor(xp / 1000) + 1);
}

function gardenReducer(state: GardenState, action: GardenAction): GardenState {
  switch (action.type) {
    case "EARN_XP_FROM_CO2": {
      const addXp = Math.max(0, Math.round(action.grams)); // 1g = 1xp (시연용)
      const xp = state.xp + addXp;
      const level = xpToLevel(xp);
      const unlocked = new Set(state.unlocked);
      // 레벨 업 보상: 3레벨 꽃화분, 5레벨 나비
      if (level >= 3) unlocked.add("flower_pot");
      if (level >= 5) unlocked.add("butterfly");
      return { ...state, xp, level, lastEvent: `+${addXp}xp (CO₂)`, unlocked };
    }
    case "WATER_PLANT": {
      const amount = action.amount ?? 20;
      const waterGauge = Math.min(100, state.waterGauge + amount);
      return { ...state, waterGauge, lastEvent: `물주기 +${amount}` };
    }
    case "POSITIVE_FEEDBACK": {
      const xp = state.xp + 50; // 칭찬 보너스 XP (시연용)
      const level = xpToLevel(xp);
      const unlocked = new Set(state.unlocked);
      unlocked.add("sparkle_effect");
      return { ...state, xp, level, sparkles: true, lastEvent: "칭찬 보너스!" , unlocked };
    }
    case "UNLOCK": {
      const unlocked = new Set(state.unlocked);
      unlocked.add(action.item);
      return { ...state, unlocked, lastEvent: `아이템 잠금 해제: ${action.item}` };
    }
    case "TOGGLE_SPARKLES": {
      return { ...state, sparkles: action.on };
    }
    case "RESET_EVENT": {
      return { ...state, lastEvent: undefined };
    }
    default:
      return state;
  }
}

/**************************
 * 2) 컨텍스트 (Provider/Hook)
 **************************/

type GardenContextValue = {
  state: GardenState;
  dispatch: React.Dispatch<GardenAction>;
  // 챗봇에서 호출할 고수준 API
  earnFromCO2: (grams: number) => Promise<void>;
  water: (amount?: number) => void;
  praise: () => void;
};

const GardenContext = createContext<GardenContextValue | null>(null);

export const GardenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gardenReducer, initialState);

  // 백엔드 저장 예시 (옵셔널): 실제 FastAPI 엔드포인트로 교체
  const persistEvent = useCallback(async (payload: Record<string, unknown>) => {
    try {
      // TODO: 실제 API로 교체 (예: /events or /garden)
      // const res = await fetch(`${API_URL}/garden/events`, { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(payload)});
      // if (!res.ok) throw new Error("Failed to persist");
    } catch (e) {
      console.warn("[persistEvent] skip in demo:", e);
    }
  }, []);

  const earnFromCO2 = useCallback(async (grams: number) => {
    dispatch({ type: "EARN_XP_FROM_CO2", grams });
    await persistEvent({ type: "earn", grams });
  }, [persistEvent]);

  const water = useCallback((amount?: number) => {
    dispatch({ type: "WATER_PLANT", amount });
    void persistEvent({ type: "water", amount: amount ?? 20 });
  }, [persistEvent]);

  const praise = useCallback(() => {
    dispatch({ type: "POSITIVE_FEEDBACK" });
    void persistEvent({ type: "praise" });
    // 2초 뒤 반짝임 해제
    setTimeout(() => dispatch({ type: "TOGGLE_SPARKLES", on: false }), 2000);
  }, [persistEvent]);

  const value = useMemo(() => ({ state, dispatch, earnFromCO2, water, praise }), [state, earnFromCO2, water, praise]);

  return <GardenContext.Provider value={value}>{children}</GardenContext.Provider>;
};

export function useGarden() {
  const ctx = useContext(GardenContext);
  if (!ctx) throw new Error("useGarden must be used within GardenProvider");
  return ctx;
}

/**************************
 * 3) 정원 컴포넌트 (시각화)
 **************************/

const Sparkles: React.FC<{ on?: boolean }> = ({ on }) => {
  return (
    <div className={`sparkles ${on ? "sparkles-on" : ""}`} aria-hidden>
      {Array.from({ length: 12 }).map((_, i) => (
        <span key={i} className="spark" />
      ))}
    </div>
  );
};

const Gauge: React.FC<{ value: number; label: string }> = ({ value, label }) => (
  <div className="gauge">
    <div className="gauge-bar" style={{ width: `${value}%` }} />
    <div className="gauge-label">{label} {Math.round(value)}%</div>
  </div>
);

const GardenView: React.FC = () => {
  const { state, water } = useGarden();
  const { level, xp, waterGauge, sparkles, unlocked, lastEvent } = state;

  return (
    <div className="garden-card">
      <div className="garden-header">
        <h3>나만의 정원</h3>
        <div className="stats">
          <span>Lv.{level}</span>
          <span>{xp} xp</span>
        </div>
      </div>

      <div className="garden-stage">
        <div className="soil" />
        {/* 묘목/나무 성장 단계: 레벨 기준 간단한 조건부 렌더 */}
        <div className={`plant stage-${Math.min(5, Math.max(1, level))}`} />
        {/* 아이템 표시 */}
        {unlocked.has("flower_pot") && <div className="flower-pot" />}
        {unlocked.has("butterfly") && <div className="butterfly" />}
        <Sparkles on={sparkles && unlocked.has("sparkle_effect")} />
      </div>

      <Gauge value={waterGauge} label="수분" />

      <div className="garden-actions">
        <button className="btn" onClick={() => water(25)} disabled={!unlocked.has("watering_can")}>물 주기</button>
      </div>

      {lastEvent && <div className="event-toast" onAnimationEnd={(e) => e.currentTarget.classList.add("hide")}>{lastEvent}</div>}
    </div>
  );
};

/**************************
 * 4) 챗봇 패널 (정원 연동 트리거)
 **************************/

type ChatMessage = { role: "user" | "assistant"; text: string };

const ChatPanel: React.FC = () => {
  const { earnFromCO2, praise, water } = useGarden();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", text: "안녕하세요! 오늘 대중교통을 이용하셨나요?" }
  ]);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const push = (m: ChatMessage) => setMessages((prev) => [...prev, m]);

  // 매우 단순한 규칙 기반 NLU (시연용). 실제로는 LLM 응답 사용.
  const interpretAndAct = useCallback(async (userUtter: string) => {
    const text = userUtter.trim().toLowerCase();

    if (/(버스|지하철|대중교통|subway|bus)/.test(text) && /(탔다|이용|yes|했어|했어요|했음|네)/.test(text)) {
      // 예시: 오늘 교통 절감량 1200g 으로 가정
      const grams = 1200;
      push({ role: "assistant", text: `훌륭해요! 오늘 대중교통으로 약 ${grams}g CO₂를 절감했어요. 정원에 반영할게요 🌱` });
      await earnFromCO2(grams); // 정원 성장
      water(15);                 // 물주기 보너스
      return;
    }

    if (/(칭찬|잘했|굿|good|excellent|아주 잘)/.test(text)) {
      push({ role: "assistant", text: "정말 멋져요! 이번 주 아주 잘하고 있어요 ✨" });
      praise(); // 반짝임 효과 + 보너스 xp
      return;
    }

    if (/물(\s)?줘|water/.test(text)) {
      push({ role: "assistant", text: "시원한 물을 줬어요 💧" });
      water(25);
      return;
    }

    // 기본 응답
    push({ role: "assistant", text: "도와드릴게요! '버스 탔어', '칭찬', '물줘' 같은 명령을 해보세요." });
  }, [earnFromCO2, praise, water]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const utter = input.trim();
    if (!utter) return;
    push({ role: "user", text: utter });
    setInput("");
    await interpretAndAct(utter);
    inputRef.current?.focus();
  };

  return (
    <div className="chat-card">
      <div className="chat-title">에코 챗봇</div>
      <div className="chat-thread">
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>{m.text}</div>
        ))}
      </div>
      <form className="chat-input" onSubmit={onSubmit}>
        <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} placeholder="메시지를 입력하세요… (예: 버스 탔어)" />
        <button className="btn" type="submit">전송</button>
      </form>
    </div>
  );
};

/**************************
 * 5) 통합 레이아웃 (정원 + 챗봇)
 **************************/

export const GardenWithChat: React.FC = () => {
  // 자동으로 토스트 초기화
  const { dispatch } = useGarden();
  useEffect(() => {
    const t = setInterval(() => dispatch({ type: "RESET_EVENT" }), 2500);
    return () => clearInterval(t);
  }, [dispatch]);

  return (
    <div className="grid">
      <GardenView />
      <ChatPanel />
      <style>{baseStyles}</style>
    </div>
  );
};

/**************************
 * 6) 내장 스타일 (Tailwind 미사용 환경 대응)
 **************************/

const baseStyles = `
:root { --card: #ffffff; --muted:#f5f7f8; --ink:#111827; --accent:#059669; --ring:#a7f3d0; }
* { box-sizing: border-box; }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; align-items: start; }
.garden-card, .chat-card { background: var(--card); border: 1px solid #e5e7eb; border-radius: 16px; padding: 16px; box-shadow: 0 8px 24px rgba(0,0,0,0.06); }
.garden-header { display:flex; align-items:center; justify-content: space-between; margin-bottom: 12px; }
.garden-header h3 { margin: 0; font-size: 18px; }
.stats { display:flex; gap:10px; color:#374151; }
.garden-stage { position: relative; height: 260px; background: linear-gradient(180deg, #e6fff2 0%, #f7fffb 100%); border:1px solid #d1fae5; border-radius: 16px; overflow: hidden; }
.soil { position:absolute; bottom:0; left:0; right:0; height: 56px; background: #8b5a2b; }

/* 식물 성장 단계 (심플 벡터) */
.plant { position:absolute; bottom:56px; left:50%; transform:translateX(-50%);
  width: 12px; height: 70px; background:#3b945e; border-radius: 6px; }
.plant.stage-1 { height: 40px; }
.plant.stage-2 { height: 70px; }
.plant.stage-3 { height: 100px; }
.plant.stage-4 { height: 130px; }
.plant.stage-5 { height: 160px; }
.plant::before { content:""; position:absolute; bottom:40%; left:-16px; width: 30px; height:14px; border-radius:14px; background:#2ecc71; }
.plant::after  { content:""; position:absolute; bottom:20%; right:-16px; width: 30px; height:14px; border-radius:14px; background:#2ecc71; }

/* 아이템들 */
.flower-pot { position:absolute; bottom:52px; left: calc(50% - 60px); width: 50px; height: 34px; background:#d97706; border-radius: 4px 4px 10px 10px; box-shadow: inset 0 8px 0 rgba(255,255,255,0.25); }
.butterfly { position:absolute; bottom: 160px; left: calc(50% + 40px); width: 24px; height: 18px; background: radial-gradient(circle at 8px 9px, #c084fc 8px, transparent 9px), radial-gradient(circle at 16px 9px, #60a5fa 8px, transparent 9px); animation: fly 3s ease-in-out infinite; }
@keyframes fly { 0%,100%{ transform: translate(0,0);} 50% { transform: translate(6px,-10px);} }

/* 반짝임 효과 */
.sparkles { position:absolute; inset:0; pointer-events:none; }
.spark { position:absolute; width:6px; height:6px; background:#fff; border-radius:50%; opacity:0; animation: pop 1.6s ease-out infinite; }
.sparkles-on .spark { opacity: 1; }
.spark:nth-child(3n+1){ top:30%; left:40%; animation-delay: 0.0s; }
.spark:nth-child(3n+2){ top:50%; left:60%; animation-delay: 0.3s; }
.spark:nth-child(3n+3){ top:70%; left:45%; animation-delay: 0.6s; }
@keyframes pop { 0% { transform: scale(0.4); opacity:0.0;} 20%{ opacity:1;} 80%{ opacity:0.6;} 100% { transform: scale(1.6); opacity:0; } }

/* 게이지 */
.gauge { margin-top: 12px; position: relative; background: var(--muted); border-radius: 10px; height: 12px; overflow: hidden; }
.gauge-bar { position:absolute; inset:0; height:100%; background: linear-gradient(90deg, var(--accent), #10b981); box-shadow: 0 0 0 2px var(--ring) inset; }
.gauge-label { margin-top: 8px; font-size: 12px; color:#374151; }

/* 액션 */
.garden-actions { margin-top: 12px; display:flex; gap:8px; }
.btn { background:#10b981; color:white; border:none; padding: 8px 12px; border-radius: 10px; cursor:pointer; font-weight:600; }
.btn:disabled { background:#9ca3af; cursor:not-allowed; }

/* 챗봇 */
.chat-title { font-weight:700; margin-bottom: 8px; }
.chat-thread { height: 230px; overflow:auto; background: #f8fafc; border:1px solid #e5e7eb; border-radius: 12px; padding: 8px; }
.msg { padding: 8px 10px; border-radius: 10px; margin: 6px 0; max-width: 86%; line-height: 1.3; }
.msg.user { margin-left:auto; background:#d1fae5; }
.msg.assistant { margin-right:auto; background:white; border:1px solid #e5e7eb; }
.chat-input { display:flex; gap:8px; margin-top: 8px; }
.chat-input input { flex:1; border:1px solid #e5e7eb; border-radius: 10px; padding: 10px; }

/* 이벤트 토스트 */
.event-toast { margin-top: 10px; background:#111827; color:white; border-radius: 10px; padding: 8px 10px; width:max-content; animation: toast-in 0.25s ease-out forwards; }
.event-toast.hide { opacity:0; height:0; padding:0; margin: 0; }
@keyframes toast-in { from{ transform: translateY(6px); opacity:0} to{ transform: translateY(0); opacity:1 } }

@media (max-width: 920px){ .grid { grid-template-columns: 1fr; } }
`;

/**************************
 * 7) 사용 예시
 **************************/

// App.tsx 등에서 다음처럼 사용
// import { GardenProvider, GardenWithChat } from "./components/GardenChatIntegration";
//
// export default function App(){
//   return (
//     <GardenProvider>
//       <GardenWithChat />
//     </GardenProvider>
//   )
// }

export default GardenWithChat;
