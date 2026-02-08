'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type JailState = 'locked' | 'escaped' | 'failed';

export default function Jail() {
  const [state, setState] = useState<JailState>('locked');
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (state !== 'locked') return;

    if (timeLeft <= 0) {
      setState('failed');
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(t => t - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, state]);

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#000',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui',
        textAlign: 'center',
        padding: '32px',
      }}
    >
      <h1 style={{ fontSize: '3rem', marginBottom: '16px' }}>JAIL</h1>

      {state === 'locked' && (
        <>
          <p style={{ opacity: 0.7, marginBottom: '24px' }}>
            Don’t waste the first 5 seconds.
          </p>

          <p style={{ fontSize: '2rem', marginBottom: '24px' }}>
            {timeLeft}s
          </p>

          <button
            onClick={() => setState('escaped')}
            style={{
              padding: '12px 24px',
              fontSize: '1rem',
              background: '#fff',
              color: '#000',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '6px',
            }}
          >
            ESCAPE
          </button>
        </>
      )}

      {state === 'escaped' && (
        <>
          <p style={{ fontSize: '1.5rem', marginBottom: '24px' }}>
            You escaped.
          </p>
          <Link href="/feed" style={{ color: '#fff', opacity: 0.8 }}>
            Back to Feed
          </Link>
        </>
      )}

      {state === 'failed' && (
        <>
          <p style={{ fontSize: '1.5rem', marginBottom: '24px' }}>
            Too slow.
          </p>
          <Link href="/feed" style={{ color: '#fff', opacity: 0.8 }}>
            Back to Feed
          </Link>
        </>
      )}
    </main>
  );
}
