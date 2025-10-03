import { DB } from '../../lib/db';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import AdminGuard from '../../components/AdminGuard';
import AdminNav from '../../components/AdminNav';

type Venue = { id:string; name:string };
type TableRow = { id:string; table_no:number; venue_id:string };

export default function TablesAdmin() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [rows, setRows] = useState<(TableRow & { venue_name?:string })[]>([]);
  const [venueId, setVenueId] = useState(''); const [tableNo, setTableNo] = useState<number>(1);
  const [editId, setEditId] = useState<string | null>(null);

  const load = async () => {
    const vs = await supabase.from(DB.venues).select('id,name').order('name');
    if (!vs.error) setVenues(vs.data as any);
    // join client-side for simplicity
    const ts = await supabase.from(DB.tables).select('*').order('table_no');
    if (!ts.error) {
      const list = (ts.data as TableRow[]).map(t => ({
        ...t, venue_name: (vs.data as Venue[]).find(v=>v.id===t.venue_id)?.name
      }));
      setRows(list);
    }
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!venueId) return alert('Pick a venue');
    if (editId) {
      const { error } = await supabase.from(DB.tables)
        .update({ venue_id: venueId, table_no: tableNo }).eq('id', editId);
      if (error) return alert(error.message);
    } else {
      const { error } = await supabase.from(DB.tables)
        .insert({ venue_id: venueId, table_no: tableNo });
      if (error) return alert(error.message);
    }
    setEditId(null); setVenueId(''); setTableNo(1); load();
  };
  const del = async (id:string) => {
    if (!confirm('Delete table?')) return;
    const { error } = await supabase.from(DB.tables).delete().eq('id', id);
    if (error) return alert(error.message);
    load();
  };

  return (
    <AdminGuard>
      <main style={{padding:24,fontFamily:'system-ui'}}>
        <h1>Tables</h1>
        <AdminNav />
        <div style={{margin:'12px 0'}}>
          <select value={venueId} onChange={e=>setVenueId(e.target.value)}>
            <option value="">-- venue --</option>
            {venues.map(v=> <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
          <input type='number' min={1} value={tableNo}
                 onChange={e=>setTableNo(parseInt(e.target.value || '1'))} />
          <button onClick={save}>{editId ? 'Update' : 'Add'}</button>
          {editId && <button onClick={()=>{ setEditId(null); setVenueId(''); setTableNo(1); }}>Cancel</button>}
        </div>
        <table style={{borderCollapse:'collapse',width:'100%'}}>
          <thead><tr><th>#</th><th>Venue</th><th></th></tr></thead>
          <tbody>
            {rows.map(r=>(
              <tr key={r.id} style={{borderTop:'1px solid #ddd'}}>
                <td>{r.table_no}</td><td>{r.venue_name ?? ''}</td>
                <td>
                  <button onClick={()=>{ setEditId(r.id); setVenueId(r.venue_id); setTableNo(r.table_no); }}>Edit</button>
                  <button onClick={()=>del(r.id)} style={{marginLeft:8}}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </AdminGuard>
  );
}


