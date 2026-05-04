export default async function(req: Request) {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
  if (req.method === 'OPTIONS') return new Response('ok', { headers });
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });

  try {
    const { division, product_id, trend_id, post_type, platform } = await req.json();
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') || '';

    const prompt = `Generate social media content for Roshanal Infotech Limited.
Division: ${division}
Product ID: ${product_id}
Trend ID: ${trend_id}
Post Type: ${post_type}
Platform: ${platform}

Company: Roshanal Infotech Limited, Port Harcourt, Nigeria
Contact: 08109522432 | 08033170802 | 08180388018
Email: info@roshanalinfotech.com

Generate engaging content with emojis for social media. Include call to action.`;

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await resp.json();
    const generatedContent = data.content?.[0]?.text || 'Content generation failed';

    const url = Deno.env.get('INSFORGE_URL') || '';
    const key = Deno.env.get('INSFORGE_API_KEY') || '';

    const saveResp = await fetch(`${url}/rest/v1/social_posts`, {
      method: 'POST',
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
      body: JSON.stringify({
        division,
        product_id,
        trend_id,
        post_type,
        platform,
        caption: generatedContent,
        status: 'draft',
        auto_generated: true,
        created_at: new Date().toISOString()
      })
    });

    return new Response(JSON.stringify({ success: true, content: generatedContent, post: await saveResp.json() }), { headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}
