export default async function(req: Request) {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
  if (req.method === 'OPTIONS') return new Response('ok', { headers });

  const url = Deno.env.get('INSFORGE_URL') || '';
  const key = Deno.env.get('INSFORGE_API_KEY') || '';

  try {
    if (req.method === 'GET') {
      const { searchParams } = new URL(req.url);
      const division = searchParams.get('division');
      const query = division ? `?division=eq.${division}` : '';
      const resp = await fetch(`${url}/rest/v1/generated_banners${query}&order=created_at.desc`, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
      });
      return new Response(JSON.stringify(await resp.json()), { headers });
    }

    if (req.method === 'POST') {
      const data = await req.json();
      const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || '';

      const prompt = `Generate a banner image for Roshanal Infotech:
Type: ${data.banner_type}
Style: ${data.style}
Division: ${data.division}
Prompt: ${data.prompt}`;

      const aiResp = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: prompt,
          n: 1,
          size: data.size || '1024x1024'
        })
      });

      const aiData = await aiResp.json();
      const imageUrl = aiData.data?.[0]?.url || '';

      const resp = await fetch(`${url}/rest/v1/generated_banners`, {
        method: 'POST',
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
        body: JSON.stringify({
          ...data,
          image_url: imageUrl,
          model: 'dall-e-3',
          created_at: new Date().toISOString()
        })
      });
      return new Response(JSON.stringify(await resp.json()), { headers });
    }

    if (req.method === 'DELETE') {
      const { id } = await req.json();
      await fetch(`${url}/rest/v1/generated_banners?id=eq.${id}`, {
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
