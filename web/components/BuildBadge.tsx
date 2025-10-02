export default function BuildBadge() {
  // Netlify injects COMMIT_REF at build time
  const ref = (process.env.COMMIT_REF || process.env.NEXT_PUBLIC_APP_VERSION || 'dev').toString();
  const shortRef = ref.length > 7 ? ref.slice(0,7) : ref;

  return (
    <div style={{
      position: 'fixed', bottom: 12, left: 12,
      padding: '6px 10px', borderRadius: 999,
      background: '#f2f2f2', color: '#555', fontFamily: 'system-ui',
      fontSize: 12, boxShadow: '0 1px 6px rgba(0,0,0,0.08)', zIndex: 9999
    }}>
      build: {shortRef}
    </div>
  );
}
