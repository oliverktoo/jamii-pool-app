import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

async function isAdmin(): Promise<'noauth' | 'denied' | 'ok'> {
  const { data: sessData, error: sErr } = await supabase.auth.getSession();
  if (sErr) return 'noauth';
  const session = sessData?.session;
  if (!session?.user?.id) return 'noauth';

  const { data, error } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (error) return 'denied';
  return data ? 'ok' : 'denied';
}

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<'loading' | 'noauth' | 'denied' | 'ok'>('loading');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);

  const check = async () => {
    setErr(null);
    try {
      const res = await isAdmin();
      setState(res);
    } catch (e: any) {
      setErr(e?.message ?? String(e));
      setState('noauth');
    }
  };

  useEffect(() => {
    check();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, _session) => {
      // Just re-check, do NOT reload
      check();
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (state === 'loading') {
    return <main style={{ padding: 24, fontFamily: 'system-ui' }}>
      <p>Checking access…</p>
      {err && <p style={{ color: 'crimson' }}>Error: {err}</p>}
    </main>;
  }

  if (state === 'noauth') {
    return (
      <main style={{ padding: 24, fontFamily: 'system-ui' }}>
        <h2>Admin sign in</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '8px 0' }}>
          <input
            placeholder="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ padding: 8, minWidth: 260 }}
          />
          <input
            placeholder="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ padding: 8, minWidth: 200 }}
          />
          <button
            onClick={async () => {
              setErr(null);
              const { error } = await supabase.auth.signInWithPassword({ email, password });
              if (error) setErr(error.message);
            }}
            style={{ padding: '8px 14px' }}
          >
            Sign in
          </button>
        </div>
        {err && <p style={{ color: 'crimson' }}>{err}</p>}
      </main>
    );
  }

  if (state === 'denied') {
    return <main style={{ padding: 24, fontFamily: 'system-ui' }}>
      <h2>Access denied</h2>
      <p>You are signed in but not an admin for this app.</p>
    </main>;
  }

  return <>{children}</>;
}
