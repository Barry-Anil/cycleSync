import { db } from "@/db"
import { medications } from "@/db/schema"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    console.log('Received medication request:', body)

    // Validate required fields
    if (!body.cycleEntryId || !body.name) {
      return NextResponse.json(
        { error: "Cycle entry ID and medication name are required" },
        { status: 400 }
      )
    }

    // Create new medication entry
    const newMedication = {
      id: uuidv4(),
      cycleEntryId: body.cycleEntryId,
      name: body.name,
    }

    console.log('Creating medication entry:', newMedication)

    const result = await db
      .insert(medications)
      .values(newMedication)
      .returning()

    return NextResponse.json(
      {
        success: true,
        message: "Medication recorded successfully",
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

    console.log('Fetching medications for cycle entry:', cycleEntryId)

    const medicationList = await db
      .select()
      .from(medications)
      .where(eq(medications.cycleEntryId, cycleEntryId))

    console.log('Retrieved medications:', medicationList)

    return NextResponse.json(
      medicationList,
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

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: "Medication ID is required" },
        { status: 400 }
      )
    }

    console.log('Deleting medication:', id)

    const result = await db
      .delete(medications)
      .where(eq(medications.id, id))
      .returning()

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Medication not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: "Medication deleted successfully",
        data: result[0]
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('DELETE Error:', {
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