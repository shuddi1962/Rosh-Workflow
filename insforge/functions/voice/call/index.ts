export default async function(req: Request) {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
  if (req.method === 'OPTIONS') return new Response('ok', { headers });
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });

  try {
    const { lead_id, agent_id } = await req.json();
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY') || '';
    const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID') || '';
    const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN') || '';
    const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER') || '';

    const url = Deno.env.get('INSFORGE_URL') || '';
    const key = Deno.env.get('INSFORGE_API_KEY') || '';

    const leadResp = await fetch(`${url}/rest/v1/leads?id=eq.${lead_id}`, {
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
    });
    const leads = await leadResp.json();
    if (!leads.length) return new Response(JSON.stringify({ error: 'Lead not found' }), { status: 404, headers });

    const agentResp = await fetch(`${url}/rest/v1/voice_agents?id=eq.${agent_id}`, {
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
    });
    const agents = await agentResp.json();
    if (!agents.length) return new Response(JSON.stringify({ error: 'Agent not found' }), { status: 404, headers });

    const lead = leads[0];
    const agent = agents[0];

    const callResp = await fetch(`https://api.elevenlabs.io/v1/convai/twilio/outbound`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        agent_id: agent.elevenlabs_agent_id,
        to: lead.phone,
        from: TWILIO_PHONE_NUMBER
      })
    });

    const callData = await callResp.json();

    await fetch(`${url}/rest/v1/call_logs`, {
      method: 'POST',
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lead_id,
        agent_id,
        call_sid: callData.call_sid,
        type: 'outbound',
        from_number: TWILIO_PHONE_NUMBER,
        to_number: lead.phone,
        status: 'initiated',
        started_at: new Date().toISOString()
      })
    });

    return new Response(JSON.stringify({ success: true, call_sid: callData.call_sid }), { headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}
