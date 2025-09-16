import React from "react";

const About: React.FC = () => {
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.title}>About Our Service</h2>
        <p style={styles.subtitle}>
          Ecoo 챗봇과 함께하는 탄소 절감 프로젝트는 <br />
          사용자의 교통, 생활 데이터를 기반으로 탄소 절감 효과를 알려주고, <br />
          절약한 만큼 에코 크레딧을 제공하는 서비스입니다.
        </p>

        <div style={styles.cards}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>🌱 탄소 절감 분석</h3>
            <p style={styles.cardText}>
              대중교통, 자전거, 도보 이용 데이터를 분석하여
              <br /> 절감한 CO₂를 시각적으로 보여줍니다.
            </p>
          </div>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>💰 에코 크레딧</h3>
            <p style={styles.cardText}>
              절약한 탄소량을 포인트로 전환하고,
              <br /> 다양한 보상 체계로 활용할 수 있습니다.
            </p>
          </div>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>🤖 AI 챗봇</h3>
            <p style={styles.cardText}>
              맞춤형 AI 챗봇이 사용자에게 실시간 피드백을 제공하고,
              <br /> 지속 가능한 생활을 돕습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    backgroundColor: "#ffffff",
    padding: "100px 20px",
    fontFamily: "'Pretendard', sans-serif",
    minHeight: "100vh",
  },
  container: {
    maxWidth: "1000px",
    margin: "0 auto",
    textAlign: "center",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: 800,
    color: "#1abc9c",
    marginBottom: "20px",
  },
  subtitle: {
    fontSize: "1.1rem",
    color: "#555",
    marginBottom: "60px",
    lineHeight: "1.8",
  },
  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "30px",
  },
  card: {
    backgroundColor: "#f8f9fa",
    padding: "30px",
    borderRadius: "15px",
    border: "1px solid #ecf0f1",
    transition: "all 0.3s ease",
    boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
  },
  cardTitle: {
    fontSize: "1.3rem",
    fontWeight: 700,
    color: "#34495e",
    marginBottom: "15px",
  },
  cardText: {
    fontSize: "1rem",
    color: "#7f8c8d",
    lineHeight: "1.6",
  },
};

export default About;
