export default async function(req: Request) {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
  if (req.method === 'OPTIONS') return new Response('ok', { headers });

  const url = Deno.env.get('INSFORGE_URL') || '';
  const key = Deno.env.get('INSFORGE_API_KEY') || '';

  try {
    if (req.method === 'GET') {
      const { searchParams } = new URL(req.url);
      const lead_id = searchParams.get('lead_id');
      const query = lead_id ? `?lead_id=eq.${lead_id}` : '';
      const resp = await fetch(`${url}/rest/v1/crm_activities${query}&order=created_at.desc`, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
      });
      return new Response(JSON.stringify(await resp.json()), { headers });
    }

    if (req.method === 'POST') {
      const data = await req.json();
      const resp = await fetch(`${url}/rest/v1/crm_activities`, {
        method: 'POST',
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
        body: JSON.stringify({ ...data, created_at: new Date().toISOString() })
      });
      return new Response(JSON.stringify(await resp.json()), { headers });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}
