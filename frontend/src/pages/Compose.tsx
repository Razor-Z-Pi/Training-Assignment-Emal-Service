import { useState, useEffect } from 'react';
import { Alert, Badge, Button, Card, Col, Form, Row, Spinner } from 'react-bootstrap';
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
    'Привет, {{firstName}}!!! У нас открыта позиция {{projectTitle}} в {{companyName}}!!!'
  );
  const [subject, setSubject] = useState('Вакансия {{projectTitle}}');
  const [context, setContext] = useState({ projectTitle: '', companyName: '' });
  const [preview, setPreview] = useState<Preview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
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
    setPreviewLoading(true);
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
      } finally {
        setPreviewLoading(false);
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
      setSendResult({ ok: true, ...data });
    } catch (e: any) {
      setSendResult({ ok: false, ...(e.response?.data ?? { message: e.message }) });
    } finally {
      setSending(false);
    }
  };

  const invalidField = (key: string) =>
    preview?.missing.some((m) => m.key === key) ? 'is-invalid' : '';

  const warnField = (key: string) =>
    preview?.unresolved.some((u) => u.key === key) ? 'is-warning' : '';

  const selectedCandidate = candidates?.find((c) => c.id === candidateId);
  const noEmail = !!selectedCandidate && !selectedCandidate.email;

  return (
    <>
      <h2 className="mb-4 fw-bold">Написать письмо!!!</h2>

      <Row className="g-4">
        <Col lg={6}>
          <Card className="shadow-sm mb-3">
            <Card.Header>Кому</Card.Header>
            <Card.Body>
              <Form.Select
                value={candidateId}
                onChange={(e) => setCandidateId(e.target.value)}
              >
                <option value="">выберите кандидата</option>
                {candidates?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} {c.email ? '' : '— нет email'}
                  </option>
                ))}
              </Form.Select>
              {noEmail && (
                <Alert variant="warning" className="mt-2 mb-0 py-2">
                  У кандидата нет email — отправка будет отклонена!!!
                </Alert>
              )}
            </Card.Body>
          </Card>

          <Card className="shadow-sm mb-3">
            <Card.Header>Контекст вакансии</Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>
                  Проект <code>{'{{projectTitle}}'}</code>
                </Form.Label>
                <Form.Control
                  className={invalidField('projectTitle')}
                  value={context.projectTitle}
                  onChange={(e) =>
                    setContext({ ...context, projectTitle: e.target.value })
                  }
                  placeholder="Senior Backend"
                />
              </Form.Group>
              <Form.Group className="mb-0">
                <Form.Label>
                  Компания <code>{'{{companyName}}'}</code>
                </Form.Label>
                <Form.Control
                  className={invalidField('companyName')}
                  value={context.companyName}
                  onChange={(e) =>
                    setContext({ ...context, companyName: e.target.value })
                  }
                  placeholder="Company"
                />
              </Form.Group>
            </Card.Body>
          </Card>

          <Card className="shadow-sm">
            <Card.Header>Письмо</Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Тема</Form.Label>
                <Form.Control
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-0">
                <Form.Label>Шаблон</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={7}
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  style={{ fontFamily: 'monospace', fontSize: 14 }}
                />
                <Form.Text className="text-muted">
                  Переменные:{' '}
                  <code>{'{{firstName}}'}</code>, <code>{'{{fullName}}'}</code>,{' '}
                  <code>{'{{projectTitle}}'}</code>, <code>{'{{companyName}}'}</code>
                </Form.Text>
              </Form.Group>
            </Card.Body>
          </Card>

          <div className="d-flex gap-2 mt-3">
            <Button
              variant="primary"
              onClick={send}
              disabled={!preview?.ready || sending || noEmail}
            >
              {sending ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Отправка…
                </>
              ) : (
                'Отправить'
              )}
            </Button>
            <Button
              variant="outline-secondary"
              onClick={() => {
                setSendResult(null);
                setPreview(null);
                setCandidateId('');
              }}
            >
              Сбросить
            </Button>
          </div>

          {sendResult?.ok && (
            <Alert variant="success" className="mt-3">
              Письмо отправлено!!! Message ID: <code>{sendResult.id}</code>
            </Alert>
          )}
          {sendResult && !sendResult.ok && (
            <Alert variant="danger" className="mt-3">
              Ошибка: <code>{sendResult.code ?? 'UNKNOWN'}</code>
              {sendResult.message && ` — ${sendResult.message}`}
            </Alert>
          )}
        </Col>

        <Col lg={6}>
          <Card className="shadow-sm position-sticky" style={{ top: 20 }}>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <span>Предпросмотр</span>
              {previewLoading && <Spinner animation="border" size="sm" />}
              {!previewLoading && preview?.ready && (
                <Badge bg="success">Готово к отправке</Badge>
              )}
              {!previewLoading && preview && !preview.ready && (
                <Badge bg="danger">Не готово</Badge>
              )}
            </Card.Header>
            <Card.Body>
              {!candidateId && (
                <p className="text-muted mb-0">
                  Выберите кандидата, чтобы увидеть результат.
                </p>
              )}

              {preview && (
                <>
                  <div className="border rounded p-3 bg-light mb-3">
                    <div className="small text-muted mb-2">
                      Кому: {selectedCandidate?.email ?? '—'}
                    </div>
                    <div className="fw-semibold mb-2">
                      {preview.rendered.subject || '(без темы)'}
                    </div>
                    <div style={{ whiteSpace: 'pre-wrap' }}>
                      {preview.rendered.body}
                    </div>
                  </div>

                  {preview.missing.length > 0 && (
                    <Alert variant="danger" className="py-2">
                      <strong>Не хватает обязательных переменных:</strong>
                      <ul className="mb-0 mt-1">
                        {preview.missing.map((m) => (
                          <li key={m.key}>
                            <code>{`{{${m.key}}}`}</code> —{' '}
                            {m.field === 'candidate'
                              ? 'нет в карточке кандидата!!!'
                              : 'заполните поле контекста!!!'}
                          </li>
                        ))}
                      </ul>
                    </Alert>
                  )}

                  {preview.warnings.length > 0 && (
                    <Alert variant="warning" className="py-2">
                      <strong>Предупреждения:</strong>
                      <ul className="mb-0 mt-1">
                        {preview.warnings.map((w) => (
                          <li key={w.key}>
                            <code>{`{{${w.key}}}`}</code> использовано{' '}
                            <code>{w.fallback}</code>: «{w.usedValue}»
                          </li>
                        ))}
                      </ul>
                    </Alert>
                  )}

                  {preview.unresolved.length > 0 && (
                    <Alert variant="secondary" className="py-2 mb-0">
                      Необязательные, но не заполнены:{' '}
                      {preview.unresolved.map((u) => `{{${u.key}}}`).join(', ')}
                    </Alert>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}