import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { fetchRecommendedChallenges } from '../services/recommendations';
import { Challenge } from '../services/challenges'; // Challenge 인터페이스 임포트

const RecommendationPage: React.FC = () => {
  const [recommendedChallenges, setRecommendedChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const challenges = await fetchRecommendedChallenges();
        setRecommendedChallenges(challenges);
      } catch (err: any) {
        setError(err.response?.data?.detail || '추천 챌린지를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    loadRecommendations();
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
      <h1 className="mb-4">추천 챌린지</h1>
      <Row>
        {recommendedChallenges.length === 0 ? (
          <Col><Alert variant="info">현재 추천할 챌린지가 없습니다.</Alert></Col>
        ) : (
          recommendedChallenges.map((challenge) => (
            <Col md={6} lg={4} className="mb-4" key={challenge.challenge_id}>
              <Card>
                <Card.Body>
                  <Card.Title>{challenge.title}</Card.Title>
                  <Card.Text>
                    {challenge.description}<br />
                    목표 절감량: {challenge.target_saved_g} gCO2<br />
                    기간: {new Date(challenge.start_at).toLocaleDateString()} ~ {new Date(challenge.end_at).toLocaleDateString()}
                  </Card.Text>
                  {/* 여기에 챌린지 참여 버튼 등 추가 가능 */}
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </Container>
  );
};

export default RecommendationPage;
