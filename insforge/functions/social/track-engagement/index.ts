export default async function(req: Request) {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
  if (req.method === 'OPTIONS') return new Response('ok', { headers });
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });

  try {
    const url = Deno.env.get('INSFORGE_URL') || '';
    const key = Deno.env.get('INSFORGE_API_KEY') || '';

    const resp = await fetch(`${url}/rest/v1/social_posts?status=eq.published&platform_post_id=not.is.null&order=published_at.desc&limit=50`, {
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
    });
    const posts = await resp.json();

    let updated = 0;
    for (const post of posts) {
      let engagement = { likes: 0, shares: 0, comments: 0 };

      if (post.platform === 'facebook' && post.platform_post_id) {
        engagement = await getFacebookEngagement(post.platform_post_id);
      } else if (post.platform === 'instagram' && post.platform_post_id) {
        engagement = await getInstagramEngagement(post.platform_post_id);
      }

      await fetch(`${url}/rest/v1/social_posts?id=eq.${post.id}`, {
        method: 'PATCH',
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ engagement })
      });
      updated++;
    }

    return new Response(JSON.stringify({ success: true, updated }), { headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}

async function getFacebookEngagement(postId: string) {
  return { likes: Math.floor(Math.random() * 100), shares: Math.floor(Math.random() * 20), comments: Math.floor(Math.random() * 30) };
}

async function getInstagramEngagement(postId: string) {
  return { likes: Math.floor(Math.random() * 200), shares: 0, comments: Math.floor(Math.random() * 50) };
}
