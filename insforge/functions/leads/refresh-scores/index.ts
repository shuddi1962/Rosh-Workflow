export default async function(req: Request) {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
  if (req.method === 'OPTIONS') return new Response('ok', { headers });
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });

  try {
    const url = Deno.env.get('INSFORGE_URL') || '';
    const key = Deno.env.get('INSFORGE_API_KEY') || '';

    const leadsResp = await fetch(`${url}/rest/v1/leads?status=in.(new,contacted)&limit=50`, {
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
    });
    const leads = await leadsResp.json();

    let scored = 0;
    for (const lead of leads) {
      const score = Math.floor(Math.random() * 100);
      const tier = score >= 70 ? 'hot' : score >= 40 ? 'warm' : 'cold';

      await fetch(`${url}/rest/v1/leads?id=eq.${lead.id}`, {
        method: 'PATCH',
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ score, tier, last_contact: new Date().toISOString() })
      });
      scored++;
    }

    return new Response(JSON.stringify({ success: true, scored }), { headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}
