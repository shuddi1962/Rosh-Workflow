export default async function(req: Request) {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
  if (req.method === 'OPTIONS') return new Response('ok', { headers });
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });

  try {
    const { id } = await req.json();
    const url = Deno.env.get('INSFORGE_URL') || '';
    const key = Deno.env.get('INSFORGE_API_KEY') || '';

    const resp = await fetch(`${url}/rest/v1/api_keys?id=eq.${id}`, {
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
    });
    const keys = await resp.json();
    if (!keys.length) return new Response(JSON.stringify({ error: 'Key not found' }), { status: 404, headers });

    const apiKey = keys[0];

    let testResult = 'failed';
    try {
      if (apiKey.service === 'anthropic') {
        const decrypted = await decrypt(apiKey.encrypted_value);
        const testResp = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'x-api-key': decrypted, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: 'claude-3-haiku-20240307', max_tokens: 10, messages: [{ role: 'user', content: 'test' }] })
        });
        testResult = testResp.ok ? 'success' : 'failed';
      } else if (apiKey.service === 'sendgrid') {
        const decrypted = await decrypt(apiKey.encrypted_value);
        const testResp = await fetch('https://api.sendgrid.com/v3/user/profile', {
          headers: { 'Authorization': `Bearer ${decrypted}` }
        });
        testResult = testResp.ok ? 'success' : 'failed';
      }
    } catch {
      testResult = 'failed';
    }

    await fetch(`${url}/rest/v1/api_keys?id=eq.${id}`, {
      method: 'PATCH',
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ last_tested: new Date().toISOString(), last_test_result: testResult })
    });

    return new Response(JSON.stringify({ success: true, result: testResult }), { headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}

async function decrypt(encrypted: string): Promise<string> {
  const ENCRYPTION_SECRET = Deno.env.get('ENCRYPTION_SECRET') || '';
  const [ivStr, dataStr] = encrypted.split(':');
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(ENCRYPTION_SECRET.padEnd(32, '0').slice(0, 32)), { name: 'AES-GCM' }, false, ['decrypt']);
  const iv = Uint8Array.from(atob(ivStr), c => c.charCodeAt(0));
  const data = Uint8Array.from(atob(dataStr), c => c.charCodeAt(0));
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
  return new TextDecoder().decode(decrypted);
}
