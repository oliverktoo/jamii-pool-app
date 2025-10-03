import AdminGuard from '../../components/AdminGuard';
import AdminNav from '../../components/AdminNav';

export default function AdminHome() {
  return (
    <AdminGuard>
      <main style={{padding:24,fontFamily:'system-ui'}}>
        <h1>Admin</h1>
        <AdminNav />
        <p>Use the links above to manage data.</p>
      </main>
    </AdminGuard>
  );
}
