import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export default function Login() {
  const [email, setEmail] = useState('');
  const nav = useNavigate();

  const login = async () => {
    const { data } = await api.post('/auth/login', { email });
    localStorage.setItem('token', data.accessToken);
    nav('/settings');
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Вход!!!</h1>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="eeeeejust@example.com" />
      <button onClick={login}>Войти</button>
    </div>
  );
}