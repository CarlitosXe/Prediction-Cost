import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Mengambil dan memverifikasi user dari cookie
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Dekripsi token untuk mendapatkan data user
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

    // Ambil daftar history prediksi user
    const query = `
      SELECT 
        id, 
        icd_primer, 
        icd_sekunder1, 
        icd_sekunder2, 
        icd_sekunder3, 
        lama_rawat, 
        tipe_pasien, 
        total_cost, 
        created_at,
        kode_rujukan
      FROM 
        prediction_history 
      WHERE 
        user_id = $1 
      ORDER BY 
        created_at DESC
    `;

    const predictions = await db.getMany(query, [userId]);

    return NextResponse.json({
      success: true,
      predictions,
    });
  } catch (error) {
    console.error("Error fetching prediction history:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
