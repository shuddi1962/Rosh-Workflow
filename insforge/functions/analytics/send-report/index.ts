export default async function(req: Request) {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
  if (req.method === 'OPTIONS') return new Response('ok', { headers });
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });

  try {
    const url = Deno.env.get('INSFORGE_URL') || '';
    const key = Deno.env.get('INSFORGE_API_KEY') || '';
    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY') || '';

    const [postsResp, leadsResp, campaignsResp] = await Promise.all([
      fetch(`${url}/rest/v1/social_posts?created_at=gte.${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()}&select=count`, { headers: { 'apikey': key } }),
      fetch(`${url}/rest/v1/leads?created_at=gte.${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()}&select=count`, { headers: { 'apikey': key } }),
      fetch(`${url}/rest/v1/campaigns?created_at=gte.${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()}&select=count`, { headers: { 'apikey': key } })
    ]);

    const posts = (await postsResp.json()).length;
    const leads = (await leadsResp.json()).length;
    const campaigns = (await campaignsResp.json()).length;

    const report = `
Weekly Analytics Report - Roshanal Infotech
Week of ${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}

Posts Published: ${posts}
New Leads: ${leads}
Campaigns Sent: ${campaigns}

Contact: 08109522432 | 08033170802 | 08180388018
Email: info@roshanalinfotech.com
    `.trim();

    await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: 'info@roshanalinfotech.com' }] }],
        from: { email: 'info@roshanalinfotech.com', name: 'Roshanal AI' },
        subject: 'Weekly Analytics Report',
        content: [{ type: 'text/plain', value: report }]
      })
    });

    return new Response(JSON.stringify({ success: true }), { headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}
