import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';

export default function Settings() {
  const qc = useQueryClient();
  const [params] = useSearchParams();
  const gmailParam = params.get('gmail');

  const { data } = useQuery({
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
    <div style={{ padding: 40 }}>
      <h1>Настройки</h1>
      {gmailParam === 'connected' && <p style={{ color: 'green' }}>Gmail подключён!!!</p>}
      {gmailParam === 'error' && <p style={{ color: 'red' }}>Ошибка авторизации Gmail!!!</p>}

      <div style={{ border: '1px solid #ccc', padding: 20, marginTop: 20 }}>
        <h2>Gmail</h2>
        {data?.connected ? (
          <>
            <p>Подключён: <b>{data.email}</b></p>
            <button onClick={() => disconnect.mutate()}>Отвязать</button>
          </>
        ) : (
          <>
            {data?.reason === 'revoked' && <p style={{ color: 'orange' }}>Доступ отозван, переподключите</p>}
            <button onClick={connect}>Подключить Gmail</button>
          </>
        )}
      </div>
    </div>
  );
}