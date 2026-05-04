const KIE_BASE_URL = 'https://api.kie.ai/api/v1'

export interface KieTaskResult {
  success: boolean
  url?: string
  error?: string
}

export async function pollKieTask(
  taskId: string,
  endpoint: 'runway' | 'veo' | 'kling' | 'bytedance' | '4o-image' | 'flux-kontext',
  maxWaitMs = 300000
): Promise<KieTaskResult> {
  const { getApiKey } = await import('@/lib/env')
  const key = await getApiKey('kie_ai', 'API Key')
  if (!key) throw new Error('Kie.ai API key not configured')
  
  const pollUrl = `${KIE_BASE_URL}/${endpoint}/record-info?taskId=${taskId}`
  const startTime = Date.now()
  
  while (Date.now() - startTime < maxWaitMs) {
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    const res = await fetch(pollUrl, {
      headers: { 'Authorization': `Bearer ${key}` },
      signal: AbortSignal.timeout(10000)
    })
    
    const data = await res.json()
    
    if (data.data?.status === 'SUCCESS') {
      return { success: true, url: data.data.videoUrl ?? data.data.imageUrl }
    }
    if (data.data?.status === 'FAILED') {
      return { success: false, error: data.data.errorMessage }
    }
  }
  
  return { success: false, error: 'Timeout' }
}

export async function saveVideoTask(task: {
  task_id: string
  model: string
  prompt: string
  status: string
  type: string
}) {
  const { DBClient } = await import('@/lib/insforge/server')
  const db = new DBClient()
  await db
    .from('video_tasks')
    .insert({
      kie_task_id: task.task_id,
      model: task.model,
      prompt: task.prompt,
      status: task.status,
      type: task.type,
      created_at: new Date().toISOString(),
    })
}
