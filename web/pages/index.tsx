import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

type Row = {
  table_id: string;
  table_no: number;
  venue_name: string;
  match_id: string | null;
  status: string | null;
  home_score: number | null;
  away_score: number | null;
  home_name: string | null;
  away_name: string | null;
};

export default function Home() {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase.from('vw_tables_live').select('*');
      if (!error && data) setRows(data as Row[]);
    };
    load();
    const id = setInterval(load, 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui' }}>
      <h1>Jamii Pool — Tables</h1>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr><th>#</th><th>Venue</th><th>Home</th><th>Score</th><th>Away</th><th>Status</th></tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.table_id} style={{ borderTop: '1px solid #ddd' }}>
              <td>{r.table_no}</td>
              <td>{r.venue_name}</td>
              <td>{r.home_name ?? 'TBD'}</td>
              <td>{(r.home_score ?? 0)} — {(r.away_score ?? 0)}</td>
              <td>{r.away_name ?? 'TBD'}</td>
              <td>{r.status ?? 'idle'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
