import React, { useState } from 'react';
import { generateKeySalt, deriveKeyBase64 } from '../crypto';

export default function Register({ onAuth }: { onAuth: (token:string, keySalt:string)=>void }) {
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [err,setErr] = useState('');

  async function submit(e:any) {
    e.preventDefault();
    setErr('');
    try {
      const keySalt = await generateKeySalt(); // base64
      const res = await fetch((import.meta.env.VITE_API_BASE || 'http://localhost:4000') + '/auth/register', {
        method:'POST', headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ email, password, keySalt })
      });
      const j = await res.json();
      if (!res.ok) return setErr(j.error || 'register failed');
      onAuth(j.token, j.keySalt);
    } catch (err:any) {
      setErr(err.message || 'error');
    }
  }

  return <form onSubmit={submit}>
    <label>Email</label>
    <input value={email} onChange={e=>setEmail(e.target.value)} />
    <label>Password (this will also be used to derive your encryption key)</label>
    <input type="password" value={password} onChange={e=>setPassword(e.target.value)} />
    {err && <div style={{ color:'crimson' }}>{err}</div>}
    <button type="submit">Register</button>
  </form>
}
