import { NextResponse } from 'next/server'

interface VideoScene {
  id: string
  type: string
  duration: number
  content: string
  overlay_text?: string
  overlay_position?: string
  transition?: string
  music?: string
  order: number
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { scenes, title, division, style } = body as {
      scenes: VideoScene[]
      title: string
      division: string
      style: string
    }

    if (!scenes || scenes.length === 0) {
      return NextResponse.json({ error: 'At least one scene is required' }, { status: 400 })
    }

    const totalDuration = scenes.reduce((sum, s) => sum + s.duration, 0)
    const ffmpegCommands: string[] = []

    scenes.forEach((scene, i) => {
      if (scene.type === 'image') {
        ffmpegCommands.push(
          `-loop 1 -i "${scene.content}" -t ${scene.duration}`
        )
      } else if (scene.type === 'video') {
        ffmpegCommands.push(`-i "${scene.content}" -t ${scene.duration}`)
      }
    })

    const videoJob = {
      id: crypto.randomUUID(),
      title,
      division,
      style,
      scene_count: scenes.length,
      total_duration: totalDuration,
      status: 'queued',
      ffmpeg_commands: ffmpegCommands,
      created_at: new Date().toISOString(),
    }

    return NextResponse.json({ job: videoJob, message: 'Video generation queued' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const division = searchParams.get('division')
    const status = searchParams.get('status')

    const mockVideos = [
      {
        id: 'vid_1',
        title: 'Marine Equipment Showcase',
        division: 'marine',
        style: 'cinematic',
        duration: 45,
        status: 'completed',
        thumbnail_url: '',
        created_at: new Date().toISOString(),
      },
      {
        id: 'vid_2',
        title: 'CCTV Installation Demo',
        division: 'tech',
        style: 'professional',
        duration: 30,
        status: 'completed',
        thumbnail_url: '',
        created_at: new Date().toISOString(),
      },
    ]

    let filtered = mockVideos
    if (division) filtered = filtered.filter(v => v.division === division)
    if (status) filtered = filtered.filter(v => v.status === status)

    return NextResponse.json({ videos: filtered })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
