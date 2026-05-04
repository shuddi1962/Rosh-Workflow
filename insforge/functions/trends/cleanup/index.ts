export default async function(req: Request) {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
  if (req.method === 'OPTIONS') return new Response('ok', { headers });
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });

  try {
    const url = Deno.env.get('INSFORGE_URL') || '';
    const key = Deno.env.get('INSFORGE_API_KEY') || '';

    const now = new Date();
    const expiration = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    await fetch(`${url}/rest/v1/trends?expires_at=lte.${expiration}`, {
      method: 'DELETE',
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
    });

    const cleanupResp = await fetch(`${url}/rest/v1/social_posts?status=eq.expired&select=count`, {
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
    });

    return new Response(JSON.stringify({ success: true, cleaned: (await cleanupResp.json()).length }), { headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}
