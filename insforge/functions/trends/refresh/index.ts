export default async function(req: Request) {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
  if (req.method === 'OPTIONS') return new Response('ok', { headers });
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });

  try {
    const { GOOGLE_TRENDS_API_KEY, NEWS_API_KEY } = Deno.env.get('API_KEYS') ? JSON.parse(Deno.env.get('API_KEYS')!) : {};

    const trends = await Promise.all([
      fetchGoogleTrends(GOOGLE_TRENDS_API_KEY),
      fetchNewsAPI(NEWS_API_KEY)
    ]);

    const url = Deno.env.get('INSFORGE_URL') || '';
    const key = Deno.env.get('INSFORGE_API_KEY') || '';

    for (const trend of trends.flat()) {
      await fetch(`${url}/rest/v1/trends`, {
        method: 'POST',
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(trend)
      });
    }

    return new Response(JSON.stringify({ success: true, count: trends.flat().length }), { headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}

async function fetchGoogleTrends(apiKey: string) {
  // Google Trends integration
  return [];
}

async function fetchNewsAPI(apiKey: string) {
  const resp = await fetch(`https://newsapi.org/v2/everything?q=marine+technology+Nigeria&language=en&sortBy=publishedAt&apiKey=${apiKey}`);
  const data = await resp.json();
  return (data.articles || []).map((a: any) => ({
    keyword: a.title,
    topic: a.title,
    description: a.description,
    source: 'news_api',
    source_url: a.url,
    momentum_score: 50,
    division_relevance: 'both',
    is_breaking: false,
    discovered_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    status: 'active'
  }));
}
