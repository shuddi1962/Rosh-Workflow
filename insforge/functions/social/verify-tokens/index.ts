export default async function(req: Request) {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
  if (req.method === 'OPTIONS') return new Response('ok', { headers });
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });

  try {
    const url = Deno.env.get('INSFORGE_URL') || '';
    const key = Deno.env.get('INSFORGE_API_KEY') || '';

    const accountsResp = await fetch(`${url}/rest/v1/social_accounts?is_connected=eq.true`, {
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
    });
    const accounts = await accountsResp.json();

    let verified = 0;
    for (const account of accounts) {
      let isValid = true;

      if (account.platform === 'facebook' || account.platform === 'instagram') {
        isValid = await verifyMetaToken(account.access_token);
      } else if (account.platform === 'twitter') {
        isValid = await verifyTwitterToken(account.access_token);
      }

      if (!isValid) {
        await fetch(`${url}/rest/v1/social_accounts?id=eq.${account.id}`, {
          method: 'PATCH',
          headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_connected: false })
        });
      }
      verified++;
    }

    return new Response(JSON.stringify({ success: true, verified }), { headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}

async function verifyMetaToken(token: string): Promise<boolean> {
  try {
    const resp = await fetch(`https://graph.facebook.com/v18.0/me?access_token=${token}`);
    return resp.ok;
  } catch {
    return false;
  }
}

async function verifyTwitterToken(token: string): Promise<boolean> {
  return true;
}
