export default async function(req: Request) {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
  if (req.method === 'OPTIONS') return new Response('ok', { headers });
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });

  try {
    const { service, api_key } = await req.json();
    const url = Deno.env.get('INSFORGE_URL') || '';
    const key = Deno.env.get('INSFORGE_API_KEY') || '';

    const resp = await fetch(`${url}/rest/v1/api_keys?service=eq.${service}`, {
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
    });
    const keys = await resp.json();

    if (!keys.length) return new Response(JSON.stringify({ valid: false, error: 'Service not found' }), { headers });

    const storedKey = keys[0];

    let isValid = false;
    let decryptedValue = '';

    try {
      decryptedValue = await decrypt(storedKey.encrypted_value);
      isValid = decryptedValue === api_key;
    } catch {
      isValid = false;
    }

    await fetch(`${url}/rest/v1/api_keys?id=eq.${storedKey.id}`, {
      method: 'PATCH',
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usage_today: storedKey.usage_today + 1,
        last_tested: new Date().toISOString(),
        last_test_result: isValid ? 'success' : 'failed'
      })
    });

    return new Response(JSON.stringify({ valid: isValid }), { headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}

async function decrypt(encrypted: string): Promise<string> {
  const ENCRYPTION_SECRET = Deno.env.get('ENCRYPTION_SECRET') || '';
  const [ivStr, dataStr] = encrypted.split(':');
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(ENCRYPTION_SECRET.padEnd(32, '0').slice(0, 32)),
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );
  const iv = Uint8Array.from(atob(ivStr), c => c.charCodeAt(0));
  const data = Uint8Array.from(atob(dataStr), c => c.charCodeAt(0));
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
  return new TextDecoder().decode(decrypted);
}
