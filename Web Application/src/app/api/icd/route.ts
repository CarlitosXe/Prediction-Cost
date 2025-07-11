import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";
import { db } from "@/lib/db";

// GET: Mengambil semua data ICD
export async function GET() {
  try {
    // Validate authenticated user
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      await decrypt(token);
    } catch (error) {
      console.error("Error decrypting token:", error);
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    // Fetch ICD data
    const query = "SELECT id, code, description FROM icd ORDER BY code ASC";
    const icds = await db.getMany(query);

    return NextResponse.json({
      success: true,
      data: icds,
    });
  } catch (error) {
    console.error("Error fetching ICD data:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

// POST: Menambahkan ICD baru
export async function POST(request: Request) {
  try {
    // Validate authenticated user
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      await decrypt(token);
    } catch (error) {
      console.error("Error decrypting token:", error);
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    // Get request body
    const { code, description } = await request.json();

    if (!code || !description) {
      return NextResponse.json(
        {
          error: "Code and description are required",
        },
        { status: 400 }
      );
    }

    // Check if code already exists
    const existingIcd = await db.getOne("SELECT id FROM icd WHERE code = $1", [
      code,
    ]);

    if (existingIcd) {
      return NextResponse.json(
        {
          error: "ICD code already exists",
        },
        { status: 400 }
      );
    }

    // Insert new ICD
    const query =
      "INSERT INTO icd (code, description) VALUES ($1, $2) RETURNING id";
    const id = await db.insert(query, [code, description]);

    return NextResponse.json(
      {
        success: true,
        message: "ICD added successfully",
        id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding ICD:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
