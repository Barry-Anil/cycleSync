import { db } from "@/db"
import { bodyChanges } from "@/db/schema"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    console.log('Received body change request:', body)

    // Validate required fields
    if (!body.cycleEntryId) {
      return NextResponse.json(
        { error: "Cycle entry ID is required" },
        { status: 400 }
      )
    }

    // Create new body change entry
    const newBodyChange = {
      id: uuidv4(),
      cycleEntryId: body.cycleEntryId,
      skinCondition: body.skinCondition || null,
      hairCondition: body.hairCondition || null,
      gutHealth: body.gutHealth || null,
      dietCravings: body.dietCravings || null,
    }

    console.log('Creating body change entry:', newBodyChange)

    const result = await db
      .insert(bodyChanges)
      .values(newBodyChange)
      .returning()

    return NextResponse.json(
      {
        success: true,
        message: "Body changes recorded successfully",
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

    console.log('Fetching body changes for cycle entry:', cycleEntryId)

    const entries = await db
      .select()
      .from(bodyChanges)
      .where(eq(bodyChanges.cycleEntryId, cycleEntryId))

    console.log('Retrieved body changes:', entries)

    // Return empty array if no entries (200 status)
    return NextResponse.json(
      entries,
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

// Helper function to validate body change entry
function validateBodyChange(data: any) {
  const requiredFields = ['cycleEntryId']
  const missingFields = requiredFields.filter(field => !data[field])
  
  if (missingFields.length > 0) {
    return {
      valid: false,
      error: `Missing required fields: ${missingFields.join(', ')}`
    }
  }

  return { valid: true }
}