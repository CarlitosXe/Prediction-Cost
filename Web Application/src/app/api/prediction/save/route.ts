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

    // Simpan data ke tabel prediction_history
    const query = `
      INSERT INTO prediction_history (
        user_id,
        icd_primer,
        icd_sekunder1,
        icd_sekunder2,
        icd_sekunder3,
        lama_rawat,
        tipe_pasien,
        non_bedah,
        bedah,
        konsul_dokter,
        konsul_tenaga_ahli,
        tind_keperawatan,
        penunjang,
        radiologi,
        laboratorium,
        pelayanan_darah,
        rehabilitasi,
        akomodasi,
        akomodasi_intensif,
        bmhp,
        alat_medis,
        obat,
        obat_kronis,
        obat_kemoterapi,
        alkes,
        total_cost,
        kode_rujukan
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27
      ) RETURNING id`;

    const values = [
      userId,
      formData.icdPrimer,
      formData.icdSekunder1,
      formData.icdSekunder2,
      formData.icdSekunder3,
      parseInt(formData.lamaRawat),
      formData.tipePasien,
      results.non_Bedah,
      results.bedah,
      results.konsul_Dokter,
      results.konsul_Tenaga_Ahli,
      results.tind_Keperawatan,
      results.penunjang,
      results.radiologi,
      results.laboratorium,
      results.pelayanan_Darah,
      results.rehabilitasi,
      results.akomodasi,
      results.akomodasi_Intensif,
      results.bmhp,
      results.alat_Medis,
      results.obat,
      results.obat_Kronis,
      results.obat_Kemoterapi,
      results.alkes,
      results.total_Cost,
      formData.kodeRujukan,
    ];

    const result = await db.insert(query, values);

    return NextResponse.json({
      success: true,
      message: "Prediction saved successfully",
      id: result,
    });
  } catch (error) {
    console.error("Error saving prediction:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
