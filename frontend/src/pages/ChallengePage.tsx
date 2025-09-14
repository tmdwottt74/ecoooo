import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import { fetchAllChallenges, createChallenge, updateChallenge, deleteChallenge, joinChallenge, leaveChallenge, Challenge, CreateChallengeData } from '../services/challenges';
import { fetchCurrentUser } from '../services/auth'; // 현재 사용자 정보 가져오기

const ChallengePage: React.FC = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  // 폼 상태
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [scope, setScope] = useState<'PERSONAL' | 'GROUP'>('PERSONAL');
  const [targetMode, setTargetMode] = useState<'ANY' | 'BUS' | 'SUBWAY' | 'BIKE' | 'WALK'>('ANY');
  const [targetSavedG, setTargetSavedG] = useState<number>(0);
  const [startAt, setStartAt] = useState<string>('');
  const [endAt, setEndAt] = useState<string>('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await fetchCurrentUser();
        setUserId(user.user_id);
        const fetchedChallenges = await fetchAllChallenges();
        setChallenges(fetchedChallenges);
      } catch (err: any) {
        setError(err.message || '챌린지를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleShowModal = (challenge: Challenge | null = null) => {
    setCurrentChallenge(challenge);
    if (challenge) {
      setTitle(challenge.title);
      setDescription(challenge.description || '');
      setScope(challenge.scope);
      setTargetMode(challenge.target_mode);
      setTargetSavedG(challenge.target_saved_g);
      setStartAt(challenge.start_at.substring(0, 16));
      setEndAt(challenge.end_at.substring(0, 16));
    } else {
      setTitle('');
      setDescription('');
      setScope('PERSONAL');
      setTargetMode('ANY');
      setTargetSavedG(0);
      setStartAt('');
      setEndAt('');
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentChallenge(null);
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const challengeData: CreateChallengeData = {
      title: title,
      description: description,
      scope: scope,
      target_mode: targetMode,
      target_saved_g: targetSavedG,
      start_at: startAt + ':00',
      end_at: endAt + ':00',
    };

    try {
      if (currentChallenge) {
        // 업데이트
        const updatedChallenge = await updateChallenge(currentChallenge.challenge_id, challengeData);
        setChallenges(challenges.map(ch => (ch.challenge_id === updatedChallenge.challenge_id ? updatedChallenge : ch)));
      } else {
        // 생성
        const newChallenge = await createChallenge(challengeData);
        setChallenges([...challenges, newChallenge]);
      }
      handleCloseModal();
    } catch (err: any) {
      setError(err.response?.data?.detail || '작업 실패');
    }
  };

  const handleDelete = async (challengeId: number) => {
    if (window.confirm('정말로 이 챌린지를 삭제하시겠습니까?')) {
      try {
        await deleteChallenge(challengeId);
        setChallenges(challenges.filter(ch => ch.challenge_id !== challengeId));
      } catch (err: any) {
        setError(err.response?.data?.detail || '삭제 실패');
      }
    }
  };

  const handleJoinChallenge = async (challengeId: number) => {
    try {
      await joinChallenge(challengeId);
      alert('챌린지에 성공적으로 참여했습니다!');
      // 챌린지 목록 새로고침 또는 참여 상태 업데이트
      const fetchedChallenges = await fetchAllChallenges();
      setChallenges(fetchedChallenges);
    } catch (err: any) {
      setError(err.response?.data?.detail || '챌린지 참여 실패');
    }
  };

  const handleLeaveChallenge = async (challengeId: number) => {
    try {
      await leaveChallenge(challengeId);
      alert('챌린지에서 성공적으로 탈퇴했습니다!');
      // 챌린지 목록 새로고침 또는 참여 상태 업데이트
      const fetchedChallenges = await fetchAllChallenges();
      setChallenges(fetchedChallenges);
    } catch (err: any) {
      setError(err.response?.data?.detail || '챌린지 탈퇴 실패');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error && !showModal) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <Container>
      <h1 className="mb-4">챌린지 목록</h1>
      {error && showModal && <Alert variant="danger">{error}</Alert>}
      <Button variant="primary" className="mb-3" onClick={() => handleShowModal()}>
        새 챌린지 생성
      </Button>

      <Row>
        {challenges.length === 0 ? (
          <Col><Alert variant="info">아직 챌린지가 없습니다. 새로운 챌린지를 생성해보세요!</Alert></Col>
        ) : (
          challenges.map((challenge) => (
            <Col md={6} lg={4} className="mb-4" key={challenge.challenge_id}>
              <Card>
                <Card.Body>
                  <Card.Title>{challenge.title}</Card.Title>
                  <Card.Text>
                    {challenge.description}<br />
                    목표 절감량: {challenge.target_saved_g} gCO2<br />
                    기간: {new Date(challenge.start_at).toLocaleDateString()} ~ {new Date(challenge.end_at).toLocaleDateString()}
                  </Card.Text>
                  <Button variant="secondary" size="sm" className="me-2" onClick={() => handleShowModal(challenge)}>
                    수정
                  </Button>
                  <Button variant="danger" size="sm" className="me-2" onClick={() => handleDelete(challenge.challenge_id)}>
                    삭제
                  </Button>
                  {/* TODO: 사용자가 챌린지에 참여 중인지 여부에 따라 버튼 변경 */}
                  <Button variant="success" size="sm" onClick={() => handleJoinChallenge(challenge.challenge_id)}>
                    참여
                  </Button>
                  <Button variant="warning" size="sm" className="ms-2" onClick={() => handleLeaveChallenge(challenge.challenge_id)}>
                    탈퇴
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{currentChallenge ? '챌린지 수정' : '새 챌린지 생성'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>제목</Form.Label>
              <Form.Control type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>설명</Form.Label>
              <Form.Control as="textarea" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>범위</Form.Label>
              <Form.Select value={scope} onChange={(e) => setScope(e.target.value as any)} required>
                <option value="PERSONAL">개인</option>
                <option value="GROUP">그룹</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>목표 이동 수단</Form.Label>
              <Form.Select value={targetMode} onChange={(e) => setTargetMode(e.target.value as any)} required>
                <option value="ANY">모두</option>
                <option value="BUS">버스</option>
                <option value="SUBWAY">지하철</option>
                <option value="BIKE">자전거</option>
                <option value="WALK">도보</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>목표 절감량 (gCO2)</Form.Label>
              <Form.Control type="number" value={targetSavedG} onChange={(e) => setTargetSavedG(parseInt(e.target.value))} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>시작일</Form.Label>
              <Form.Control type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>종료일</Form.Label>
              <Form.Control type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} required />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
              {currentChallenge ? '수정 완료' : '생성'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ChallengePage;
