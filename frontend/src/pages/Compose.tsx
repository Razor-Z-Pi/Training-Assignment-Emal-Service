import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

interface Candidate {
  id: string;
  fullName: string;
  firstName?: string;
  email?: string;
}

interface Preview {
  ready: boolean;
  rendered: { subject: string; body: string };
  missing: { key: string; reason: string; field: string }[];
  unresolved: { key: string; reason: string; field: string }[];
  warnings: { key: string; reason: string; usedValue: string; fallback: string }[];
}

export default function Compose() {
  const [candidateId, setCandidateId] = useState('');
  const [template, setTemplate] = useState(
    'Привет, {{firstName}}! У нас открыта позиция {{projectTitle}} в {{companyName}}.',
  );
  const [subject, setSubject] = useState('Вакансия {{projectTitle}}');
  const [context, setContext] = useState({ projectTitle: '', companyName: '' });
  const [preview, setPreview] = useState<Preview | null>(null);
  const [sendResult, setSendResult] = useState<any>(null);
  const [sending, setSending] = useState(false);

  const { data: candidates } = useQuery({
    queryKey: ['candidates'],
    queryFn: async () => (await api.get('/candidates')).data as Candidate[],
  });

  useEffect(() => {
    if (!candidateId) {
      setPreview(null);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const { data } = await api.post('/templates/preview', {
          template,
          subject,
          candidateId,
          context,
        });
        setPreview(data);
      } catch (e) {
        console.error('preview failed', e);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [candidateId, template, subject, context]);

  const send = async () => {
    setSending(true);
    setSendResult(null);
    try {
      const { data } = await api.post('/emails/send', {
        candidateId,
        template,
        subject,
        context,
      });
      setSendResult({ ok: true, id: data.id, providerMessageId: data.providerMessageId });
    } catch (e: any) {
      setSendResult({ ok: false, ...(e.response?.data ?? { message: e.message }) });
    } finally {
      setSending(false);
    }
  };

  const highlight = (key: string) => {
    if (preview?.missing.some((m) => m.key === key)) {
      return { border: '2px solid red' };
    }
    if (preview?.unresolved.some((u) => u.key === key)) {
      return { border: '2px solid orange' };
    }
    return {};
  };

  const selectedCandidate = candidates?.find((c) => c.id === candidateId);
  const noEmail = selectedCandidate && !selectedCandidate.email;

  return (
    <div style={{ padding: 40, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      <div>
        <h2>Кому</h2>
        <select
          value={candidateId}
          onChange={(e) => setCandidateId(e.target.value)}
          style={{ width: '100%', padding: 6 }}
        >
          <option value="">выберите кандидата</option>
          {candidates?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.fullName} {c.email ? '' : '(нет email)'}
            </option>
          ))}
        </select>

        {noEmail && (
          <p style={{ color: 'red', marginTop: 6 }}>
            У кандидата нет email — отправка будет отклонена бэкендом!!!
          </p>
        )}

        <h3>Контекст вакансии</h3>
        <input
          placeholder="Проект (projectTitle)"
          value={context.projectTitle}
          onChange={(e) => setContext({ ...context, projectTitle: e.target.value })}
          style={{ ...highlight('projectTitle'), display: 'block', marginBottom: 8, width: '100%', padding: 6 }}
        />
        <input
          placeholder="Компания (companyName)"
          value={context.companyName}
          onChange={(e) => setContext({ ...context, companyName: e.target.value })}
          style={{ ...highlight('companyName'), display: 'block', marginBottom: 8, width: '100%', padding: 6 }}
        />

        <h3>Тема</h3>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          style={{ width: '100%', padding: 6 }}
        />

        <h3>Шаблон письма</h3>
        <textarea
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          rows={8}
          style={{ width: '100%', padding: 6, fontFamily: 'monospace' }}
        />

        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <button
            onClick={send}
            disabled={!preview?.ready || sending || !!noEmail}
            style={{ padding: '8px 16px' }}
          >
            {sending ? 'Отправка…' : 'Отправить'}
          </button>
          <button
            onClick={() => {
              setSendResult(null);
              setPreview(null);
              setCandidateId('');
            }}
            style={{ padding: '8px 16px' }}
          >
            Сбросить
          </button>
        </div>

        {sendResult?.ok && (
          <p style={{ color: 'green', marginTop: 10 }}>
            Отправлено. ID: <code>{sendResult.id}</code>, Gmail ID: <code>{sendResult.providerMessageId}</code>
          </p>
        )}
        {sendResult && !sendResult.ok && (
          <p style={{ color: 'red', marginTop: 10 }}>
            Ошибка: <code>{sendResult.code ?? 'UNKNOWN'}</code>
            {sendResult.message && ` — ${sendResult.message}`}
            {sendResult.missing && (
              <span> не хватает: {sendResult.missing.map((m: any) => m.key).join(', ')}</span>
            )}
          </p>
        )}
      </div>

      <div>
        <h2>Preview</h2>
        {!candidateId && <p style={{ color: '#888' }}>Выберите кандидата, чтобы увидеть результат.</p>}

        {preview && (
          <>
            <div
              style={{
                border: '1px solid #ccc',
                borderRadius: 6,
                padding: 12,
                background: '#fafafa',
              }}
            >
              <div style={{ color: '#555', fontSize: 12, marginBottom: 6 }}>
                From: (Gmail рекрутера) · To: {selectedCandidate?.email ?? '—'}
              </div>
              <div style={{ fontWeight: 600, marginBottom: 10 }}>
                {preview.rendered.subject || '(без темы)'}
              </div>
              <div style={{ whiteSpace: 'pre-wrap' }}>{preview.rendered.body}</div>
            </div>

            {!preview.ready && (
              <div style={{ marginTop: 12, color: 'red' }}>
                <b>Отправлять рано.</b> Не хватает обязательных переменных:
                <ul>
                  {preview.missing.map((m) => (
                    <li key={m.key}>
                      <code>{`{{${m.key}}}`}</code> — {m.field === 'candidate' ? 'нет в карточке кандидата' : 'заполните поле контекста'}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {preview.warnings.length > 0 && (
              <div style={{ marginTop: 12, color: '#a60' }}>
                <b>Предупреждения:</b>
                <ul>
                  {preview.warnings.map((w) => (
                    <li key={w.key}>
                      <code>{`{{${w.key}}}`}</code> — использовано <code>{w.fallback}</code>: «{w.usedValue}»
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {preview.unresolved.length > 0 && (
              <div style={{ marginTop: 12, color: '#a60' }}>
                <b>Необязательные, но не заполнены:</b>{' '}
                {preview.unresolved.map((u) => `{{${u.key}}}`).join(', ')}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}