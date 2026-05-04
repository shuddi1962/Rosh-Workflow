export default async function(req: Request) {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
  if (req.method === 'OPTIONS') return new Response('ok', { headers });
  
  try {
    const url = Deno.env.get('INSFORGE_URL') || '';
    const key = Deno.env.get('INSFORGE_API_KEY') || '';
    
    const resp = await fetch(`${url}/rest/v1/ugc_ads`, {
      method: 'POST',
      headers: { 'apikey': key, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
      body: JSON.stringify({ status: 'draft', created_at: new Date().toISOString() }),
    });

    if (!resp.ok) throw new Error('Save failed');
    return new Response(JSON.stringify({ success: true }), { headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}
