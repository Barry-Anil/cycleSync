import { db } from "@/db"
import { cognitiveAssessments } from "@/db/schema"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    console.log('Received cognitive assessment request:', body)

    // Validate required fields
    if (!body.cycleEntryId) {
      return NextResponse.json(
        { error: "Cycle entry ID is required" },
        { status: 400 }
      )
    }

    // Create new cognitive assessment entry
    const newAssessment = {
      id: uuidv4(),
      cycleEntryId: body.cycleEntryId,
      focus: body.focus || null,
      memory: body.memory || null,
    }

    console.log('Creating cognitive assessment:', newAssessment)

    const result = await db
      .insert(cognitiveAssessments)
      .values(newAssessment)
      .returning()

    return NextResponse.json(
      {
        success: true,
        message: "Cognitive assessment recorded successfully",
        data: result[0]
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('POST Error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error
    })

    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const cycleEntryId = searchParams.get('cycleEntryId')

    if (!cycleEntryId) {
      return NextResponse.json(
        { error: "Cycle entry ID is required" },
        { status: 400 }
      )
    }

    console.log('Fetching cognitive assessment for cycle entry:', cycleEntryId)

    const assessment = await db
      .select()
      .from(cognitiveAssessments)
      .where(eq(cognitiveAssessments.cycleEntryId, cycleEntryId))

    console.log('Retrieved cognitive assessment:', assessment)

    return NextResponse.json(
      assessment,
      { status: 200 }
    )

  } catch (error) {
    console.error('GET Error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error
    })

    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}