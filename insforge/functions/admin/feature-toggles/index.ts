export default async function(req: Request) {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
  if (req.method === 'OPTIONS') return new Response('ok', { headers });

  const url = Deno.env.get('INSFORGE_URL') || '';
  const key = Deno.env.get('INSFORGE_API_KEY') || '';

  try {
    if (req.method === 'GET') {
      const resp = await fetch(`${url}/rest/v1/feature_toggles`, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
      });
      return new Response(JSON.stringify(await resp.json()), { headers });
    }

    if (req.method === 'PUT') {
      const { key: featureKey, ...update } = await req.json();
      const resp = await fetch(`${url}/rest/v1/feature_toggles?feature_key=eq.${featureKey}`, {
        method: 'PATCH',
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...update, updated_at: new Date().toISOString() })
      });
      return new Response(JSON.stringify(await resp.json()), { headers });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}
