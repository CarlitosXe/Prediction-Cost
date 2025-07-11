// src/app/api/classification/history/route.ts - FIX THIS FIRST
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";
import { db } from "@/lib/db";

// No need for RouteParams here as there's no URL parameters in history endpoint
export async function GET(request: Request) {
  try {
    // Get and verify user from cookie
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Decrypt token to get user data
    let user;
    try {
      user = await decrypt(token);
    } catch (error) {
      console.error("Error decrypting token:", error);
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    if (!user || !user.userId) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const userId = user.userId;

    // Fetch classifications for this user
    const query = `
      SELECT 
        id, 
        icd_primer, 
        icd_sekunder1, 
        icd_sekunder2, 
        icd_sekunder3, 
        lama_rawat, 
        tipe_pasien, 
        kode_rujukan, 
        created_at
      FROM 
        classif_history 
      WHERE 
        user_id = $1
      ORDER BY 
        created_at DESC
    `;

    const classifications = await db.getMany(query, [userId]);

    return NextResponse.json({
      success: true,
      classifications,
    });
  } catch (error) {
    console.error("Error fetching classification history:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
