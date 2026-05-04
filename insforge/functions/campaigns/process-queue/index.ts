export default async function(req: Request) {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
  if (req.method === 'OPTIONS') return new Response('ok', { headers });
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });

  try {
    const url = Deno.env.get('INSFORGE_URL') || '';
    const key = Deno.env.get('INSFORGE_API_KEY') || '';

    const resp = await fetch(`${url}/rest/v1/campaigns?status=eq.scheduled&scheduled_at=lte.${new Date().toISOString()}`, {
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
    });
    const campaigns = await resp.json();

    let processed = 0;
    for (const campaign of campaigns) {
      await fetch(`${url}/rest/v1/campaigns?id=eq.${campaign.id}`, {
        method: 'PATCH',
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ready_to_send' })
      });
      processed++;
    }

    return new Response(JSON.stringify({ success: true, processed }), { headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}
