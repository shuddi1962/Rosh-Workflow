export default async function(req: Request) {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
  if (req.method === 'OPTIONS') return new Response('ok', { headers });
  if (req.method !== 'GET') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });

  try {
    const url = Deno.env.get('INSFORGE_URL') || '';
    const key = Deno.env.get('INSFORGE_API_KEY') || '';

    const resp = await fetch(`${url}/rest/v1/trends?status=eq.active&order=momentum_score.desc&limit=20`, {
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
    });

    return new Response(JSON.stringify(await resp.json()), { headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}
