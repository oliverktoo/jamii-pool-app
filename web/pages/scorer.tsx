import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

type Row = {
  match_id: string;
  table_no: number;
  venue_name: string;
  home_name: string | null;
  away_name: string | null;
  home_score: number | null;
  away_score: number | null;
  status: string | null;
};

export default function Scorer() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<any>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [sel, setSel] = useState<string>('');

  // auth
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  // load matches (from your view)
  const load = async () => {
    const { data, error } = await supabase.from('vw_tables_live').select('*');
    if (!error && data) {
      setRows(data as Row[]);
      if (!sel && data.length) setSel((data[0] as any).match_id);
    }
  };
  useEffect(() => { load(); }, []);

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
  };
  const signOut = async () => { await supabase.auth.signOut(); };

  const bump = async (team: 'home'|'away', delta: number) => {
    if (!user) return alert('Please sign in');
    if (!sel) return;

    // read current score from row state
    const r = rows.find(x => (x as any).match_id === sel);
    if (!r) return;

    const newHome = (r.home_score ?? 0) + (team === 'home' ? delta : 0);
    const newAway = (r.away_score ?? 0) + (team === 'away' ? delta : 0);

    const { error } = await supabase
      .from('matches')
      .update({ home_score: newHome, away_score: newAway })
      .eq('id', sel);
    if (error) { alert(error.message); return; }
    load(); // refresh
  };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui', maxWidth: 800 }}>
      <h1>Scorer</h1>

      {!user ? (
        <div style={{ margin: '16px 0' }}>
          <input placeholder="email" value={email} onChange={e => setEmail(e.target.value)} />
          <input placeholder="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          <button onClick={signIn}>Sign in</button>
        </div>
      ) : (
        <div style={{ margin: '16px 0' }}>
          <span>Signed in as {user.email}</span>
          <button style={{ marginLeft: 12 }} onClick={signOut}>Sign out</button>
        </div>
      )}

      <div style={{ margin: '16px 0' }}>
        <label>Match:&nbsp;</label>
        <select value={sel} onChange={e => setSel(e.target.value)}>
          {rows.map((r) => (
            <option key={(r as any).match_id} value={(r as any).match_id}>
              Table {r.table_no} — {r.home_name ?? 'TBD'} vs {r.away_name ?? 'TBD'} ({r.home_score ?? 0}–{r.away_score ?? 0})
            </option>
          ))}
        </select>
        <button style={{ marginLeft: 12 }} onClick={load}>Refresh</button>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={() => bump('home', +1)}>Home +1</button>
        <button onClick={() => bump('home', -1)}>Home -1</button>
        <button onClick={() => bump('away', +1)}>Away +1</button>
        <button onClick={() => bump('away', -1)}>Away -1</button>
      </div>
    </main>
  );
}
