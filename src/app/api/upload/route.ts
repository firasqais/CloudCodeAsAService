import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (!files.length) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    const uploadDir = join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })

    const urls: string[] = []

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
      }

      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
      }

      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const filename = `${uuidv4()}.${ext}`
      const filepath = join(uploadDir, filename)

      const bytes = await file.arrayBuffer()
      await writeFile(filepath, Buffer.from(bytes))

      urls.push(`/uploads/${filename}`)
    }

    return NextResponse.json({ success: true, urls })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Failed to upload files' }, { status: 500 })
  }
}
