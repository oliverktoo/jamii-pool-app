import Link from 'next/link';

export default function AdminNav() {
  const link = (href:string, label:string) =>
    <li style={{display:'inline-block',marginRight:12}}><Link href={href}>{label}</Link></li>;
  return (
    <nav style={{margin:'12px 0'}}>
      <ul style={{listStyle:'none',padding:0}}>
        {link('/admin','Dashboard')}
        {link('/admin/venues','Venues')}
        {link('/admin/tables','Tables')}
      </ul>
      <hr/>
    </nav>
  );
}
