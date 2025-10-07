import React, { useEffect, useState } from 'react';
import { deriveKey, encryptObject, decryptToObject } from '../crypto';
import Generator from './Generator';

type Item = { id: string; ciphertext: string; iv: string; createdAt: string };

export default function Vault({ token, keySalt, onLogout }:{ token:string, keySalt:string, onLogout:()=>void }) {
  const [itemsEnc, setItemsEnc] = useState<Item[]>([]);
  const [itemsDec, setItemsDec] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const [key, setKey] = useState<CryptoKey | null>(null);
  const [loading, setLoading] = useState(false);
  const API = (import.meta.env.VITE_API_BASE || 'https://password-vault-1-h7oj.onrender.com');

  useEffect(()=>{
    // ask user for password again to derive key (simple approach)
    (async ()=> {
      const pw = prompt('Enter your account password to unlock the vault (never sent to server for decryption)') || '';
      try {
        const k = await deriveKey(pw, keySalt);
        setKey(k);
      } catch (err) {
        alert('Failed deriving key: ' + (err as any).message);
      }
    })();
  }, [keySalt]);

  useEffect(()=>{ fetchItems(); }, [key]);

  async function fetchItems() {
    if (!key) return;
    setLoading(true);
    try {
      const res = await fetch(API + '/vault', { headers: { Authorization: 'Bearer ' + token }});
      const arr: Item[] = await res.json();
      setItemsEnc(arr);
      const decs = [];
      for (const it of arr) {
        try {
          const d = await decryptToObject(it.ciphertext, it.iv, key);
          decs.push({ ...d, id: it.id, createdAt: it.createdAt });
        } catch (err) {
          // skip if cannot decrypt
        }
      }
      setItemsDec(decs);
    } finally { setLoading(false); }
  }

  async function addItem(obj: any) {
    if (!key) return alert('no key');
    const enc = await encryptObject(obj, key);
    const res = await fetch(API + '/vault', { method:'POST', headers:{ 'Content-Type':'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify(enc) });
    if (res.ok) fetchItems();
  }

  async function updateItem(id:string, obj:any) {
    if (!key) return;
    const enc = await encryptObject(obj, key);
    const res = await fetch(API + '/vault/' + id, { method:'PUT', headers:{ 'Content-Type':'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify(enc) });
    if (res.ok) fetchItems();
  }

  async function deleteItem(id:string) {
    if (!confirm('Delete item?')) return;
    await fetch(API + '/vault/' + id, { method:'DELETE', headers:{ Authorization: 'Bearer ' + token }});
    fetchItems();
  }

  const filtered = itemsDec.filter(it => {
    const q = filter.toLowerCase();
    return !q || JSON.stringify(it).toLowerCase().includes(q);
  });

  return (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh', // full viewport height
    backgroundColor: '#f9f9f9', // optional light background
    padding: '20px'
  }}>
    <div className="card" style={{ maxWidth: 1000, width: '100%' }}>
      <div className="head">
        <h3>Your Vault</h3>
        <div className="controls">
          <Generator onSave={addItem} />
          <input className="search" placeholder="Search..." value={filter} onChange={e=>setFilter(e.target.value)} />
          <button className="secondary" onClick={()=>onLogout()}>Logout</button>
        </div>
      </div>

      <div>
        <h4 className="muted">ITEMS ({filtered.length})</h4>
        {loading && <div>Loading...</div>}
        <div className="list">
          {filtered.map(it=> <VaultRow key={it.id} item={it} onUpdate={updateItem} onDelete={()=>deleteItem(it.id)} />)}
        </div>
      </div>
    </div>
  </div>
);

}

function VaultRow({ item, onUpdate, onDelete }: any) {
  const [editing,setEditing] = useState(false);
  const [form,setForm] = useState({ title:item.title||'', username:item.username||'', password:item.password||'', url:item.url||'', notes:item.notes||''});
  useEffect(()=> setForm({ title:item.title||'', username:item.username||'', password:item.password||'', url:item.url||'', notes:item.notes||'' }), [item]);

  async function save() { await onUpdate(item.id, form); setEditing(false); }
  async function copyPassword() {
    await navigator.clipboard.writeText(form.password || '');
    // clear clipboard after 15s
    setTimeout(()=> navigator.clipboard.writeText(''), 15000);
    alert('Password copied will clear from clipboard after 15s due to Safety measures');
  }

  if (editing) {
    return <div className="item">
      <label>Title</label><input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} />
      <label>Username</label><input value={form.username} onChange={e=>setForm({...form,username:e.target.value})} />
      <label>Password</label><input value={form.password} onChange={e=>setForm({...form,password:e.target.value})} />
      <label>URL</label><input value={form.url} onChange={e=>setForm({...form,url:e.target.value})} />
      <label>Notes</label><textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} />
      <div style={{ display:'flex', gap:8 }}>
        <button onClick={save}>Save</button>
        <button className="secondary" onClick={()=>setEditing(false)}>Cancel</button>
      </div>
    </div>
  }

  return <div className="item">
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
      <div>
        <strong>{item.title}</strong><div><small className="muted">{item.username} • {item.url}</small></div>
      </div>
      <div style={{ display:'flex', gap:8 }}>
        <button onClick={()=>setEditing(true)}>Edit</button>
        <button onClick={copyPassword}>Copy</button>
        <button className="danger" onClick={onDelete}>Delete</button>
      </div>
    </div>
    {item.notes && <div style={{ marginTop:8 }}>{item.notes}</div>}
  </div>
}
