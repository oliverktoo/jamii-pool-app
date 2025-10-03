import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import AdminGuard from '../../components/AdminGuard';
import AdminNav from '../../components/AdminNav';

type Venue = { id: string; name: string; location: string | null };

export default function VenuesAdmin() {
  const [rows, setRows] = useState<Venue[]>([]);
  const [name, setName] = useState(''); const [location, setLocation] = useState('');
  const [editId, setEditId] = useState<string | null>(null);

  const load = async () => {
    const { data, error } = await supabase.from('venues').select('*').order('name');
    if (!error) setRows((data as Venue[]) ?? []);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!name.trim()) return alert('Name required');
    if (editId) {
      const { error } = await supabase.from('venues')
        .update({ name, location: location || null }).eq('id', editId);
      if (error) return alert(error.message);
    } else {
      const { error } = await supabase.from('venues')
        .insert({ name, location: location || null });
      if (error) return alert(error.message);
    }
    setName(''); setLocation(''); setEditId(null); load();
  };
  const del = async (id:string) => {
    if (!confirm('Delete venue?')) return;
    const { error } = await supabase.from('venues').delete().eq('id', id);
    if (error) return alert(error.message);
    load();
  };

  return (
    <AdminGuard>
      <main style={{padding:24,fontFamily:'system-ui'}}>
        <h1>Venues</h1>
        <AdminNav />
        <div style={{margin:'12px 0'}}>
          <input placeholder='name' value={name} onChange={e=>setName(e.target.value)} />
          <input placeholder='location (optional)' value={location} onChange={e=>setLocation(e.target.value)} />
          <button onClick={save}>{editId ? 'Update' : 'Add'}</button>
          {editId && <button onClick={()=>{ setEditId(null); setName(''); setLocation(''); }}>Cancel</button>}
        </div>
        <table style={{borderCollapse:'collapse',width:'100%'}}>
          <thead><tr><th>Name</th><th>Location</th><th></th></tr></thead>
          <tbody>
            {rows.map(v=>(
              <tr key={v.id} style={{borderTop:'1px solid #ddd'}}>
                <td>{v.name}</td><td>{v.location ?? ''}</td>
                <td>
                  <button onClick={()=>{ setEditId(v.id); setName(v.name); setLocation(v.location ?? ''); }}>Edit</button>
                  <button onClick={()=>del(v.id)} style={{marginLeft:8}}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </AdminGuard>
  );
}
