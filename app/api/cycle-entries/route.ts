import { db } from "@/db"
import { cycleEntries } from "@/db/schema"
import { and, desc, eq, gte, lte, or } from "drizzle-orm"
import { NextResponse } from "next/server"
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Log incoming request
    console.log('Received request body:', body)

    // Validate the incoming data
    if (!body.userId || !body.date || !body.endDate) {
      console.log('Missing required fields:', { 
        hasUserId: !!body.userId, 
        hasDate: !!body.date, 
        hasEndDate: !!body.endDate 
      })
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Create the new entry
    const newEntry = {
      id: uuidv4(),
      userId: body.userId,
      date: new Date(body.date), // Keep as Date object
      endDate: new Date(body.endDate), // Keep as Date object
      mood: body.mood || null,
      energy: typeof body.energy === 'number' ? body.energy : null,
      notes: body.notes || null,
    }

    console.log('Attempting to create entry:', newEntry)

    const result = await db
      .insert(cycleEntries)
      .values(newEntry)
      .returning()

    console.log('Database operation result:', result)

    return NextResponse.json(
      {
        success: true,
        message: "Entry created successfully",
        data: result[0]
      },
      { status: 201 }
    )
  } catch (error) {
    // Enhanced error logging
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
    // Get userId from the URL parameters
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 5 // Default to 5 entries

    // Validate userId
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    console.log('Fetching entries for user:', userId)

    // Query the database for the most recent entries
    const entries = await db
      .select()
      .from(cycleEntries)
      .where(
        eq(cycleEntries.userId, userId)
      )
      .orderBy(desc(cycleEntries.date))
      .limit(limit)

    console.log('Retrieved entries:', entries)

    // Return empty array if no entries found (200 status)
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