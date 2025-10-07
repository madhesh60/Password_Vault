import React, { useEffect, useState } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Vault from './components/Vault';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('pv_token'));
  const [keySalt, setKeySalt] = useState<string | null>(localStorage.getItem('pv_keysalt'));

  useEffect(()=>{
    const t = localStorage.getItem('pv_token');
    const s = localStorage.getItem('pv_keysalt');
    setToken(t);
    setKeySalt(s);
  }, []);

  if (!token) {
    return <div className="center">
      <div className="card">
        <h2>Password Vault</h2>
        <Tabs onAuth={(t, s)=>{ setToken(t); setKeySalt(s); localStorage.setItem('pv_token', t); localStorage.setItem('pv_keysalt', s); }} />
      </div>
    </div>
  }

  return <Vault token={token} keySalt={keySalt!} onLogout={()=>{
    localStorage.removeItem('pv_token'); localStorage.removeItem('pv_keysalt');
    setToken(null); setKeySalt(null);
  }} />
}

function Tabs({ onAuth }: { onAuth: (token:string, keySalt:string)=>void }) {
  
  const [tab,setTab] = useState<'login'|'register'>('login');
  return <>
    <div>
      {/* Info for first-time users */}
      <div style={{
        backgroundColor: '#f0f4ff',
        border: '1px solid #a0c4ff',
        padding: '10px',
        marginBottom: '17px',
        borderRadius: '5px',
        fontSize: '0.9em',
        color: '#333'
      }}>
       Hey there! If it’s your first time, Register first. Once registered, use your email and password to log in — it will be your vault key.
      </div>
    </div>
    <div style={{ display: 'flex', gap: 8 }}>
      <button onClick={()=>setTab('register')} className={tab==='login' ? 'active' : ''}>Register</button>
      <button onClick={()=>setTab('login')} className={tab==='register' ? 'active' : ''}>Login</button>
    </div>
    {tab==='login' ? <Login onAuth={onAuth} /> : <Register onAuth={onAuth} />}
  </>
}
