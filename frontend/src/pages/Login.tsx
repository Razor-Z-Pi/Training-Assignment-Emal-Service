import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Container, Form, Alert, Spinner } from 'react-bootstrap';
import { api } from '../api/client';

export default function Login() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email });
      localStorage.setItem('token', data.accessToken);
      nav('/settings');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Не удалось войти!!!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: '100vh' }}
    >
      <Card style={{ width: 420 }} className="shadow-sm">
        <Card.Body className="p-4">
          <p className="text-muted text-center mb-4">Войдите как рекрутер</p>
          <Form onSubmit={login}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="eeeeejust@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </Form.Group>
            {error && <Alert variant="danger">{error}</Alert>}
            <Button type="submit" variant="primary" className="w-100" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : 'Войти'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}