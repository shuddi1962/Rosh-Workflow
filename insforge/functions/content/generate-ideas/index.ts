export default async function(req: Request) {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
  if (req.method === 'OPTIONS') return new Response('ok', { headers });
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });

  try {
    const url = Deno.env.get('INSFORGE_URL') || '';
    const key = Deno.env.get('INSFORGE_API_KEY') || '';
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') || '';

    const trendsResp = await fetch(`${url}/rest/v1/trends?is_breaking=eq.true&status=eq.active&limit=10`, {
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
    });
    const trends = await trendsResp.json();

    let generated = 0;
    for (const trend of trends) {
      const prompt = `Generate content ideas for Roshanal Infotech based on this trend:
Trend: ${trend.keyword}
Topic: ${trend.topic}
Division Relevance: ${trend.division_relevance}

Generate 3 content ideas with post_type, platform, and caption. Return JSON array.`;

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
          messages: [{ role: 'user', content: prompt }]
        })
      });

      const aiData = await aiResp.json();
      const ideas = JSON.parse(aiData.content?.[0]?.text || '[]');

      for (const idea of ideas) {
        await fetch(`${url}/rest/v1/social_posts`, {
          method: 'POST',
          headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            division: trend.division_relevance,
            trend_id: trend.id,
            post_type: idea.post_type,
            platform: idea.platform,
            caption: idea.caption,
            status: 'draft',
            auto_generated: true,
            created_at: new Date().toISOString()
          })
        });
        generated++;
      }
    }

    return new Response(JSON.stringify({ success: true, generated }), { headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}
