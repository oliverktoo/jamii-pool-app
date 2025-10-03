export default function AdminEnv() {
  return (
    <main style={{ padding: 24, fontFamily: 'system-ui' }}>
      <h2>Build-time env</h2>
      <pre>NEXT_PUBLIC_ORG_ID = {process.env.NEXT_PUBLIC_ORG_ID ?? '(undefined)'}</pre>
      <p style={{color:'#666'}}>Remove this page after verifying.</p>
    </main>
  );
}
