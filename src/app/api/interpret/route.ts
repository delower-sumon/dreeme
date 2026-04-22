import { NextRequest, NextResponse } from 'next/server'
import { interpretDream } from '@/lib/services/interpretationService'


export async function POST(request: NextRequest) {
  try {
    const { dreamText } = await request.json()

    if (!dreamText || !dreamText.trim()) {
      return NextResponse.json({ error: 'Dream text is required' }, { status: 400 })
    }

    const interpretationData = await interpretDream(dreamText)

    return NextResponse.json({
      interpretation: interpretationData,
      success: true,
    })
  } catch (error: any) {
    console.error('Interpretation error:', error)
    
    const userMessage = error.message?.includes('unavailable')
      ? error.message
      : 'The dream interpreter is temporarily unavailable. Please try again shortly.'

    return NextResponse.json(
      { error: userMessage },
      { status: 500 }
    )
  }
}
