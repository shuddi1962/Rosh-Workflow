export default async function(req: Request) {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
  if (req.method === 'OPTIONS') return new Response('ok', { headers });
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });

  try {
    const { competitor_id } = await req.json();
    const APIFY_API_KEY = Deno.env.get('APIFY_API_KEY') || '';
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') || '';

    const url = Deno.env.get('INSFORGE_URL') || '';
    const key = Deno.env.get('INSFORGE_API_KEY') || '';

    const compResp = await fetch(`${url}/rest/v1/competitors?id=eq.${competitor_id}`, {
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
    });
    const competitors = await compResp.json();
    if (!competitors.length) return new Response(JSON.stringify({ error: 'Competitor not found' }), { status: 404, headers });

    const competitor = competitors[0];

    let scrapedData: any = {};

    if (competitor.facebook_url) {
      const fbResp = await fetch(`https://api.apify.com/v2/actor-tasks/facebook-posts-scraper/run-sync-get-dataset-items?token=${APIFY_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: [competitor.facebook_url] })
      });
      scrapedData.facebook = await fbResp.json();
    }

    const analysisPrompt = `Analyze this competitor data for Roshanal Infotech:
Competitor: ${competitor.name}
Scraped Data: ${JSON.stringify(scrapedData)}

Provide JSON analysis with:
- top_performing_posts
- posting_frequency
- content_gaps
- roshanal_weaknesses
- immediate_actions`;

    const aiResp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1000,
        messages: [{ role: 'user', content: analysisPrompt }]
      })
    });

    const aiData = await aiResp.json();
    const intelReport = JSON.parse(aiData.content?.[0]?.text || '{}');

    await fetch(`${url}/rest/v1/competitors?id=eq.${competitor_id}`, {
      method: 'PATCH',
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intel_report: intelReport,
        last_scanned: new Date().toISOString()
      })
    });

    return new Response(JSON.stringify({ success: true, intel: intelReport }), { headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}
