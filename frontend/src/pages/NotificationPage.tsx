import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { fetchMyNotifications, markNotificationAsRead, deleteNotification, Notification } from '../services/notifications';

const NotificationPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const fetchedNotifications = await fetchMyNotifications();
        setNotifications(fetchedNotifications);
      } catch (err: any) {
        setError(err.response?.data?.detail || '알림을 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      const updatedNotification = await markNotificationAsRead(notificationId);
      setNotifications(notifications.map(notif => 
        notif.notification_id === updatedNotification.notification_id ? updatedNotification : notif
      ));
    } catch (err: any) {
      setError(err.response?.data?.detail || '알림을 읽음 처리하는 데 실패했습니다.');
    }
  };

  const handleDelete = async (notificationId: number) => {
    if (window.confirm('정말로 이 알림을 삭제하시겠습니까?')) {
      try {
        await deleteNotification(notificationId);
        setNotifications(notifications.filter(notif => notif.notification_id !== notificationId));
      } catch (err: any) {
        setError(err.response?.data?.detail || '알림을 삭제하는 데 실패했습니다.');
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

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <Container>
      <h1 className="mb-4">나의 알림</h1>
      <Row>
        {notifications.length === 0 ? (
          <Col><Alert variant="info">새로운 알림이 없습니다.</Alert></Col>
        ) : (
          notifications.map((notif) => (
            <Col md={12} className="mb-3" key={notif.notification_id}>
              <Card className={notif.status === 'READ' ? 'bg-light text-muted' : ''}>
                <Card.Body>
                  <Card.Title>{notif.title}</Card.Title>
                  <Card.Text>
                    {notif.body}<br />
                    <small className="text-muted">
                      {new Date(notif.created_at).toLocaleString()}
                      {notif.status === 'READ' && ` (읽음: ${new Date(notif.read_at!).toLocaleString()})`}
                    </small>
                  </Card.Text>
                  {notif.status !== 'READ' && (
                    <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleMarkAsRead(notif.notification_id)}>
                      읽음으로 표시
                    </Button>
                  )}
                  <Button variant="outline-danger" size="sm" onClick={() => handleDelete(notif.notification_id)}>
                    삭제
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </Container>
  );
};

export default NotificationPage;
