export default async function(req: Request) {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
  if (req.method === 'OPTIONS') return new Response('ok', { headers });
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });

  try {
    const { campaign_id } = await req.json();
    const url = Deno.env.get('INSFORGE_URL') || '';
    const key = Deno.env.get('INSFORGE_API_KEY') || '';

    const campResp = await fetch(`${url}/rest/v1/campaigns?id=eq.${campaign_id}`, {
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
    });
    const campaigns = await campResp.json();
    if (!campaigns.length) return new Response(JSON.stringify({ error: 'Campaign not found' }), { status: 404, headers });

    const campaign = campaigns[0];

    const leadsResp = await fetch(`${url}/rest/v1/leads?id=in.(${campaign.target_leads.join(',')})`, {
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
    });
    const leads = await leadsResp.json();

    let sent = 0;
    for (const lead of leads) {
      if (campaign.type === 'whatsapp') {
        await sendWhatsAppMessage(lead, campaign.message_template);
      } else if (campaign.type === 'email') {
        await sendEmail(lead, campaign.subject, campaign.message_template);
      } else if (campaign.type === 'sms') {
        await sendSMS(lead, campaign.message_template);
      }
      sent++;
    }

    await fetch(`${url}/rest/v1/campaigns?id=eq.${campaign_id}`, {
      method: 'PATCH',
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'sent',
        sent_at: new Date().toISOString(),
        stats: { sent, total: leads.length }
      })
    });

    return new Response(JSON.stringify({ success: true, sent, total: leads.length }), { headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}

async function sendWhatsAppMessage(lead: any, message: string) {
  const WHATSAPP_ACCESS_TOKEN = Deno.env.get('WHATSAPP_ACCESS_TOKEN') || '';
  const WHATSAPP_PHONE_NUMBER_ID = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID') || '';

  await fetch(`https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: lead.phone,
      text: { body: message }
    })
  });
}

async function sendEmail(lead: any, subject: string, body: string) {
  const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY') || '';

  await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: lead.email, name: lead.name }] }],
      from: { email: 'info@roshanalinfotech.com', name: 'Roshanal Infotech' },
      subject,
      content: [{ type: 'text/html', value: body }]
    })
  });
}

async function sendSMS(lead: any, message: string) {
  const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID') || '';
  const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN') || '';
  const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER') || '';

  await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      From: TWILIO_PHONE_NUMBER,
      To: lead.phone,
      Body: message
    })
  });
}
