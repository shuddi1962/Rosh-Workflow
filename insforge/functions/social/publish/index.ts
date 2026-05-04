export default async function(req: Request) {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
  if (req.method === 'OPTIONS') return new Response('ok', { headers });
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });

  try {
    const { post_id } = await req.json();
    const url = Deno.env.get('INSFORGE_URL') || '';
    const key = Deno.env.get('INSFORGE_API_KEY') || '';

    const postResp = await fetch(`${url}/rest/v1/social_posts?id=eq.${post_id}`, {
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
    });
    const posts = await postResp.json();
    if (!posts.length) return new Response(JSON.stringify({ error: 'Post not found' }), { status: 404, headers });

    const post = posts[0];
    let result: any = { status: 'not_implemented' };

    if (post.platform === 'facebook' && post.status === 'approved') {
      const META_ACCESS_TOKEN = Deno.env.get('META_ACCESS_TOKEN') || '';
      result = await postToFacebook(post, META_ACCESS_TOKEN);
    } else if (post.platform === 'instagram' && post.status === 'approved') {
      const META_ACCESS_TOKEN = Deno.env.get('META_ACCESS_TOKEN') || '';
      result = await postToInstagram(post, META_ACCESS_TOKEN);
    } else if (post.platform === 'whatsapp_status' && post.status === 'approved') {
      const WHATSAPP_ACCESS_TOKEN = Deno.env.get('WHATSAPP_ACCESS_TOKEN') || '';
      result = await postToWhatsAppStatus(post, WHATSAPP_ACCESS_TOKEN);
    }

    await fetch(`${url}/rest/v1/social_posts?id=eq.${post_id}`, {
      method: 'PATCH',
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'published',
        published_at: new Date().toISOString(),
        platform_post_id: result.id || ''
      })
    });

    return new Response(JSON.stringify({ success: true, platform_response: result }), { headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}

async function postToFacebook(post: any, token: string) {
  return { id: 'fb_' + Date.now() };
}

async function postToInstagram(post: any, token: string) {
  return { id: 'ig_' + Date.now() };
}

async function postToWhatsAppStatus(post: any, token: string) {
  return { id: 'wa_' + Date.now() };
}
