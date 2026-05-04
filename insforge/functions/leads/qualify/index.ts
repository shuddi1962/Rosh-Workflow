export default async function(req: Request) {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
  if (req.method === 'OPTIONS') return new Response('ok', { headers });
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });

  try {
    const { lead_ids, qualification_status } = await req.json();
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') || '';
    const url = Deno.env.get('INSFORGE_URL') || '';
    const key = Deno.env.get('INSFORGE_API_KEY') || '';

    const leadsResp = await fetch(`${url}/rest/v1/leads?id=in.(${lead_ids.join(',')})`, {
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
    });
    const leads = await leadsResp.json();

    for (const lead of leads) {
      const prompt = `Qualify this lead for Roshanal Infotech Limited:
Name: ${lead.name}
Company: ${lead.company}
Location: ${lead.location}
Division Interest: ${lead.division_interest}
Product Interest: ${lead.product_interest?.join(', ')}
Source: ${lead.source}

Score this lead 0-100 and classify as hot/warm/cold. Return JSON with: score, tier, notes`;

      const aiResp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 300,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      const aiData = await aiResp.json();
      const qualification = JSON.parse(aiData.content?.[0]?.text || '{}');

      await fetch(`${url}/rest/v1/leads?id=eq.${lead.id}`, {
        method: 'PATCH',
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: qualification.score || 0,
          tier: qualification.tier || 'cold',
          qualification_status: 'qualified',
          notes: qualification.notes || ''
        })
      });

      await fetch(`${url}/rest/v1/crm_activities`, {
        method: 'POST',
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: lead.id,
          type: 'qualification',
          description: `AI qualified lead: ${qualification.tier} (${qualification.score})`,
          created_at: new Date().toISOString()
        })
      });
    }

    return new Response(JSON.stringify({ success: true, qualified: leads.length }), { headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}
