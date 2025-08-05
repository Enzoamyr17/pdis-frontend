import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    // Check if user exists in database with this email and is pre-authorized
    // For now, we'll check if there's already a user record with some basic info
    // indicating they're a pre-registered employee
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { pdEmail: email }
        ],
        // You can add additional criteria here to check if they're pre-authorized
        // For example, check if they have certain fields filled or specific permissions
      }
    })

    // If user doesn't exist or is not pre-authorized, return error
    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found in employee database" },
        { status: 404 }
      )
    }

    // Additional check: if user already has profile completed, they shouldn't be here
    if (existingUser.profileCompleted) {
      return NextResponse.json(
        { error: "Profile already completed" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: "User authorized to complete profile",
      user: {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name
      }
    })
  } catch (error) {
    console.error("Employee check error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}