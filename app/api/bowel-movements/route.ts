import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { bowelMovements } from "@/db/schema"
import { v4 as uuidv4 } from 'uuid'
import { eq } from "drizzle-orm"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Log incoming request for debugging
    console.log('Received request body:', body)

    const { userId, cycleEntryId, frequency, consistency } = body

    // Validate all required fields
    if (!userId || !cycleEntryId || frequency === undefined || !consistency) {
      console.log('Missing required fields:', {
        hasUserId: !!userId,
        hasCycleEntryId: !!cycleEntryId,
        hasFrequency: frequency !== undefined,
        hasConsistency: !!consistency
      })
      
      return NextResponse.json({ 
        error: "Missing required fields", 
        details: "userId, cycleEntryId, frequency, and consistency are required" 
      }, { 
        status: 400 
      })
    }

    // Create the new entry
    const newEntry = {
      id: uuidv4(),
      cycleEntryId,
      frequency: Number(frequency), // Ensure frequency is a number
      consistency
    }

    console.log('Attempting to create entry:', newEntry)

    // Insert the data and return the result
    const result = await db
      .insert(bowelMovements)
      .values(newEntry)
      .returning()

    console.log('Database operation result:', result)

    return NextResponse.json({
      success: true,
      message: "Bowel movement logged successfully",
      data: result[0]
    }, {
      status: 201
    })

  } catch (error) {
    // Enhanced error logging
    console.error('POST Error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error
    })

    return NextResponse.json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, {
      status: 500
    })
  }
}

// Optional: Add GET endpoint to fetch bowel movement entries
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const cycleEntryId = searchParams.get('cycleEntryId')

    if (!cycleEntryId) {
      return NextResponse.json({ 
        error: "Missing cycleEntryId parameter" 
      }, { 
        status: 400 
      })
    }

    const entries = await db
      .select()
      .from(bowelMovements)
      .where(eq(bowelMovements.cycleEntryId, cycleEntryId))

    return NextResponse.json({ 
      data: entries 
    })

  } catch (error) {
    console.error('GET Error:', error)
    return NextResponse.json({ 
      error: "Error fetching bowel movement data" 
    }, { 
      status: 500 
    })
  }
}