import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export async function checkAdmin() {
  const { data: u } = await supabase.auth.getUser();
  const user = u?.user;
  if (!user) return { user: null, isAdmin: false };
  const { data } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();
  return { user, isAdmin: !!data };
}

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<'loading' | 'noauth' | 'denied' | 'ok'>('loading');
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');

  useEffect(() => {
    (async () => {
      const { isAdmin, user } = await checkAdmin();
      if (!user) setState('noauth');
      else if (!isAdmin) setState('denied');
      else setState('ok');
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, _s) => location.reload());
    return () => sub.subscription.unsubscribe();
  }, []);

  if (state === 'loading') return <div style={{padding:24}}>Checking access…</div>;
  if (state === 'noauth') return (
    <main style={{padding:24,fontFamily:'system-ui'}}>
      <h2>Admin sign in</h2>
      <input placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      <button onClick={async ()=>{
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) alert(error.message);
      }}>Sign in</button>
    </main>
  );
  if (state === 'denied') return <div style={{padding:24}}>You are signed in but not an admin.</div>;
  return <>{children}</>;
}
