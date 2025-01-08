// app/api/users/route.ts
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    console.log("Looking up user with email:", email)  // Debug log

    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    console.log("Query result:", user)  // Debug log

    if (!user.length) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(user[0])
  } catch (error) {
    console.error("GET Error details:", error)  // Enhanced error logging
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}