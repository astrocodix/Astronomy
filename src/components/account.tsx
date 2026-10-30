'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Moon,
  Sun,
  Monitor,
  Globe,
  Check,
  Sparkles,
  User,
  Lock,
  Download,
  Mail,
  ArrowUpRight,
  Orbit,
  Eye,
  EyeOff,
  LogOut,
  Target,
  ShieldCheck,
  BookOpen,
  Clock,
  Settings as SettingsIcon,
  ArrowLeft,
} from 'lucide-react';
import { useApp } from './context';
import { Brand, Button, Arrow, PageHeader, Field, Pill, Banner, ProgressBar, Modal } from './ui';
export function SettingsPage({ profileOnly = false }: { profileOnly?: boolean }) {
  const { data, t, lang, setLang, theme, setTheme, api, refresh, notify } = useApp();
  const router = useRouter();
  const [name, setName] = useState(data?.user.name || '');
  const [bio, setBio] = useState(data?.user.profile.bio || '');
  const [goal, setGoal] = useState(data?.user.profile.dailyGoal || 20);
  const [zone, setZone] = useState(data?.user.profile.timezone || 'Asia/Riyadh');
  const [tutor, setTutor] = useState(data?.user.profile.tutorMode || 'beginner');
  const [busy, setBusy] = useState(false);
  const [password, setPassword] = useState({ current: '', password: '' });
  if (!data) return null;
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api('profile', {
        method: 'PATCH',
        body: JSON.stringify({
          name,
          bio,
          dailyGoal: Number(goal),
          timezone: zone,
          tutorMode: tutor,
        }),
      });
      await refresh();
      notify(t('Your preferences have been saved.', 'حُفظت تفضيلاتك.'));
    } catch (e) {
      notify((e as Error).message, 'error');
    }
    setBusy(false);
  };
  return (
    <div className="settings-page page-enter">
      <PageHeader
        eyebrow={t('MAKE THIS SPACE YOUR OWN', 'اجعل هذه المساحة لك')}
        title={
          profileOnly
            ? t('The explorer behind the questions.', 'المستكشف خلف الأسئلة.')
            : t('Your academy. Your preferences.', 'أكاديميتك. تفضيلاتك.')
        }
        description={t(
          'Language, light, and a learning rhythm that works for you.',
          'لغة وإضاءة وإيقاع تعلّم يناسبك.',
        )}
      />
      <div className="settings-layout">
        <aside className="settings-profile panel">
          <span className="profile-avatar">
            <Orbit size={38} />
          </span>
          <h2>{data.user.isGuest ? t('Guest explorer', 'مستكشف زائر') : data.user.name}</h2>
          <p>
            {data.user.isGuest
              ? t('Your progress is saved to this session.', 'تقدمك محفوظ في هذه الجلسة.')
              : data.user.email}
          </p>
          <Pill tone="purple">
            {t('EXPLORER LEVEL', 'مستوى المستكشف')} {data.progress.stats.level}
          </Pill>
          <div className="profile-facts">
            <span>
              <strong>{data.progress.stats.completedLessons}</strong>
              {t('lessons passed', 'دروس مجتازة')}
            </span>
            <span>
              <strong>{data.progress.stats.xp}</strong>XP
            </span>
          </div>
          {data.user.isGuest ? (
            <Button href="/register" className="full-width">
              {t('Make your journey yours', 'احتفظ برحلتك')}
              <Arrow />
            </Button>
          ) : (
            <Button
              variant="secondary"
              className="full-width"
              onClick={async () => {
                await api('auth/logout', { method: 'POST' });
                await refresh();
                router.push('/');
              }}
            >
              <LogOut size={15} />
              {t('Sign out', 'تسجيل الخروج')}
            </Button>
          )}
          <Link className="text-link" href="/achievements">
            {t('View your achievements', 'عرض إنجازاتك')}
            <Arrow size={13} />
          </Link>
        </aside>
        <div className="settings-sections">
          <form onSubmit={save}>
            <section className="settings-section panel">
              <div className="settings-section-title">
                <User size={20} />
                <div>
                  <h2>{t('Personal profile', 'الملف الشخصي')}</h2>
                  <p>
                    {t('A name to put on your next discovery.', 'اسم تضعه على اكتشافك القادم.')}
                  </p>
                </div>
              </div>
              <Field label={t('Display name', 'الاسم الظاهر')}>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                  maxLength={80}
                />
              </Field>
              <Field
                label={t('A little about your curiosity', 'نبذة عن فضولك')}
                hint={t('Optional · 600 characters maximum', 'اختياري · 600 حرف كحد أقصى')}
              >
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  maxLength={600}
                  placeholder={t('What draws you to the universe?', 'ما الذي يجذبك إلى الكون؟')}
                />
              </Field>
            </section>
            {!profileOnly && (
              <section className="settings-section panel">
                <div className="settings-section-title">
                  <Sun size={20} />
                  <div>
                    <h2>{t('Your viewing experience', 'تجربة المشاهدة')}</h2>
                    <p>
                      {t(
                        'Comfortable in daylight. Beautiful after dark.',
                        'مريحة في النهار وجميلة بعد الظلام.',
                      )}
                    </p>
                  </div>
                </div>
                <Field label={t('Appearance', 'المظهر')}>
                  <div className="theme-choices">
                    {[
                      ['light', 'Light', 'فاتح', Sun],
                      ['dark', 'Dark', 'داكن', Moon],
                      ['system', 'System', 'النظام', Monitor],
                    ].map(([key, en, ar, Icon]: any) => (
                      <button
                        type="button"
                        className={`theme-choice ${key} ${theme === key ? 'selected' : ''}`}
                        onClick={() => setTheme(key)}
                        key={key}
                      >
                        <span className="theme-preview">
                          <i />
                          <span>
                            <b />
                            <b />
                            <em />
                          </span>
                        </span>
                        <span>
                          <Icon size={15} />
                          {t(en, ar)}
                          {theme === key && <Check size={15} />}
                        </span>
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label={t('Interface language', 'لغة الواجهة')}>
                  <div className="language-options">
                    <button
                      type="button"
                      onClick={() => setLang('en')}
                      className={lang === 'en' ? 'active' : ''}
                    >
                      <Globe size={17} />
                      <span>
                        English<small>Left to right</small>
                      </span>
                      {lang === 'en' && <Check size={17} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setLang('ar')}
                      className={lang === 'ar' ? 'active' : ''}
                    >
                      <Globe size={17} />
                      <span>
                        العربية<small>من اليمين إلى اليسار</small>
                      </span>
                      {lang === 'ar' && <Check size={17} />}
                    </button>
                  </div>
                </Field>
                <p className="data-note">
                  {t(
                    'Appearance and language save immediately. Your learning progress never resets.',
                    'يُحفظ المظهر واللغة فورًا دون إعادة تعيين تقدمك.',
                  )}
                </p>
              </section>
            )}
            <section className="settings-section panel">
              <div className="settings-section-title">
                <Target size={20} />
                <div>
                  <h2>{t('A rhythm for learning', 'إيقاع للتعلّم')}</h2>
                  <p>
                    {t(
                      'Small, realistic goals make room for discovery.',
                      'تفسح الأهداف الصغيرة الواقعية مجالًا للاكتشاف.',
                    )}
                  </p>
                </div>
              </div>
              <div className="form-grid">
                <Field label={t('Daily study goal', 'هدف الدراسة اليومي')}>
                  <select value={goal} onChange={(e) => setGoal(+e.target.value)}>
                    {[10, 15, 20, 30, 45, 60, 90, 120].map((g) => (
                      <option key={g} value={g}>
                        {g} {t('minutes', 'دقيقة')}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label={t('Time zone for activity', 'المنطقة الزمنية للنشاط')}>
                  <select value={zone} onChange={(e) => setZone(e.target.value)}>
                    {[
                      'Asia/Riyadh',
                      'Africa/Cairo',
                      'UTC',
                      'Europe/London',
                      'America/New_York',
                      'Asia/Dubai',
                      'Asia/Tokyo',
                    ].map((z) => (
                      <option key={z}>{z}</option>
                    ))}
                  </select>
                </Field>
                <Field label={t('Preferred tutor approach', 'أسلوب المعلّم المفضل')}>
                  <select value={tutor} onChange={(e) => setTutor(e.target.value)}>
                    {[
                      ['beginner', 'Beginner', 'مبتدئ'],
                      ['academic', 'Academic', 'أكاديمي'],
                      ['advanced', 'Advanced', 'متقدم'],
                      ['research', 'Research', 'بحثي'],
                      ['exam', 'Exam preparation', 'تحضير اختبار'],
                    ].map(([key, en, ar]) => (
                      <option value={key} key={key}>
                        {t(en, ar)}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <Button type="submit" loading={busy}>
                {t('Save my preferences', 'احفظ تفضيلاتي')}
                <Check size={16} />
              </Button>
            </section>
          </form>
          <section className="settings-section panel">
            <div className="settings-section-title">
              <ShieldCheck size={20} />
              <div>
                <h2>{t('Your data belongs to you', 'بياناتك لك')}</h2>
                <p>
                  {t(
                    'Export your profile, progress, and tutor conversations.',
                    'صدّر ملفك وتقدمك ومحادثات المعلّم.',
                  )}
                </p>
              </div>
            </div>
            <a className="btn btn-secondary" href="/api/profile/export" download>
              <Download size={16} />
              {t('Download my learning data', 'تنزيل بيانات تعلّمي')}
            </a>
            <p className="data-note">
              {t(
                'AI conversations are sent to the configured provider only in AI mode. Reference mode uses the local academy database. Never put sensitive personal information in a question.',
                'تُرسل المحادثات إلى المزود المهيأ في وضع AI فقط. يستخدم وضع المراجع قاعدة الأكاديمية المحلية. لا تضع معلومات شخصية حساسة في سؤالك.',
              )}
            </p>
          </section>
          {!data.user.isGuest && (
            <section className="settings-section panel">
              <div className="settings-section-title">
                <Lock size={20} />
                <h2>{t('Change password', 'تغيير كلمة المرور')}</h2>
              </div>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    await api('profile/password', {
                      method: 'POST',
                      body: JSON.stringify(password),
                    });
                    setPassword({ current: '', password: '' });
                    notify(
                      t(
                        'Password changed. Other sessions have been signed out.',
                        'تغيرت كلمة المرور وأُغلقت الجلسات الأخرى.',
                      ),
                    );
                  } catch (e) {
                    notify((e as Error).message, 'error');
                  }
                }}
              >
                <div className="form-grid">
                  <Field label={t('Current password', 'كلمة المرور الحالية')}>
                    <input
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password.current}
                      onChange={(e) => setPassword((v) => ({ ...v, current: e.target.value }))}
                    />
                  </Field>
                  <Field
                    label={t('New password', 'كلمة المرور الجديدة')}
                    hint={t('At least 12 characters', '12 حرفًا على الأقل')}
                  >
                    <input
                      type="password"
                      autoComplete="new-password"
                      minLength={12}
                      maxLength={128}
                      required
                      value={password.password}
                      onChange={(e) => setPassword((v) => ({ ...v, password: e.target.value }))}
                    />
                  </Field>
                </div>
                <Button variant="secondary" type="submit">
                  {t('Update password', 'تحديث كلمة المرور')}
                </Button>
              </form>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
export function AuthPage({ type }: { type: 'register' | 'login' | 'forgot' | 'reset' }) {
  const { t, lang, setLang, api, refresh, notify } = useApp();
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState(''),
    [name, setName] = useState(''),
    [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [done, setDone] = useState(false);
  const register = type === 'register';
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (type === 'forgot') {
        await api('auth/forgot', { method: 'POST', body: JSON.stringify({ email }) });
        setDone(true);
      } else if (type === 'reset') {
        await api('auth/reset', {
          method: 'POST',
          body: JSON.stringify({ token: params.get('token'), password }),
        });
        notify(
          t('Password updated. Sign in to continue.', 'حُدّثت كلمة المرور. سجّل الدخول للمتابعة.'),
        );
        router.push('/login');
      } else {
        await api(`auth/${register ? 'register' : 'login'}`, {
          method: 'POST',
          body: JSON.stringify({ name, email, password, language: lang }),
        });
        await refresh();
        router.push('/');
        notify(
          register
            ? t('Welcome aboard. Your journey is saved.', 'أهلًا بك. رحلتك محفوظة.')
            : t('Welcome back to your universe.', 'مرحبًا بعودتك إلى كونك.'),
        );
      }
    } catch (e) {
      setError((e as Error).message);
    }
    setBusy(false);
  };
  return (
    <div className="auth-page">
      <section className="auth-visual">
        <img
          src="/images/carina.webp"
          alt={t(
            'Cosmic Cliffs observed by the James Webb Space Telescope',
            'الجروف الكونية من رصد تلسكوب جيمس ويب',
          )}
        />
        <div className="auth-visual-shade" />
        <Link href="/" className="auth-brand">
          <Brand />
        </Link>
        <div className="auth-visual-copy">
          <span className="eyebrow">
            {t('YOUR NEXT CHAPTER STARTS HERE', 'يبدأ فصلك التالي هنا')}
          </span>
          <h1>{t('There’s a whole\nuniverse in you.', 'في داخلك\nكون كامل.')}</h1>
          <p>{t('Learn the Universe.\nUnderstand Everything.', 'تعلّم الكون.\nوافهم كل شيء.')}</p>
          <div className="auth-features">
            <span>
              <Check size={15} />
              {t('Structured, source-grounded learning', 'تعلم منظم وموثق')}
            </span>
            <span>
              <Check size={15} />
              {t('Your progress, always yours', 'تقدمك لك دائمًا')}
            </span>
            <span>
              <Check size={15} />
              {t('Arabic and English, side by side', 'العربية والإنجليزية جنبًا إلى جنب')}
            </span>
          </div>
        </div>
        <a
          href="https://science.nasa.gov/asset/webb/cosmic-cliffs-in-the-carina-nebula-nircam-image/"
          target="_blank"
          rel="noreferrer"
          className="auth-image-credit"
        >
          NGC 3324 · NASA, ESA, CSA, STScI
          <ArrowUpRight size={12} />
        </a>
      </section>
      <section className="auth-form-panel">
        <div className="auth-form-top">
          <Link href="/" className="text-link">
            <ArrowLeft size={14} className="directional" />
            {t('Back to the academy', 'العودة إلى الأكاديمية')}
          </Link>
          <button className="language-button" onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}>
            <Globe size={16} />
            {lang === 'en' ? 'العربية' : 'English'}
          </button>
        </div>
        <div className="auth-form-content">
          <div className="auth-form-icon">
            <Orbit size={28} />
          </div>
          <h2>
            {t(
              register
                ? 'A new world is waiting.'
                : type === 'login'
                  ? 'Welcome back, explorer.'
                  : type === 'forgot'
                    ? 'Find your way back.'
                    : 'A fresh start, securely.',
              register
                ? 'عالم جديد ينتظرك.'
                : type === 'login'
                  ? 'مرحبًا بعودتك أيها المستكشف.'
                  : type === 'forgot'
                    ? 'اعثر على طريق العودة.'
                    : 'بداية جديدة وآمنة.',
            )}
          </h2>
          <p>
            {t(
              register
                ? 'Create your account. Keep every discovery.'
                : type === 'login'
                  ? 'Pick up right where your curiosity left off.'
                  : type === 'forgot'
                    ? 'We’ll send a secure recovery link if your account exists.'
                    : 'Choose a new password with at least 12 characters.',
              register
                ? 'أنشئ حسابك واحتفظ بكل اكتشاف.'
                : type === 'login'
                  ? 'تابع من حيث توقف فضولك.'
                  : type === 'forgot'
                    ? 'سنرسل رابط استعادة آمنًا إذا كان حسابك موجودًا.'
                    : 'اختر كلمة مرور جديدة من 12 حرفًا على الأقل.',
            )}
          </p>
          {done ? (
            <Banner>
              {t(
                'If that account exists, a recovery link has been sent. Check your inbox.',
                'إذا كان الحساب موجودًا فقد أُرسل رابط استعادة. تحقق من بريدك.',
              )}
            </Banner>
          ) : (
            <form onSubmit={submit}>
              {register && (
                <Field label={t('Your name', 'اسمك')}>
                  <input
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    minLength={2}
                    maxLength={80}
                    placeholder={t('What should we call you?', 'بماذا نناديك؟')}
                  />
                </Field>
              )}
              {type !== 'reset' && (
                <Field label={t('Email address', 'البريد الإلكتروني')}>
                  <div className="input-with-icon">
                    <Mail size={17} />
                    <input
                      type="email"
                      dir="ltr"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      placeholder="you@example.com"
                    />
                  </div>
                </Field>
              )}
              {type !== 'forgot' && (
                <Field
                  label={t('Password', 'كلمة المرور')}
                  hint={
                    register || type === 'reset'
                      ? t(
                          'At least 12 characters. Longer is stronger.',
                          '12 حرفًا على الأقل. الأطول أقوى.',
                        )
                      : undefined
                  }
                >
                  <div className="input-with-icon">
                    <Lock size={17} />
                    <input
                      type={visible ? 'text' : 'password'}
                      dir="ltr"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      minLength={register || type === 'reset' ? 12 : 1}
                      maxLength={128}
                      autoComplete={
                        register || type === 'reset' ? 'new-password' : 'current-password'
                      }
                      required
                      placeholder="••••••••••••"
                    />
                    <button
                      type="button"
                      aria-label={t(
                        visible ? 'Hide password' : 'Show password',
                        visible ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور',
                      )}
                      onClick={() => setVisible((v) => !v)}
                    >
                      {visible ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </Field>
              )}
              {type === 'login' && (
                <Link href="/forgot-password" className="forgot-link">
                  {t('Forgot your password?', 'نسيت كلمة المرور؟')}
                </Link>
              )}
              {register && (
                <p className="auth-privacy-note">
                  <ShieldCheck size={14} />
                  {t(
                    'Your guest progress stays with you when you register.',
                    'يبقى تقدم الزائر معك عند إنشاء حساب.',
                  )}
                </p>
              )}
              {error && (
                <div className="form-error" role="alert">
                  {error}
                </div>
              )}
              <Button type="submit" loading={busy} className="full-width">
                {t(
                  register
                    ? 'Start my journey'
                    : type === 'login'
                      ? 'Sign in to my academy'
                      : type === 'forgot'
                        ? 'Send recovery link'
                        : 'Set new password',
                  register
                    ? 'ابدأ رحلتي'
                    : type === 'login'
                      ? 'ادخل إلى أكاديميتي'
                      : type === 'forgot'
                        ? 'أرسل رابط الاستعادة'
                        : 'عيّن كلمة مرور جديدة',
                )}
                <Arrow />
              </Button>
            </form>
          )}
          {(register || type === 'login') && (
            <>
              <div className="auth-divider">
                <span>{t('or keep exploring', 'أو واصل الاستكشاف')}</span>
              </div>
              <Button href="/" variant="secondary" className="full-width">
                {t('Explore as a guest', 'استكشف كزائر')}
                <TelescopeIcon />
              </Button>
              <p className="auth-switch">
                {t(
                  register ? 'Already part of the universe?' : 'New to Astroverse?',
                  register ? 'جزء من الكون بالفعل؟' : 'جديد في أستروفرس؟',
                )}{' '}
                <Link href={register ? '/login' : '/register'}>
                  {t(
                    register ? 'Sign in' : 'Create an account',
                    register ? 'سجّل الدخول' : 'أنشئ حسابًا',
                  )}
                </Link>
              </p>
            </>
          )}
          <div className="auth-form-bottom">
            <ShieldCheck size={14} />
            {t('Secure sessions. No third-party advertising.', 'جلسات آمنة. بلا إعلانات خارجية.')}
          </div>
        </div>
      </section>
    </div>
  );
}
function TelescopeIcon() {
  return <ArrowUpRight size={16} />;
}
