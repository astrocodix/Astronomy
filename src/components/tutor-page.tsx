'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Sparkles,
  Plus,
  ArrowUp,
  MessageSquare,
  BookOpen,
  ArrowUpRight,
  Orbit,
  Star,
  Lightbulb,
  GraduationCap,
  FlaskConical,
  Target,
  ExternalLink,
  Trash2,
  Loader2,
  Square,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from './context';
import { PageHeader, Button, Arrow, Pill, Markdown, Modal } from './ui';
const modes = [
  ['beginner', 'Beginner', 'مبتدئ', Lightbulb],
  ['academic', 'Academic', 'أكاديمي', GraduationCap],
  ['advanced', 'Advanced', 'متقدم', Sparkles],
  ['research', 'Research', 'بحثي', FlaskConical],
  ['exam', 'Exam prep', 'تحضير اختبار', Target],
] as const;
type Message = {
  id: string;
  role: string;
  content: string;
  provider?: string;
  language?: string;
  sources?: any[];
  pending?: boolean;
  error?: string;
  incomplete?: boolean;
};
export function TutorPage() {
  const { data, t, lang, api, refresh, notify } = useApp();
  const params = useSearchParams();
  const [mode, setMode] = useState(data?.user.profile.tutorMode || 'beginner'),
    [input, setInput] = useState(params.get('q') || '');
  const [messages, setMessages] = useState<Message[]>([]),
    [conversations, setConversations] = useState<any[]>([]);
  const [conversationId, setConversationId] = useState<string>();
  const [busy, setBusy] = useState(false),
    [loadingHistory, setLoadingHistory] = useState(false),
    [deleting, setDeleting] = useState(false);
  const [referenceOnly, setReferenceOnly] = useState(false),
    [remove, setRemove] = useState<string>(),
    [showHistory, setShowHistory] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const bottom = useRef<HTMLDivElement>(null),
    inputRef = useRef<HTMLTextAreaElement>(null),
    abortRef = useRef<AbortController | null>(null);
  const alive = useRef(true),
    sending = useRef(false);
  const loadConversations = useCallback(async () => {
    const rows = await api('tutor/conversations');
    if (alive.current) setConversations(rows);
  }, [api]);
  const updateStatus = useCallback(async () => {
    const s = await api('tutor/status');
    if (alive.current) setStatus(s);
  }, [api]);
  useEffect(() => {
    alive.current = true;
    loadConversations().catch(() => {});
    updateStatus().catch(() => {});
    return () => {
      alive.current = false;
      abortRef.current?.abort();
    };
  }, [loadConversations, updateStatus]);
  useEffect(() => {
    if (messages.length) bottom.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);
  if (!data) return null;
  const configured = status?.configured ?? data.tutor.configured,
    isReference = !configured || referenceOnly;
  const locked = busy || loadingHistory || deleting;
  const patch = (id: string, fn: (m: Message) => Message) => {
    if (alive.current) setMessages((v) => v.map((m) => (m.id === id ? fn(m) : m)));
  };
  const newChat = () => {
    if (locked || sending.current) return;
    setConversationId(undefined);
    setMessages([]);
    setInput('');
    setShowHistory(false);
    inputRef.current?.focus();
  };
  const loadConversation = async (id: string) => {
    if (locked || sending.current) return;
    setLoadingHistory(true);
    try {
      const c = await api(`tutor/conversation/${id}`);
      if (alive.current) {
        setConversationId(id);
        setMessages(c.messages);
        setMode(c.mode);
        setShowHistory(false);
      }
    } catch (e) {
      notify((e as Error).message, 'error');
    } finally {
      if (alive.current) setLoadingHistory(false);
    }
  };
  const send = async (event?: React.FormEvent) => {
    event?.preventDefault();
    const text = input.trim();
    if (!text || locked || sending.current) return;
    sending.current = true;
    setBusy(true);
    setInput('');
    const uid = `user-${Date.now()}`,
      aid = `assistant-${Date.now()}`,
      provider = isReference ? 'reference' : 'ai';
    const controller = new AbortController();
    abortRef.current = controller;
    setMessages((v) => [
      ...v,
      { id: uid, role: 'user', content: text, provider: 'user', language: lang },
      { id: aid, role: 'assistant', content: '', pending: true, provider, language: lang },
    ]);
    try {
      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-astroverse-client': 'academy',
          'Accept-Language': lang,
        },
        body: JSON.stringify({
          message: text,
          language: lang,
          mode,
          conversationId,
          referenceOnly,
        }),
        credentials: 'same-origin',
        signal: controller.signal,
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(lang === 'ar' ? err.errorAr || err.error : err.error);
      }
      if (response.headers.get('content-type')?.includes('text/event-stream')) {
        if (!response.body)
          throw new Error(t('No response stream was received.', 'لم يصل تدفق الرد.'));
        const reader = response.body.getReader(),
          decoder = new TextDecoder();
        let buffer = '',
          complete = false;
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, '\n');
            let cut;
            while ((cut = buffer.indexOf('\n\n')) >= 0) {
              const packet = buffer.slice(0, cut);
              buffer = buffer.slice(cut + 2);
              for (const line of packet.split('\n').filter((l) => l.startsWith('data:'))) {
                const e = JSON.parse(line.slice(5));
                if (e.type === 'meta') {
                  if (alive.current) setConversationId(e.conversationId);
                  patch(aid, (m) => ({ ...m, provider: e.provider || 'ai', sources: e.sources }));
                }
                if (e.type === 'delta')
                  patch(aid, (m) => ({ ...m, content: m.content + e.text, pending: false }));
                if (e.type === 'done') complete = true;
                if (e.type === 'error') throw new Error(e.message);
              }
            }
          }
        } finally {
          reader.releaseLock();
        }
        if (!complete)
          throw new Error(
            t(
              'The response ended early. Partial text was not saved as a completed answer.',
              'انتهى الرد مبكرًا. لم يُحفظ النص الجزئي كإجابة مكتملة.',
            ),
          );
        patch(aid, (m) => ({ ...m, pending: false }));
      } else {
        const result = await response.json();
        if (alive.current) setConversationId(result.conversationId);
        patch(aid, (m) => ({
          ...m,
          content: result.text,
          pending: false,
          sources: result.sources,
          provider: result.provider,
        }));
      }
      await refresh();
    } catch (e) {
      const cancelled = controller.signal.aborted;
      const message = cancelled
        ? t(
            'Response stopped. Partial AI text is not saved as a completed answer.',
            'أُوقف الرد. لا يُحفظ نص AI الجزئي كإجابة مكتملة.',
          )
        : (e as Error).message;
      patch(aid, (m) => ({ ...m, pending: false, incomplete: true, error: message }));
      if (!cancelled && alive.current) notify(message, 'error');
    } finally {
      sending.current = false;
      abortRef.current = null;
      if (alive.current) {
        setBusy(false);
        loadConversations().catch(() => {});
        updateStatus().catch(() => {});
      }
    }
  };
  const deleteConversation = async () => {
    if (!remove || locked) return;
    setDeleting(true);
    try {
      await api(`tutor/conversations/${remove}`, { method: 'DELETE' });
      if (conversationId === remove) {
        setConversationId(undefined);
        setMessages([]);
        setInput('');
      }
      setRemove(undefined);
      await loadConversations();
    } catch (e) {
      notify((e as Error).message, 'error');
    } finally {
      setDeleting(false);
    }
  };
  const prompts = [
    {
      icon: Star,
      en: 'Why do stars shine?',
      ar: 'لماذا تضيء النجوم؟',
      subEn: 'Explore the engines of the cosmos',
      subAr: 'استكشف محركات الكون',
    },
    {
      icon: Orbit,
      en: 'How big is a light-year?',
      ar: 'ما طول السنة الضوئية؟',
      subEn: 'Make sense of cosmic distances',
      subAr: 'افهم المسافات الكونية',
    },
    {
      icon: FlaskConical,
      en: 'How do we measure a star’s distance?',
      ar: 'كيف نقيس مسافة نجم؟',
      subEn: 'Turn an observation into a calculation',
      subAr: 'حوّل الرصد إلى حساب',
    },
    {
      icon: Sparkles,
      en: 'What is a black hole, really?',
      ar: 'ما الثقب الأسود حقًا؟',
      subEn: 'Go beyond the familiar myths',
      subAr: 'تجاوز الخرافات المألوفة',
    },
  ];
  return (
    <div className="tutor-page page-enter">
      <PageHeader
        eyebrow={t('YOUR CURIOSITY, IN GOOD COMPANY', 'فضولك في صحبة جيدة')}
        title={t('Every question opens a universe.', 'كل سؤال يفتح كونًا.')}
        description={t(
          'A thoughtful guide for your astronomy journey. Ask freely. Think deeply.',
          'دليل متأنٍ لرحلتك الفلكية. اسأل بحرية وفكّر بعمق.',
        )}
        action={
          <div className="button-row">
            <button
              className="icon-btn"
              onClick={() => setShowHistory((v) => !v)}
              aria-label={t('Conversation history', 'سجل المحادثات')}
              aria-expanded={showHistory}
            >
              <MessageSquare size={20} />
            </button>
            <Button variant="secondary" onClick={newChat} disabled={locked}>
              <Plus size={16} />
              {t('New conversation', 'محادثة جديدة')}
            </Button>
          </div>
        }
      />
      <div className="tutor-layout">
        <aside className={`conversation-sidebar panel ${showHistory ? 'show' : ''}`}>
          <div className="card-topline">
            <h3>{t('Your conversations', 'محادثاتك')}</h3>
            <button
              className="icon-btn"
              disabled={locked}
              onClick={newChat}
              aria-label={t('New conversation', 'محادثة جديدة')}
            >
              <Plus size={17} />
            </button>
          </div>
          {conversations.length ? (
            conversations.map((c) => (
              <div
                className={`conversation-item ${conversationId === c.id ? 'active' : ''}`}
                key={c.id}
              >
                <button disabled={locked} onClick={() => loadConversation(c.id)}>
                  <MessageSquare size={15} />
                  <span>{c.title}</span>
                </button>
                <button
                  className="icon-btn"
                  disabled={locked}
                  onClick={() => setRemove(c.id)}
                  aria-label={t('Delete conversation', 'حذف المحادثة')}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))
          ) : (
            <div className="conversation-empty">
              <MessageSquare size={26} />
              <p>{t('Your questions will find a home here.', 'ستجد أسئلتك مكانها هنا.')}</p>
            </div>
          )}
          <div className="tutor-context">
            <h4>
              <Target size={14} />
              {t('Your learning context', 'سياق تعلمك')}
            </h4>
            <p>
              {data.progress.stats.completedLessons} {t('lessons completed', 'دروس مكتملة')}
              <br />
              {data.progress.stats.examsTaken} {t('assessments submitted', 'تقييمات مسلمة')}
            </p>
            <Link href="/progress" className="text-link">
              {t('See your progress', 'عرض تقدمك')}
              <Arrow size={12} />
            </Link>
          </div>
        </aside>
        <div className="tutor-main panel" aria-busy={busy || loadingHistory}>
          <div className="tutor-toolbar">
            <div className="tutor-mode-selector">
              {modes.map(([key, en, ar, Icon]) => (
                <button
                  key={key}
                  disabled={locked}
                  onClick={() => setMode(key)}
                  className={mode === key ? 'active' : ''}
                  aria-pressed={mode === key}
                  title={t(en, ar)}
                >
                  <Icon size={14} />
                  <span>{t(en, ar)}</span>
                </button>
              ))}
            </div>
            <span className={`tutor-connection ${isReference ? 'reference' : 'connected'}`}>
              <span />
              {isReference ? t('Reference mode', 'وضع المراجع') : t('AI mode', 'وضع AI')}
            </span>
          </div>
          {!configured && (
            <div className="tutor-connection-note">
              <BookOpen size={14} />
              <span>
                {t(
                  'No AI provider is connected. Search real lesson excerpts now; live conversational AI requires a server-side provider key.',
                  'لا يوجد مزود AI متصل. ابحث في مقتطفات الدروس؛ تتطلب المحادثة الحية مفتاح مزود على الخادم.',
                )}
              </span>
            </div>
          )}
          {configured && !status?.verified && (
            <div className="tutor-connection-note">
              {t(
                'Provider configured, not yet verified. Only a completed response verifies this configuration.',
                'المزود مهيأ ولم يُتحقق منه بعد. يتحقق هذا الإعداد برد مكتمل فقط.',
              )}
            </div>
          )}
          <div
            className={`chat-body ${messages.length ? 'has-messages' : ''}`}
            role="log"
            aria-label={t('Conversation messages', 'رسائل المحادثة')}
            aria-live="polite"
          >
            {loadingHistory ? (
              <p className="muted">
                <Loader2 className="spin" size={18} />{' '}
                {t('Loading conversation…', 'جارٍ تحميل المحادثة…')}
              </p>
            ) : !messages.length ? (
              <div className="tutor-welcome">
                <div className="astro-ai-orb">
                  <span>✦</span>
                  <i>✧</i>
                  <b>✦</b>
                </div>
                <Pill tone="purple">ASTRO AI</Pill>
                <h2>{t('What’s on your cosmic mind?', 'بماذا يفكر عقلك الكوني؟')}</h2>
                <p>
                  {t(
                    'Start with a question. We’ll find a little clarity\nin the vastness together.',
                    'ابدأ بسؤال. سنجد بعض الوضوح\nفي هذا الاتساع معًا.',
                  )}
                </p>
                <div className="tutor-prompt-grid">
                  {prompts.map(({ icon: Icon, ...p }, i) => (
                    <button
                      onClick={() => {
                        setInput(t(p.en, p.ar));
                        inputRef.current?.focus();
                      }}
                      key={i}
                    >
                      <Icon size={19} />
                      <strong>{t(p.en, p.ar)}</strong>
                      <span>{t(p.subEn, p.subAr)}</span>
                      <ArrowUpRight size={15} />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m) => (
                <div
                  className={`chat-message ${m.role} ${m.error ? 'message-error' : ''}`}
                  key={m.id}
                >
                  <span className="chat-avatar">
                    {m.role === 'assistant' ? <Sparkles size={18} /> : <Orbit size={18} />}
                  </span>
                  <div className="message-content">
                    <div className="message-label">
                      <strong>{m.role === 'assistant' ? 'ASTRO' : t('You', 'أنت')}</strong>
                      {m.role === 'assistant' && (
                        <span>
                          {m.provider === 'reference'
                            ? t('Reference guide · not AI', 'دليل المراجع · ليس AI')
                            : m.provider === 'ai'
                              ? t('AI astronomy tutor', 'معلّم الفلك الذكي')
                              : t(
                                  'Earlier response · origin unverified',
                                  'رد سابق · المصدر غير متحقق',
                                )}
                        </span>
                      )}
                    </div>
                    {m.pending ? (
                      <div
                        className="typing-dots"
                        aria-label={t('Preparing response', 'جارٍ إعداد الرد')}
                      >
                        <span />
                        <span />
                        <span />
                      </div>
                    ) : (
                      <div dir={m.language === 'ar' ? 'rtl' : m.language === 'en' ? 'ltr' : 'auto'}>
                        <Markdown text={m.content} />
                      </div>
                    )}
                    {m.error && (
                      <p className="tutor-message-status" role="status">
                        {m.error}
                      </p>
                    )}
                    {m.sources?.length ? (
                      <div className="chat-sources">
                        {m.sources.map((s) => (
                          <div key={s.lessonId}>
                            <Link href={`/lesson/${s.lessonId}`}>
                              <BookOpen size={13} />
                              {lang === 'ar' ? s.titleAr || s.title : s.titleEn || s.title}
                              <ArrowUpRight size={12} />
                            </Link>
                            {(s.references || []).slice(0, 2).map((r: any) => (
                              <a href={r.url} key={r.url} target="_blank" rel="noreferrer">
                                <ExternalLink size={12} />
                                {r.title}
                              </a>
                            ))}
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))
            )}
            <div ref={bottom} />
          </div>
          <form className="chat-composer" onSubmit={send}>
            <div className="composer-input">
              <textarea
                ref={inputRef}
                rows={2}
                maxLength={4000}
                value={input}
                disabled={loadingHistory || deleting}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder={t('Ask a question about the universe…', 'اسأل سؤالًا عن الكون…')}
                aria-label={t('Your question for Astro', 'سؤالك لأسترو')}
              />
              {busy ? (
                <button
                  className="send-button"
                  type="button"
                  onClick={() => abortRef.current?.abort()}
                  aria-label={t('Stop response', 'أوقف الرد')}
                >
                  <Square size={17} />
                </button>
              ) : (
                <button
                  disabled={!input.trim() || locked}
                  className="send-button"
                  type="submit"
                  aria-label={t('Send question', 'إرسال السؤال')}
                >
                  <ArrowUp size={20} />
                </button>
              )}
            </div>
            <div className="composer-footer">
              <span>
                <ShieldCheck size={13} />
                {t('Evidence first. Wonder always.', 'الدليل أولًا. والدهشة دائمًا.')}
              </span>
              {configured ? (
                <label>
                  <input
                    type="checkbox"
                    checked={referenceOnly}
                    disabled={locked}
                    onChange={(e) => setReferenceOnly(e.target.checked)}
                  />
                  {t('Use reference guide', 'استخدم دليل المراجع')}
                </label>
              ) : (
                <span>
                  {t('Lesson excerpts, not AI-generated answers', 'مقتطفات دروس لا إجابات مولدة')}
                </span>
              )}
            </div>
          </form>
        </div>
      </div>
      {remove && (
        <Modal
          title={t('Delete this conversation?', 'حذف هذه المحادثة؟')}
          onClose={() => {
            if (!deleting) setRemove(undefined);
          }}
        >
          <p>
            {t(
              'This removes the conversation and its messages from your account. Learning progress is unaffected.',
              'يحذف ذلك المحادثة ورسائلها من حسابك دون التأثير في تقدمك.',
            )}
          </p>
          <div className="button-row">
            <Button loading={deleting} onClick={deleteConversation}>
              {t('Delete conversation', 'احذف المحادثة')}
            </Button>
            <Button variant="secondary" disabled={deleting} onClick={() => setRemove(undefined)}>
              {t('Keep it', 'احتفظ بها')}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
