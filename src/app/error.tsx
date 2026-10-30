'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main style={{ padding: '15vh 8vw', textAlign: 'center' }}>
      <h1>A small detour in the cosmos.</h1>
      <p>
        The page encountered an error. Your saved learning data is still in the academy database.
      </p>
      <button onClick={reset} style={{ padding: '14px 24px', marginTop: 20, cursor: 'pointer' }}>
        Try again · حاول مجددًا
      </button>
      <p>
        <a href="/">Return to your workspace · العودة إلى مساحة التعلم</a>
      </p>
    </main>
  );
}
