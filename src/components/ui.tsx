'use client';
import React, { useEffect, useRef, useId } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  Loader2,
  X,
  Sparkles,
  Lock,
  ArrowLeft,
  BookOpen,
  Clock,
  Check,
  ExternalLink,
  Orbit,
} from 'lucide-react';
import { useApp } from './context';
export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`brand ${compact ? 'compact' : ''}`}>
      <svg className="brand-symbol" viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <path
          d="M24 5 28.5 19.5 43 24 28.5 28.5 24 43 19.5 28.5 5 24 19.5 19.5Z"
          fill="currentColor"
        />
        <ellipse
          cx="24"
          cy="24"
          rx="23"
          ry="10"
          transform="rotate(-40 24 24)"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <circle cx="41" cy="9" r="2.5" fill="currentColor" />
      </svg>
      {!compact && (
        <span className="brand-words">
          <strong>ASTROVERSE</strong>
          <span>A C A D E M Y</span>
        </span>
      )}
    </span>
  );
}
export function Button({
  children,
  onClick,
  href,
  variant = 'primary',
  className = '',
  disabled = false,
  loading = false,
  type = 'button',
  ...rest
}: any) {
  const cls = `btn btn-${variant} ${className}`;
  if (href && !disabled)
    return (
      <Link href={href} className={cls} {...rest}>
        {children}
      </Link>
    );
  return (
    <button type={type} onClick={onClick} className={cls} disabled={disabled || loading} {...rest}>
      {loading && <Loader2 size={16} className="spin" />}
      {children}
    </button>
  );
}
export function Arrow({ size = 16 }: { size?: number }) {
  return <ArrowRight size={size} className="directional" />;
}
export function Pill({
  children,
  tone = '',
  icon,
}: {
  children: React.ReactNode;
  tone?: string;
  icon?: React.ReactNode;
}) {
  return (
    <span className={`pill ${tone}`}>
      {icon}
      {children}
    </span>
  );
}
export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action && <div className="heading-action">{action}</div>}
    </div>
  );
}
export function SectionHeading({
  title,
  sub,
  link,
  href,
}: {
  title: string;
  sub?: string;
  link?: string;
  href?: string;
}) {
  return (
    <div className="section-heading">
      <div>
        <h2>{title}</h2>
        {sub && <p>{sub}</p>}
      </div>
      {link && (
        <Link className="text-link" href={href || '/roadmap'}>
          {link}
          <Arrow size={14} />
        </Link>
      )}
    </div>
  );
}
export function EmptyState({
  icon: Icon = Orbit,
  title,
  description,
  action,
}: {
  icon?: any;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Icon size={30} strokeWidth={1.3} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
export function Loading({ small = false }: { small?: boolean }) {
  const { t } = useApp();
  return (
    <div className={`loading ${small ? 'small' : ''}`} role="status">
      <Brand compact />
      <span>{t('Mapping your universe…', 'نرسم خريطة كونك…')}</span>
      <div className="loading-line" />
    </div>
  );
}
export function ErrorState({ message, retry }: { message: string; retry?: () => void }) {
  const { t } = useApp();
  return (
    <EmptyState
      icon={Lock}
      title={t('One step at a time', 'خطوة واحدة في كل مرة')}
      description={message}
      action={
        <div className="button-row">
          <Button href="/roadmap" variant="secondary">
            {t('View learning roadmap', 'عرض مسار التعلم')}
            <Arrow />
          </Button>
          {retry && <Button onClick={retry}>{t('Try again', 'حاول مجددًا')}</Button>}
        </div>
      }
    />
  );
}
export function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const { t } = useApp();
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const prev = document.activeElement as HTMLElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const node = ref.current;
    const focusables = () =>
      node?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]',
      );
    focusables()?.[0]?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRef.current();
      if (e.key === 'Tab') {
        const f = focusables();
        if (!f?.length) return;
        const first = f[0],
          last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', key);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', key);
      if (prev?.isConnected) prev.focus();
    };
  }, []);
  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`modal ${wide ? 'wide' : ''}`}
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="modal-head">
          <h2>{title}</h2>
          <button
            className="icon-btn"
            onClick={onClose}
            aria-label={t('Close dialog', 'إغلاق النافذة')}
          >
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
export function Ring({
  value = 0,
  size = 146,
  children,
  stroke = 6,
}: {
  value?: number;
  size?: number;
  children?: React.ReactNode;
  stroke?: number;
}) {
  const r = (size - stroke * 2) / 2,
    c = 2 * Math.PI * r;
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          className="ring-track"
          fill="none"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="var(--accent)"
          fill="none"
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={c * (1 - Math.max(0.008, value / 100))}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <circle cx={size / 2} cy={stroke} r={stroke / 2 + 2} fill="var(--accent)" />
      </svg>
      <div className="ring-content">{children}</div>
    </div>
  );
}
export function ProgressBar({
  value = 0,
  color,
  label,
}: {
  value?: number;
  color?: string;
  label?: string;
}) {
  const { t } = useApp();
  const progress = Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;
  return (
    <div
      className="progress-track"
      role="progressbar"
      aria-label={label || t('Progress', 'التقدم')}
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <span style={{ width: `${progress}%`, background: color }} />
    </div>
  );
}

export function Markdown({ text, className = '' }: { text: string; className?: string }) {
  return (
    <div className={`prose ${className}`}>
      {text.split(/\n\n/).map((block, i) => {
        if (block.startsWith('## ')) {
          const [heading, ...lines] = block.split('\n');
          return (
            <React.Fragment key={i}>
              <h3>{heading.slice(3)}</h3>
              {lines.length > 0 && <p>{lines.join('\n')}</p>}
            </React.Fragment>
          );
        }
        return <p key={i}>{block}</p>;
      })}
    </div>
  );
}
export function SourceLinks({ references }: { references: any[] }) {
  const { t } = useApp();
  return (
    <div className="source-links">
      <h4>{t('Go to the source', 'ارجع إلى المصدر')}</h4>
      {references.map((r, i) => {
        const ref = r.reference || r;
        return (
          <a href={ref.url} target="_blank" rel="noreferrer" key={ref.url}>
            <span className="source-number">{i + 1}</span>
            <span>
              {ref.title}
              <small>{ref.publisher || new URL(ref.url).hostname}</small>
            </span>
            <ExternalLink size={14} />
          </a>
        );
      })}
    </div>
  );
}
export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  const id = useId();
  let assigned = false;
  const connect = (nodes: React.ReactNode): React.ReactNode =>
    React.Children.map(nodes, (node) => {
      if (!React.isValidElement(node)) return node;
      const element = node as React.ReactElement<any>;
      if (
        !assigned &&
        typeof element.type === 'string' &&
        ['input', 'textarea', 'select'].includes(element.type)
      ) {
        assigned = true;
        return React.cloneElement(element, {
          'aria-labelledby': element.props['aria-labelledby'] || id,
          'aria-describedby':
            [element.props['aria-describedby'], hint ? `${id}-hint` : null]
              .filter(Boolean)
              .join(' ') || undefined,
        });
      }
      return element.props.children
        ? React.cloneElement(element, {}, connect(element.props.children))
        : element;
    });
  const content = connect(children);
  return (
    <div
      className="field"
      role={!assigned ? 'group' : undefined}
      aria-labelledby={!assigned ? id : undefined}
    >
      <span id={id}>{label}</span>
      {content}
      {hint && <small id={`${id}-hint`}>{hint}</small>}
    </div>
  );
}

export function Banner({ children, tone = 'info' }: { children: React.ReactNode; tone?: string }) {
  return (
    <div className={`banner ${tone}`}>
      <Sparkles size={17} />
      <div>{children}</div>
    </div>
  );
}
