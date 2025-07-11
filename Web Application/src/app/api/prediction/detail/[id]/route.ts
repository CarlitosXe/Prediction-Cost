import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";
import { db } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        {
          error: "Invalid prediction ID",
        },
        { status: 400 }
      );
    }

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

    // Ambil detail prediksi
    const query = `
      SELECT * FROM prediction_history 
      WHERE id = $1 AND user_id = $2
    `;

    const prediction = await db.getOne(query, [id, userId]);

    if (!prediction) {
      return NextResponse.json(
        {
          error: "Prediction not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      prediction,
    });
  } catch (error) {
    console.error("Error fetching prediction detail:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
