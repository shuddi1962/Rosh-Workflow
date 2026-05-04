export default async function(req: Request) {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
  if (req.method === 'OPTIONS') return new Response('ok', { headers });
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });

  try {
    const { source, query } = await req.json();
    const APIFY_API_KEY = Deno.env.get('APIFY_API_KEY') || '';
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') || '';
    const url = Deno.env.get('INSFORGE_URL') || '';
    const key = Deno.env.get('INSFORGE_API_KEY') || '';

    let scrapedLeads: any[] = [];

    if (source === 'google_maps') {
      const resp = await fetch(`https://api.apify.com/v2/actor-tasks/google-maps-scraper/run-sync-get-dataset-items?token=${APIFY_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchString: query, location: 'Port Harcourt, Nigeria', maxCrawledPlaces: 50 })
      });
      const data = await resp.json();
      scrapedLeads = data.map((item: any) => ({
        name: item.title || item.name,
        phone: item.phone || '',
        email: item.email || '',
        company: item.title,
        location: item.city || 'Port Harcourt',
        division_interest: 'both',
        source: 'scraping',
        status: 'new',
        score: 0,
        tier: 'cold'
      }));
    }

    for (const lead of scrapedLeads) {
      await fetch(`${url}/rest/v1/leads`, {
        method: 'POST',
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...lead, created_at: new Date().toISOString() })
      });
    }

    return new Response(JSON.stringify({ success: true, count: scrapedLeads.length }), { headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}
