  // app/api/collective-entries/route.ts
  import { NextRequest, NextResponse } from "next/server";
  import { and, desc, eq } from "drizzle-orm";
  import { 
    cycleEntries,
    bodyChanges,
    bowelMovements,
    cognitiveAssessments,
    medications
  } from "@/db/schema";
import { db } from "@/db";
import { CollectiveEntry } from "@/types";
  
  export async function GET(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url);
      const userId = searchParams.get("userId");
  
      if (!userId) {
        return NextResponse.json(
          { error: "User ID is required" },
          { status: 400 }
        );
      }
  
      const entries = await db
        .select({
          id: cycleEntries.id,
          date: cycleEntries.date,
          endDate: cycleEntries.endDate,
          mood: cycleEntries.mood,
          energy: cycleEntries.energy,
          notes: cycleEntries.notes,
          bodyChanges: bodyChanges,
          bowelMovements: bowelMovements,
          cognitiveAssessment: cognitiveAssessments,
          medications: medications,
        })
        .from(cycleEntries)
        .leftJoin(bodyChanges, eq(cycleEntries.id, bodyChanges.cycleEntryId))
        .leftJoin(bowelMovements, eq(cycleEntries.id, bowelMovements.cycleEntryId))
        .leftJoin(cognitiveAssessments, eq(cycleEntries.id, cognitiveAssessments.cycleEntryId))
        .leftJoin(medications, eq(cycleEntries.id, medications.cycleEntryId))
        .where(eq(cycleEntries.userId, userId))
        .orderBy(desc(cycleEntries.date))
        .limit(10);
  
      // Process the raw data to group medications by cycle entry
      const processedEntries = entries.reduce<CollectiveEntry[]>((acc, entry) => {
        const existingEntry = acc.find(e => e.id === entry.id);
        
        if (existingEntry) {
          if (entry.medications) {
            existingEntry.medications.push({
              name: entry.medications.name
            });
          }
        } else {
          acc.push({
            id: entry.id,
            date: entry.date,
            endDate: entry.endDate,
            mood: entry.mood,
            energy: entry.energy,
            notes: entry.notes,
            bodyChanges: entry.bodyChanges ? {
              skinCondition: entry.bodyChanges.skinCondition,
              hairCondition: entry.bodyChanges.hairCondition,
              gutHealth: entry.bodyChanges.gutHealth,
              dietCravings: entry.bodyChanges.dietCravings,
            } : null,
            bowelMovements: entry.bowelMovements ? {
              frequency: entry.bowelMovements.frequency,
              consistency: entry.bowelMovements.consistency,
            } : null,
            cognitiveAssessment: entry.cognitiveAssessment ? {
              focus: entry.cognitiveAssessment.focus,
              memory: entry.cognitiveAssessment.memory,
            } : null,
            medications: entry.medications ? [{
              name: entry.medications.name
            }] : [],
          });
        }
        return acc;
      }, []);
  
      return NextResponse.json(processedEntries);
  
    } catch (error) {
      console.error("Error fetching collective entries:", error);
      return NextResponse.json(
        { error: "Failed to fetch entries" },
        { status: 500 }
      );
    }
  }