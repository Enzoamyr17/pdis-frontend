import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const data = await req.json()
    const {
      lastName,
      firstName,
      middleName,
      position,
      idNumber,
      employmentDate,
      office,
      group,
      department,
      contactNumber,
      pdEmail,
      personalEmail,
      birthdate,
      address,
      password
    } = data

    // Validate required fields
    const requiredFields = [
      lastName, firstName, middleName, position, idNumber,
      employmentDate, office, group, department, contactNumber,
      pdEmail, personalEmail, birthdate, password
    ]

    if (requiredFields.some(field => !field)) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      )
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create address first
    const createdAddress = await prisma.address.create({
      data: {
        houseNo: address.houseNo,
        street: address.street,
        subdivision: address.subdivision || null,
        region: address.region,
        province: address.province || null,
        cityMunicipality: address.cityMunicipality,
        barangay: address.barangay
      }
    })

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        lastName,
        firstName,
        middleName,
        position,
        idNumber,
        employmentDate: new Date(employmentDate),
        office,
        group,
        department,
        contactNumber,
        pdEmail,
        personalEmail,
        birthdate: new Date(birthdate),
        addressId: createdAddress.id,
        password: hashedPassword, // Add the hashed password
        profileCompleted: true
      }
    })

    return NextResponse.json({
      message: "Profile completed successfully",
      user: updatedUser
    })
  } catch (error) {
    console.error("Profile completion error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}