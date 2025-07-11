import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";
import { db } from "@/lib/db";

export async function POST(request: Request) {
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

    // Parse request body
    const data = await request.json();
    const { formData, results } = data;

    if (!formData || !results) {
      return NextResponse.json(
        {
          error: "Missing required data",
        },
        { status: 400 }
      );
    }

    // Simpan data ke tabel classif_history
    const query = `
      INSERT INTO classif_history (
        user_id,
        icd_primer,
        icd_sekunder1,
        icd_sekunder2,
        icd_sekunder3,
        lama_rawat,
        tipe_pasien,
        kode_rujukan,
        drug_results,
        radio_results,
        laborat_results,
        api_timestamp
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
      ) RETURNING id`;

    const values = [
      userId,
      formData.icdPrimer,
      formData.icdSekunder1 || null,
      formData.icdSekunder2 || null,
      formData.icdSekunder3 || null,
      parseInt(formData.lamaRawat),
      formData.tipePasien,
      formData.kodeRujukan,
      JSON.stringify(results.drug),
      JSON.stringify(results.radio),
      JSON.stringify(results.laborat),
      new Date(results.timestamp),
    ];

    const result = await db.insert(query, values);

    return NextResponse.json({
      success: true,
      message: "Classification saved successfully",
      id: result,
    });
  } catch (error) {
    console.error("Error saving classification:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
