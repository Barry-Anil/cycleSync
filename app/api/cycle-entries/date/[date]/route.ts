import { NextRequest, NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  cycleEntries,
  bodyChanges,
  bowelMovements,
  cognitiveAssessments,
  medications,
} from "@/db/schema";

type Props = {
  params: {
    date: string;
  };
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  try {
    // Extract the userId from the query string
    const { searchParams } = request.nextUrl;
    const userId = searchParams.get("userId");
    
    // Get date from dynamic route parameter
    const date = (await params).date;

    if (!userId || !date) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }

    const formattedDate = parsedDate.toISOString().split("T")[0];

    const entry = await db.query.cycleEntries.findFirst({
      where: and(
        eq(cycleEntries.userId, userId),
        sql`${cycleEntries.date} <= ${formattedDate} 
             AND ${cycleEntries.endDate} >= ${formattedDate}`
      ),
      with: {
        bodyChanges: true,
        bowelMovements: true,
        cognitiveAssessments: true,
        medications: true,
      },
    });

    // If no entry found, return an empty response
    if (!entry) {
      return NextResponse.json({});
    }

    return NextResponse.json(entry);
  } catch (error) {
    console.error("Error in cycle-entries/date/[date] route:", {
      error,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        error: `Internal Server Error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}