import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Alert, Badge, Button, Card, Spinner } from 'react-bootstrap';
import { api } from '../api/client';

export default function Settings() {
  const qc = useQueryClient();
  const [params] = useSearchParams();
  const gmailParam = params.get('gmail');

  const { data, isLoading } = useQuery({
    queryKey: ['gmail-status'],
    queryFn: async () => (await api.get('/gmail/status')).data,
  });

  const connect = async () => {
    const { data } = await api.post('/gmail/connect');
    window.location.href = data.authUrl;
  };

  const disconnect = useMutation({
    mutationFn: () => api.delete('/gmail/connection'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gmail-status'] }),
  });

  return (
    <>
      <h2 className="mb-4">Настройки</h2>

      {gmailParam === 'connected' && (
        <Alert variant="success">Gmail успешно подключён</Alert>
      )}
      {gmailParam === 'error' && (
        <Alert variant="danger">Не удалось подключить Gmail. Попробуйте снова.</Alert>
      )}

      <Card className="shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <span>Gmail</span>
          {data?.connected && <Badge bg="success">Подключён</Badge>}
          {!data?.connected && !isLoading && <Badge bg="secondary">Не подключён</Badge>}
        </Card.Header>
        <Card.Body>
          {isLoading && <Spinner animation="border" size="sm" />}

          {!isLoading && data?.connected && (
            <>
              <p className="mb-3">
                Аккаунт: <strong>{data.email}</strong>
              </p>
              <p className="text-muted small mb-3">
                С этого адреса будут отправляться письма кандидатам.
              </p>
              <Button
                variant="outline-danger"
                onClick={() => disconnect.mutate()}
                disabled={disconnect.isPending}
              >
                {disconnect.isPending ? 'Отключение…' : 'Отвязать Gmail'}
              </Button>
            </>
          )}

          {!isLoading && !data?.connected && (
            <>
              {data?.reason === 'revoked' && (
                <Alert variant="warning">
                  Доступ к Gmail был отозван. Переподключите аккаунт.
                </Alert>
              )}
              <p className="text-muted">
                Подключите свой Gmail, чтобы отправлять письма кандидатам с вашего адреса.
              </p>
              <Button variant="primary" onClick={connect}>
                Подключить Gmail
              </Button>
            </>
          )}
        </Card.Body>
      </Card>
    </>
  );
}