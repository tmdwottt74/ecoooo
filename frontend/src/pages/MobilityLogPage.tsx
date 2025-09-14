import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal, Spinner, Alert } from 'react-bootstrap';
import { fetchMyMobilityLogs, createMobilityLog, updateMobilityLog, deleteMobilityLog, MobilityLog, CreateMobilityLogData } from '../services/mobility';
import { fetchCurrentUser } from '../services/auth'; // 현재 사용자 정보 가져오기

const MobilityLogPage: React.FC = () => {
  const [logs, setLogs] = useState<MobilityLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [currentLog, setCurrentLog] = useState<MobilityLog | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  // 폼 상태
  const [mode, setMode] = useState<'BUS' | 'SUBWAY' | 'BIKE' | 'WALK' | 'CAR'>('BUS');
  const [distance, setDistance] = useState<number>(0);
  const [startedAt, setStartedAt] = useState<string>('');
  const [endedAt, setEndedAt] = useState<string>('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await fetchCurrentUser();
        setUserId(user.user_id);
        const fetchedLogs = await fetchMyMobilityLogs();
        setLogs(fetchedLogs);
      } catch (err: any) {
        setError(err.message || '이동 기록을 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleShowModal = (log: MobilityLog | null = null) => {
    setCurrentLog(log);
    if (log) {
      setMode(log.mode);
      setDistance(log.distance_km);
      setStartedAt(log.started_at.substring(0, 16)); // YYYY-MM-DDTHH:MM 형식으로 자르기
      setEndedAt(log.ended_at.substring(0, 16));
    } else {
      setMode('BUS');
      setDistance(0);
      setStartedAt('');
      setEndedAt('');
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentLog(null);
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (userId === null) {
      setError('사용자 ID를 찾을 수 없습니다.');
      return;
    }

    const logData: CreateMobilityLogData = {
      user_id: userId,
      mode: mode,
      distance_km: distance,
      started_at: startedAt + ':00', // 초 추가
      ended_at: endedAt + ':00',     // 초 추가
    };

    try {
      if (currentLog) {
        // 업데이트
        const updatedLog = await updateMobilityLog(currentLog.log_id!, logData);
        setLogs(logs.map(log => (log.log_id === updatedLog.log_id ? updatedLog : log)));
      } else {
        // 생성
        const newLog = await createMobilityLog(logData);
        setLogs([...logs, newLog]);
      }
      handleCloseModal();
    } catch (err: any) {
      setError(err.response?.data?.detail || '작업 실패');
    }
  };

  const handleDelete = async (logId: number) => {
    if (window.confirm('정말로 이 이동 기록을 삭제하시겠습니까?')) {
      try {
        await deleteMobilityLog(logId);
        setLogs(logs.filter(log => log.log_id !== logId));
      } catch (err: any) {
        setError(err.response?.data?.detail || '삭제 실패');
      }
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

  if (error && !showModal) { // 모달이 열려있지 않을 때만 에러 표시
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <Container>
      <h1 className="mb-4">나의 이동 기록</h1>
      {error && showModal && <Alert variant="danger">{error}</Alert>} {/* 모달 내 에러 표시 */}
      <Button variant="primary" className="mb-3" onClick={() => handleShowModal()}>
        새 이동 기록 추가
      </Button>

      <Row>
        {logs.length === 0 ? (
          <Col><Alert variant="info">아직 이동 기록이 없습니다. 새로운 기록을 추가해보세요!</Alert></Col>
        ) : (
          logs.map((log) => (
            <Col md={6} lg={4} className="mb-4" key={log.log_id}>
              <Card>
                <Card.Body>
                  <Card.Title>{log.mode} - {log.distance_km} km</Card.Title>
                  <Card.Text>
                    시작: {new Date(log.started_at).toLocaleString()}<br />
                    종료: {new Date(log.ended_at).toLocaleString()}<br />
                    절감량: {log.co2_saved_g?.toFixed(3)} gCO2
                  </Card.Text>
                  <Button variant="secondary" size="sm" className="me-2" onClick={() => handleShowModal(log)}>
                    수정
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(log.log_id!)}>
                    삭제
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{currentLog ? '이동 기록 수정' : '새 이동 기록 추가'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>이동 수단</Form.Label>
              <Form.Select value={mode} onChange={(e) => setMode(e.target.value as any)} required>
                <option value="BUS">버스</option>
                <option value="SUBWAY">지하철</option>
                <option value="BIKE">자전거</option>
                <option value="WALK">도보</option>
                <option value="CAR">자가용</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>거리 (km)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={distance}
                onChange={(e) => setDistance(parseFloat(e.target.value))}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>시작 시간</Form.Label>
              <Form.Control
                type="datetime-local"
                value={startedAt}
                onChange={(e) => setStartedAt(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>종료 시간</Form.Label>
              <Form.Control
                type="datetime-local"
                value={endedAt}
                onChange={(e) => setEndedAt(e.target.value)}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
              {currentLog ? '수정 완료' : '추가'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default MobilityLogPage;
