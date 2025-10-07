import React, { useState } from 'react';

export default function Login({ onAuth }: { onAuth: (token:string, keySalt:string)=>void }) {
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [err,setErr] = useState('');

  async function submit(e: any) {
    e.preventDefault();
    setErr('');
    const res = await fetch((import.meta.env.VITE_API_BASE || import.meta.env.VITE_REACT_APP_BACKEND_URL) + '/auth/login', {
      method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ email, password })
    });
    const j = await res.json();
    if (!res.ok) return setErr(j.error || 'login failed');
    onAuth(j.token, j.keySalt);
  }

  return <form onSubmit={submit}>
    <label>Email</label>
    <input value={email} onChange={e=>setEmail(e.target.value)} />
    <label>Password</label>
    <input type="password" value={password} onChange={e=>setPassword(e.target.value)} />
    {err && <div style={{ color:'crimson' }}>{err}</div>}
    <button type="submit">Login</button>
  </form>
}
