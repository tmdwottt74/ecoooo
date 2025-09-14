import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { fetchCurrentUser } from '../services/auth'; // 사용자 정보 가져오기
import { authApi } from '../services/auth'; // 인증된 API 호출을 위한 axios 인스턴스

interface UserInfo {
  user_id: number;
  username: string;
  email: string;
  role: string;
  // 필요한 다른 사용자 정보 필드 추가
}

interface DashboardData {
  totalSavedCo2: number;
  totalPoints: number;
  // 필요한 다른 대시보드 데이터 필드 추가
}

const DashboardPage: React.FC = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // 사용자 정보 가져오기
        const user = await fetchCurrentUser();
        setUserInfo(user);

        // 대시보드 데이터 가져오기 (예시: 총 절감량, 총 포인트)
        // 백엔드에 해당 엔드포인트가 아직 없으므로 임시로 목업 데이터 사용
        // 실제 구현 시에는 백엔드 API를 호출해야 합니다.
        const totalPointsResponse = await authApi.get('/credits/my_points');
        const totalPoints = totalPointsResponse.data;

        // TODO: 총 절감량 가져오는 API 엔드포인트 구현 후 호출
        const totalSavedCo2 = 12345; // 임시 값

        setDashboardData({
          totalSavedCo2: totalSavedCo2,
          totalPoints: totalPoints,
        });

      } catch (err: any) {
        setError(err.message || '데이터를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div>
      <h1 className="mb-4">대시보드</h1>
      {userInfo && (
        <Card className="mb-4">
          <Card.Body>
            <Card.Title>환영합니다, {userInfo.username}님!</Card.Title>
            <Card.Text>
              이메일: {userInfo.email} <br />
              역할: {userInfo.role}
            </Card.Text>
          </Card.Body>
        </Card>
      )}

      {dashboardData && (
        <Row>
          <Col md={6}>
            <Card className="mb-4">
              <Card.Body>
                <Card.Title>총 탄소 절감량</Card.Title>
                <Card.Text>
                  <h2 className="text-success">{dashboardData.totalSavedCo2} gCO2</h2>
                  <p className="text-muted">지구 환경 보호에 기여하고 있습니다!</p>
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="mb-4">
              <Card.Body>
                <Card.Title>총 포인트</Card.Title>
                <Card.Text>
                  <h2 className="text-primary">{dashboardData.totalPoints} P</h2>
                  <p className="text-muted">포인트를 모아 다양한 혜택을 누려보세요!</p>
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* 여기에 다른 대시보드 위젯들을 추가할 수 있습니다. */}
    </div>
  );
};

export default DashboardPage;
