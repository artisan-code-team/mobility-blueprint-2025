// app/api/subscription-tier/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Count total users in the database
    const userCount = await prisma.user.count();

    // Determine price based on user count
    let price = 1; // Default $1/month

    if (userCount >= 300) {
      price = 20; // After 300 users: $20/month
    } else if (userCount >= 200) {
      price = 15; // 201-300 users: $15/month
    } else if (userCount >= 100) {
      price = 10; // 101-200 users: $10/month
    } else if (userCount >= 0) {
      price = 5; // 1-100 users: $5/month
    }

    return NextResponse.json({ price, userCount });
  } catch (error) {
    console.error("Error determining subscription tier:", error);
    return NextResponse.json(
      { error: "Failed to determine subscription tier" },
      { status: 500 }
    );
  }
}
