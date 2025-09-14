import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { fetchMyAchievements, UserAchievement } from '../services/achievements';

const AchievementPage: React.FC = () => {
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAchievements = async () => {
      try {
        const achievements = await fetchMyAchievements();
        setUserAchievements(achievements);
      } catch (err: any) {
        setError(err.response?.data?.detail || '업적을 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    loadAchievements();
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
    <Container>
      <h1 className="mb-4">나의 업적</h1>
      <Row>
        {userAchievements.length === 0 ? (
          <Col><Alert variant="info">아직 획득한 업적이 없습니다.</Alert></Col>
        ) : (
          userAchievements.map((ua) => (
            <Col md={6} lg={4} className="mb-4" key={ua.achievement_id}>
              <Card>
                <Card.Body>
                  <Card.Title>{ua.achievement?.title || '알 수 없는 업적'}</Card.Title>
                  <Card.Text>
                    {ua.achievement?.description || '설명 없음'}<br />
                    획득일: {new Date(ua.granted_at).toLocaleDateString()}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </Container>
  );
};

export default AchievementPage;
