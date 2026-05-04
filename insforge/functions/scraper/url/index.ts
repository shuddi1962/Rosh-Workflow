export default async function(req: Request) {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
  if (req.method === 'OPTIONS') return new Response('ok', { headers });
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });

  try {
    const { url: targetUrl } = await req.json();
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || '';

    const resp = await fetch(targetUrl);
    const html = await resp.text();

    const prompt = `Analyze this webpage and extract creative assets that could be transformed into UGC ads or video content:
URL: ${targetUrl}
Content: ${html.substring(0, 5000)}

Return JSON with: extracted_creatives (array), suggested_ad_angles (array), product_info (object)`;

    const aiResp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000
      })
    });

    const aiData = await aiResp.json();
    const scrapedData = JSON.parse(aiData.choices?.[0]?.message?.content || '{}');

    return new Response(JSON.stringify({ success: true, data: scrapedData }), { headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}
