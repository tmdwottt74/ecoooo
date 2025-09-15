import React from "react";

const Contact: React.FC = () => {
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.title}>Contact Us</h2>
        <p style={styles.subtitle}>
          Ecoo 챗봇과 함께하는 탄소 절감 프로젝트 팀입니다. <br />
          우리는 AI와 데이터를 활용해 더 지속 가능한 도시 생활을 만들고자 합니다. <br />
          문의나 협업 제안은 아래 이메일로 언제든 연락 주세요.
        </p>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>📩 Email</h3>
          <p style={styles.email}>sophia.gyuri@gmail.com</p>
        </div>

        <div style={styles.teamInfo}>
          <h3 style={styles.cardTitle}>👩‍💻 Our Team</h3>
          <p>서울시 AI 해커톤 8팀 충무로팀</p>
          <p>송인섭 · 김규리 · 이승재</p>
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
    maxWidth: "800px",
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
    marginBottom: "50px",
    lineHeight: "1.8",
  },
  card: {
    backgroundColor: "#f8f9fa",
    padding: "30px",
    borderRadius: "15px",
    border: "1px solid #ecf0f1",
    marginBottom: "40px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
  },
  cardTitle: {
    fontSize: "1.3rem",
    fontWeight: 700,
    color: "#34495e",
    marginBottom: "15px",
  },
  email: {
    fontSize: "1.1rem",
    color: "#1abc9c",
    fontWeight: 600,
  },
  teamInfo: {
    marginTop: "20px",
    fontSize: "1rem",
    color: "#7f8c8d",
    lineHeight: "1.6",
  },
};

export default Contact;
