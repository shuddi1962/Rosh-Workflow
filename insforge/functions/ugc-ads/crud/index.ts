export default async function(req: Request) {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
  if (req.method === 'OPTIONS') return new Response('ok', { headers });

  const url = Deno.env.get('INSFORGE_URL') || '';
  const key = Deno.env.get('INSFORGE_API_KEY') || '';

  try {
    if (req.method === 'GET') {
      const resp = await fetch(`${url}/rest/v1/ugc_ads?order=created_at.desc`, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
      });
      return new Response(JSON.stringify(await resp.json()), { headers });
    }

    if (req.method === 'POST') {
      const data = await req.json();
      const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') || '';

      const prompt = `Generate a UGC ad for Roshanal Infotech Limited:
Ad Type: ${data.ad_type}
Division: ${data.division}
Product: ${data.product_id}

Create compelling ad copy with headline, primary text, and CTA. Return JSON with: headline, primary_text, description, cta_button`;

      const aiResp = await fetch('https://api.anthropic.com/v1/messages', {
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

      const aiData = await aiResp.json();
      const adContent = JSON.parse(aiData.content?.[0]?.text || '{}');

      const resp = await fetch(`${url}/rest/v1/ugc_ads`, {
        method: 'POST',
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
        body: JSON.stringify({
          ...data,
          ...adContent,
          status: 'draft',
          created_at: new Date().toISOString()
        })
      });
      return new Response(JSON.stringify(await resp.json()), { headers });
    }

    if (req.method === 'PUT') {
      const { id, ...update } = await req.json();
      const resp = await fetch(`${url}/rest/v1/ugc_ads?id=eq.${id}`, {
        method: 'PATCH',
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(update)
      });
      return new Response(JSON.stringify(await resp.json()), { headers });
    }

    if (req.method === 'DELETE') {
      const { id } = await req.json();
      await fetch(`${url}/rest/v1/ugc_ads?id=eq.${id}`, {
        method: 'DELETE',
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
      });
      return new Response(JSON.stringify({ success: true }), { headers });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}
