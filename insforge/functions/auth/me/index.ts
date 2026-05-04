export default async function(req: Request) {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
  if (req.method === 'OPTIONS') return new Response('ok', { headers });
  if (req.method !== 'GET') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers });

    const token = authHeader.replace('Bearer ', '');
    const payload = await verifyJWT(token);

    const url = Deno.env.get('INSFORGE_URL') || '';
    const key = Deno.env.get('INSFORGE_API_KEY') || '';

    const resp = await fetch(`${url}/rest/v1/users?id=eq.${payload.userId}`, {
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
    });

    const users = await resp.json();
    if (!users.length) return new Response(JSON.stringify({ error: 'User not found' }), { status: 404, headers });

    const user = users[0];
    return new Response(JSON.stringify({ id: user.id, email: user.email, full_name: user.full_name, role: user.role }), { headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers });
  }
}

async function verifyJWT(token: string): Promise<any> {
  const [encodedHeader, encodedPayload, signature] = token.split('.');
  const secret = Deno.env.get('JWT_SECRET') || '';
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
  const valid = await crypto.subtle.verify('HMAC', key, Uint8Array.from(atob(signature), c => c.charCodeAt(0)), encoder.encode(`${encodedHeader}.${encodedPayload}`));
  if (!valid) throw new Error('Invalid token');
  return JSON.parse(atob(encodedPayload));
}
