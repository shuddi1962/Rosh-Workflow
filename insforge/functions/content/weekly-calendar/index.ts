export default async function(req: Request) {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
  if (req.method === 'OPTIONS') return new Response('ok', { headers });
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });

  try {
    const url = Deno.env.get('INSFORGE_URL') || '';
    const key = Deno.env.get('INSFORGE_API_KEY') || '';
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') || '';

    const calendarPrompt = `Generate a weekly content calendar for Roshanal Infotech Limited.
Marine Division: Outboard engines, fiberglass boats, marine safety equipment
Tech Division: CCTV, solar systems, smart locks, car trackers

Create 14 posts (2 per day for 7 days) with:
- day (1-7)
- division (marine/tech)
- post_type
- platform
- caption (with emojis and contact info: 08109522432, 08033170802, 08180388018)
- hashtags (array)
- scheduled_time (morning/afternoon/evening)

Return JSON array.`;

    const aiResp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 2000,
        messages: [{ role: 'user', content: calendarPrompt }]
      })
    });

    const aiData = await aiResp.json();
    const calendar = JSON.parse(aiData.content?.[0]?.text || '[]');

    let scheduled = 0;
    for (const post of calendar) {
      const scheduledAt = new Date();
      scheduledAt.setDate(scheduledAt.getDate() + post.day);
      if (post.scheduled_time === 'morning') scheduledAt.setHours(8, 0, 0, 0);
      else if (post.scheduled_time === 'afternoon') scheduledAt.setHours(13, 0, 0, 0);
      else scheduledAt.setHours(19, 0, 0, 0);

      await fetch(`${url}/rest/v1/social_posts`, {
        method: 'POST',
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          division: post.division,
          post_type: post.post_type,
          platform: post.platform,
          caption: post.caption,
          hashtags: post.hashtags,
          status: 'scheduled',
          scheduled_at: scheduledAt.toISOString(),
          auto_generated: true,
          created_at: new Date().toISOString()
        })
      });
      scheduled++;
    }

    return new Response(JSON.stringify({ success: true, scheduled }), { headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}
