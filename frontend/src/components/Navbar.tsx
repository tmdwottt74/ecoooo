import React from 'react';
import { Navbar as BootstrapNavbar, Nav, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const accessToken = localStorage.getItem('access_token');

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  return (
    <BootstrapNavbar bg="dark" variant="dark" expand="lg">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/">Ecooo</BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">홈</Nav.Link>
            {accessToken && <Nav.Link as={Link} to="/dashboard">대시보드</Nav.Link>}
            {accessToken && <Nav.Link as={Link} to="/mobility">이동 기록</Nav.Link>}
            {accessToken && <Nav.Link as={Link} to="/challenges">챌린지</Nav.Link>}
            {accessToken && <Nav.Link as={Link} to="/recommendations">추천</Nav.Link>}
            {accessToken && <Nav.Link as={Link} to="/chatbot">챗봇</Nav.Link>}
            {accessToken && <Nav.Link as={Link} to="/achievements">업적</Nav.Link>}
            {accessToken && <Nav.Link as={Link} to="/notifications">알림</Nav.Link>}
          </Nav>
          <Nav>
            {accessToken ? (
              <Button variant="outline-light" onClick={handleLogout}>로그아웃</Button>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">로그인</Nav.Link>
                <Nav.Link as={Link} to="/register">회원가입</Nav.Link>
              </>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;
