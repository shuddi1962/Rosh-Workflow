export default async function(req: Request) {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
  if (req.method === 'OPTIONS') return new Response('ok', { headers });
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });

  try {
    const { service, key_name, encrypted_value } = await req.json();
    const url = Deno.env.get('INSFORGE_URL') || '';
    const masterKey = Deno.env.get('INSFORGE_API_KEY') || '';

    const resp = await fetch(`${url}/rest/v1/api_keys?service=eq.${service}&key_name=eq.${key_name}`, {
      headers: { 'apikey': masterKey, 'Authorization': `Bearer ${masterKey}` }
    });
    const existing = await resp.json();

    if (existing.length > 0) {
      await fetch(`${url}/rest/v1/api_keys?id=eq.${existing[0].id}`, {
        method: 'PATCH',
        headers: { 'apikey': masterKey, 'Authorization': `Bearer ${masterKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          encrypted_value,
          last_tested: new Date().toISOString(),
          last_test_result: 'pending',
          updated_at: new Date().toISOString()
        })
      });
    } else {
      await fetch(`${url}/rest/v1/api_keys`, {
        method: 'POST',
        headers: { 'apikey': masterKey, 'Authorization': `Bearer ${masterKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service,
          key_name,
          encrypted_value,
          is_active: true,
          usage_today: 0,
          last_tested: new Date().toISOString(),
          last_test_result: 'pending',
          updated_at: new Date().toISOString()
        })
      });
    }

    return new Response(JSON.stringify({ success: true }), { headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}
