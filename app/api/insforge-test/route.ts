import { NextResponse } from 'next/server'
import { createClient } from '@insforge/sdk'

const insforge = createClient({
  baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
  anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
  isServerMode: true,
})

export async function GET() {
  try {
    const { data, error } = await insforge.database.from('_tables').select('*').limit(5)
    
    if (error) {
      return NextResponse.json({ connected: false, error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ 
      connected: true, 
      message: 'Insforge connected successfully',
      url: process.env.NEXT_PUBLIC_INSFORGE_URL,
      tables: data 
    })
  } catch (err: any) {
    return NextResponse.json({ connected: false, error: err.message }, { status: 500 })
  }
}
