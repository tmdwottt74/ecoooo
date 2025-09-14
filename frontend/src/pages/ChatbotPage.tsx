import React, { useState } from 'react';
import { Container, Form, Button, Card, Spinner, Alert } from 'react-bootstrap';
import { askChatbot } from '../services/chatbot';

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

const ChatbotPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (input.trim() === '') return;

    const userMessage: Message = { text: input, sender: 'user' };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const botResponse = await askChatbot(userMessage.text);
      const botMessage: Message = { text: botResponse.response, sender: 'bot' };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (err: any) {
      setError(err.response?.data?.detail || '챗봇 응답을 가져오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <h1 className="mb-4">AI 챗봇</h1>
      <Card className="mb-3" style={{ height: '60vh', overflowY: 'auto' }}>
        <Card.Body>
          {messages.length === 0 ? (
            <p className="text-muted text-center">챗봇에게 질문을 시작해보세요!</p>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`d-flex ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'} mb-2`}>
                <div
                  className={`p-2 rounded ${
                    msg.sender === 'user' ? 'bg-primary text-white' : 'bg-light text-dark border'
                  }`}
                  style={{ maxWidth: '70%' }}
                >
                  {msg.text}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="d-flex justify-content-center">
              <Spinner animation="border" size="sm" />
            </div>
          )}
        </Card.Body>
      </Card>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSendMessage}>
        <Form.Group className="d-flex">
          <Form.Control
            type="text"
            placeholder="질문을 입력하세요..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <Button variant="primary" type="submit" className="ms-2" disabled={loading}>
            전송
          </Button>
        </Form.Group>
      </Form>
    </Container>
  );
};

export default ChatbotPage;
