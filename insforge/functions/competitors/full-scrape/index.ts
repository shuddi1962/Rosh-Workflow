export default async function(req: Request) {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
  if (req.method === 'OPTIONS') return new Response('ok', { headers });
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });

  try {
    const url = Deno.env.get('INSFORGE_URL') || '';
    const key = Deno.env.get('INSFORGE_API_KEY') || '';
    const APIFY_API_KEY = Deno.env.get('APIFY_API_KEY') || '';

    const competitorsResp = await fetch(`${url}/rest/v1/competitors?limit=10`, {
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
    });
    const competitors = await competitorsResp.json();

    let scraped = 0;
    for (const comp of competitors) {
      try {
        if (comp.facebook_url) {
          await fetch(`${url}/functions/competitors-scrape`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ competitor_id: comp.id })
          });
          scraped++;
        }
      } catch (e) {
        console.error(`Failed to scrape ${comp.name}:`, e);
      }
    }

    return new Response(JSON.stringify({ success: true, scraped }), { headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}
