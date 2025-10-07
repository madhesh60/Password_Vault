/**
 * Client-side crypto utilities using Web Crypto API.
 * - PBKDF2 to derive AES-GCM key from password + salt.
 * - AES-GCM encrypt/decrypt functions returning base64 strings.
 */

function toBase64(b: ArrayBuffer) { return btoa(String.fromCharCode(...new Uint8Array(b))); }
function fromBase64(s: string) { const bin = atob(s); const arr = new Uint8Array(bin.length); for (let i=0;i<bin.length;i++) arr[i]=bin.charCodeAt(i); return arr.buffer; }

export async function generateKeySalt() {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return toBase64(salt.buffer);
}

export async function deriveKey(password: string, saltBase64: string) {
  const salt = fromBase64(saltBase64);
  const pwUtf8 = new TextEncoder().encode(password);
  const baseKey = await crypto.subtle.importKey('raw', pwUtf8, 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 200000, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt','decrypt']
  );
  return key;
}

export async function encryptObject(obj: any, key: CryptoKey) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = new TextEncoder().encode(JSON.stringify(obj));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);
  return { ciphertext: toBase64(ct), iv: toBase64(iv.buffer) };
}

export async function decryptToObject(ciphertextBase64: string, ivBase64: string, key: CryptoKey) {
  const ct = fromBase64(ciphertextBase64);
  const iv = fromBase64(ivBase64);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: new Uint8Array(iv) }, key, ct);
  const text = new TextDecoder().decode(plain);
  return JSON.parse(text);
}

export async function deriveKeyBase64(password: string, saltBase64: string) {
  const key = await deriveKey(password, saltBase64);
  // derive raw key to allow quick caching? we keep CryptoKey
  return key;
}
