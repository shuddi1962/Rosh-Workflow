export default async function(req: Request) {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
  if (req.method === 'OPTIONS') return new Response('ok', { headers });
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });

  try {
    const { email, password } = await req.json();
    const url = Deno.env.get('INSFORGE_URL') || '';
    const key = Deno.env.get('INSFORGE_API_KEY') || '';

    const resp = await fetch(`${url}/rest/v1/users?email=eq.${encodeURIComponent(email)}`, {
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
    });

    const users = await resp.json();
    if (!users.length) return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401, headers });

    const user = users[0];
    const passwordMatch = await verifyPassword(password, user.password_hash);
    if (!passwordMatch) return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401, headers });

    const token = await generateJWT({ userId: user.id, email: user.email, role: user.role });

    await fetch(`${url}/rest/v1/users?id=eq.${user.id}`, {
      method: 'PATCH',
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ last_login: new Date().toISOString() })
    });

    return new Response(JSON.stringify({ token, user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role } }), { headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashedPassword = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  return hashedPassword === hash;
}

async function generateJWT(payload: any): Promise<string> {
  const secret = Deno.env.get('JWT_SECRET') || '';
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify({ ...payload, exp: Date.now() + 15 * 60 * 1000 }));
  const signature = await sign(`${encodedHeader}.${encodedPayload}`, secret);
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

async function sign(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}
