import { Container, Nav, Navbar, Button } from 'react-bootstrap';
import { Link, Outlet, useNavigate } from 'react-router-dom';

export default function Layout() {
  const nav = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    nav('/login');
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="md" className="mb-4">
        <Container>
          <Navbar.Brand as={Link} to="/compose">
            Почта
          </Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/compose">
              Написать
            </Nav.Link>
            <Nav.Link as={Link} to="/settings">
              Настройки
            </Nav.Link>
          </Nav>
          <Button variant="outline-light" size="sm" onClick={logout}>
            Выйти
          </Button>
        </Container>
      </Navbar>
      <Container className="pb-5">
        <Outlet />
      </Container>
    </>
  );
}