export default async function(req: Request) {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
  if (req.method === 'OPTIONS') return new Response('ok', { headers });

  const url = Deno.env.get('INSFORGE_URL') || '';
  const key = Deno.env.get('INSFORGE_API_KEY') || '';

  try {
    if (req.method === 'GET') {
      const { searchParams } = new URL(req.url);
      const path = searchParams.get('path') || 'overview';

      if (path === 'overview') {
        const [posts, leads, campaigns] = await Promise.all([
          fetch(`${url}/rest/v1/social_posts?select=count`, { headers: { 'apikey': key } }),
          fetch(`${url}/rest/v1/leads?select=count`, { headers: { 'apikey': key } }),
          fetch(`${url}/rest/v1/campaigns?select=count`, { headers: { 'apikey': key } })
        ]);

        return new Response(JSON.stringify({
          posts: (await posts.json()).length,
          leads: (await leads.json()).length,
          campaigns: (await campaigns.json()).length
        }), { headers });
      }

      return new Response(JSON.stringify({}), { headers });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}
