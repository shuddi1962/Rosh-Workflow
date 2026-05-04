export default async function(req: Request) {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
  if (req.method === 'OPTIONS') return new Response('ok', { headers });

  const url = Deno.env.get('INSFORGE_URL') || '';
  const key = Deno.env.get('INSFORGE_API_KEY') || '';

  try {
    if (req.method === 'GET') {
      const resp = await fetch(`${url}/rest/v1/social_accounts`, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
      });
      return new Response(JSON.stringify(await resp.json()), { headers });
    }

    if (req.method === 'POST') {
      const data = await req.json();
      const resp = await fetch(`${url}/rest/v1/social_accounts`, {
        method: 'POST',
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
        body: JSON.stringify({ ...data, is_connected: true, created_at: new Date().toISOString() })
      });
      return new Response(JSON.stringify(await resp.json()), { headers });
    }

    if (req.method === 'PUT') {
      const { id, ...update } = await req.json();
      const resp = await fetch(`${url}/rest/v1/social_accounts?id=eq.${id}`, {
        method: 'PATCH',
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(update)
      });
      return new Response(JSON.stringify(await resp.json()), { headers });
    }

    if (req.method === 'DELETE') {
      const { id } = await req.json();
      await fetch(`${url}/rest/v1/social_accounts?id=eq.${id}`, {
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
