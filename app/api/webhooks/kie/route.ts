import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'

const db = new DBClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Kie.ai callback payload
    const { taskId, status, videoUrl, errorMessage } = body
    
    // Find the task in Insforge
    const { data: task } = await db
      .from('video_tasks')
      .select('*')
      .eq('kie_task_id', taskId)
      .single()
    
    if (!task) return NextResponse.json({ ok: false })
    
    if (status === 'SUCCESS' && videoUrl) {
      // Update the task
      await db
        .from('video_tasks')
        .update({ 
          status: 'DONE',
          completed_at: new Date().toISOString()
        })
        .eq('kie_task_id', taskId)
      
      // Update related video asset if exists
      if (task.asset_id) {
        await db
          .from('generated_videos')
          .update({ 
            video_url: videoUrl,
            status: 'READY',
            completed_at: new Date().toISOString()
          })
          .eq('id', task.asset_id)
      }
    } else if (status === 'FAILED') {
      await db
        .from('video_tasks')
        .update({ 
          status: 'FAILED',
          error: errorMessage
        })
        .eq('kie_task_id', taskId)
    }
    
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
