export default async function(req: Request) {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
  if (req.method === 'OPTIONS') return new Response('ok', { headers });

  const url = Deno.env.get('INSFORGE_URL') || '';
  const key = Deno.env.get('INSFORGE_API_KEY') || '';

  try {
    if (req.method === 'GET') {
      const resp = await fetch(`${url}/rest/v1/api_keys`, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
      });
      const keys = await resp.json();
      const sanitized = keys.map((k: any) => ({ ...k, encrypted_value: '***' }));
      return new Response(JSON.stringify(sanitized), { headers });
    }

    if (req.method === 'POST') {
      const { service, key_name, value } = await req.json();
      const encrypted = await encrypt(value);

      const resp = await fetch(`${url}/rest/v1/api_keys`, {
        method: 'POST',
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
        body: JSON.stringify({
          service,
          key_name,
          encrypted_value: encrypted,
          is_active: true,
          updated_at: new Date().toISOString()
        })
      });
      return new Response(JSON.stringify(await resp.json()), { headers });
    }

    if (req.method === 'PUT') {
      const { id, ...update } = await req.json();
      if (update.value) {
        update.encrypted_value = await encrypt(update.value);
        delete update.value;
      }
      update.updated_at = new Date().toISOString();

      const resp = await fetch(`${url}/rest/v1/api_keys?id=eq.${id}`, {
        method: 'PATCH',
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(update)
      });
      return new Response(JSON.stringify(await resp.json()), { headers });
    }

    if (req.method === 'DELETE') {
      const { id } = await req.json();
      await fetch(`${url}/rest/v1/api_keys?id=eq.${id}`, {
        method: 'DELETE',
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
      });
      return new Response(JSON.stringify({ success: true }), { headers });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}

async function encrypt(text: string): Promise<string> {
  const ENCRYPTION_SECRET = Deno.env.get('ENCRYPTION_SECRET') || '';
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(ENCRYPTION_SECRET.padEnd(32, '0').slice(0, 32)), { name: 'AES-GCM' }, false, ['encrypt']);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(text));
  return btoa(String.fromCharCode(...iv) + ':' + String.fromCharCode(...new Uint8Array(encrypted)));
}
