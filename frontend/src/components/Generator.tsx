import React, { useState } from 'react';

function randomFrom(chars:string) {
  return chars.charAt(Math.floor(Math.random()*chars.length));
}

export default function Generator({ onSave }:{ onSave:(obj:any)=>void }) {
  const [len,setLen] = useState(16);
  const [numbers,setNumbers] = useState(true);
  const [symbols,setSymbols] = useState(true);
  const [letters,setLetters] = useState(true);
  const [excludeLookAlikes,setExcludeLookAlikes] = useState(true);
  const [last,setLast] = useState('');

  function generate() {
    const lookalikes = 'Il1O0';
    const nums = '0123456789';
    const syms = '!@#$%^&*()-_=+[]{};:,.<>?';
    const lettersSet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let pool = '';
    if (letters) pool += lettersSet;
    if (numbers) pool += nums;
    if (symbols) pool += syms;
    if (excludeLookAlikes) pool = pool.split('').filter(c=>!lookalikes.includes(c)).join('');
    if (!pool) return '';
    let out = '';
    for (let i=0;i<len;i++) out += randomFrom(pool);
    setLast(out);
    return out;
  }

  return <div style={{ display:'flex', gap:8, alignItems:'center' }}>
    <div className="generator">
      <input type="range" min={8} max={64} value={len} onChange={e=>setLen(Number(e.target.value))} />
      <div><small className="muted">Length: {len}</small></div>
      <label><input type="checkbox" checked={letters} onChange={e=>setLetters(e.target.checked)} /> letters</label>
      <label><input type="checkbox" checked={numbers} onChange={e=>setNumbers(e.target.checked)} /> numbers</label>
      <label><input type="checkbox" checked={symbols} onChange={e=>setSymbols(e.target.checked)} /> symbols</label>
      <label><input type="checkbox" checked={excludeLookAlikes} onChange={e=>setExcludeLookAlikes(e.target.checked)} /> exclude look-alikes</label>
      <button onClick={()=>{ const p = generate(); navigator.clipboard.writeText(p); setTimeout(()=>navigator.clipboard.writeText(''),15000); alert('Generated and copied to clipboard (clears after ~15s)'); }}>Generate & Copy</button>
      <button onClick={()=>{
        const p = generate();
        const title = prompt('Save with title?') || 'Untitled';
        const username = prompt('Username/email (optional)') || '';
        onSave({ title, username, password: p, url:'', notes:'' });
      }}>Save</button>
    </div>
  </div>
}
