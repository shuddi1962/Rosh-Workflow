export default async function(req: Request) {
  const headers = { 'Content-Type': 'application/json' };
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });

  try {
    const body = await req.json();
    const { call_sid, recording_url, transcription } = body;

    const url = Deno.env.get('INSFORGE_URL') || '';
    const key = Deno.env.get('INSFORGE_API_KEY') || '';
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') || '';

    const callResp = await fetch(`${url}/rest/v1/call_logs?call_sid=eq.${call_sid}`, {
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
    });
    const calls = await callResp.json();
    if (!calls.length) return new Response(JSON.stringify({ error: 'Call not found' }), { status: 404, headers });

    const call = calls[0];

    const summaryPrompt = `Summarize this call transcript and extract key points and next action:
Transcript: ${transcription || 'No transcription available'}

Return JSON with: ai_summary, key_points (array), next_action`;

    const aiResp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 500,
        messages: [{ role: 'user', content: summaryPrompt }]
      })
    });

    const aiData = await aiResp.json();
    const analysis = JSON.parse(aiData.content?.[0]?.text || '{}');

    await fetch(`${url}/rest/v1/call_logs?id=eq.${call.id}`, {
      method: 'PATCH',
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'completed',
        transcript_json: { transcription },
        ai_summary: analysis.ai_summary,
        key_points: analysis.key_points,
        next_action: analysis.next_action,
        ended_at: new Date().toISOString()
      })
    });

    return new Response(JSON.stringify({ success: true }), { headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}
