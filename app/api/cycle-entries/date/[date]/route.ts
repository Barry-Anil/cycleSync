import type { NextApiRequest, NextApiResponse } from 'next';
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  cycleEntries,
  bodyChanges,
  bowelMovements,
  cognitiveAssessments,
  medications,
} from "@/db/schema";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract the userId from the query string
    const userId = req.query.userId as string;
    // Get date from dynamic route parameter
    const date = req.query.date as string;

    if (!userId || !date) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
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
      return res.json({});
    }

    return res.json(entry);
  } catch (error) {
    console.error("Error in cycle-entries/date/[date] route:", {
      error,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return res.status(500).json({
      error: `Internal Server Error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    });
  }
}