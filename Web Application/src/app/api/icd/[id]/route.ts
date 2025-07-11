import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";
import { db } from "@/lib/db";

// Fungsi untuk validasi user
async function validateUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    return { isValid: false, error: "Unauthorized" };
  }

  try {
    await decrypt(token);
    return { isValid: true };
  } catch (error) {
    console.error("Error decrypting token:", error);
    return { isValid: false, error: "Invalid session" };
  }
}

// GET: Mengambil data ICD berdasarkan ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Validate user
    const { isValid, error } = await validateUser();
    if (!isValid) {
      return NextResponse.json({ error }, { status: 401 });
    }

    const id = params.id;

    // Fetch ICD data
    const query = "SELECT id, code, description FROM icd WHERE id = $1";
    const icd = await db.getOne(query, [id]);

    if (!icd) {
      return NextResponse.json(
        {
          error: "ICD not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      icd,
    });
  } catch (error) {
    console.error("Error fetching ICD:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

// PUT: Mengupdate data ICD
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Validate user
    const { isValid, error } = await validateUser();
    if (!isValid) {
      return NextResponse.json({ error }, { status: 401 });
    }

    const id = params.id;

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

    // Check if ICD exists
    const existingIcd = await db.getOne("SELECT id FROM icd WHERE id = $1", [
      id,
    ]);

    if (!existingIcd) {
      return NextResponse.json(
        {
          error: "ICD not found",
        },
        { status: 404 }
      );
    }

    // Check if the new code already exists with a different ID
    const duplicateCode = await db.getOne(
      "SELECT id FROM icd WHERE code = $1 AND id != $2",
      [code, id]
    );

    if (duplicateCode) {
      return NextResponse.json(
        {
          error: "ICD code already exists",
        },
        { status: 400 }
      );
    }

    // Update ICD
    const query = "UPDATE icd SET code = $1, description = $2 WHERE id = $3";
    await db.update(query, [code, description, id]);

    return NextResponse.json({
      success: true,
      message: "ICD updated successfully",
    });
  } catch (error) {
    console.error("Error updating ICD:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

// DELETE: Menghapus data ICD
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Validate user
    const { isValid, error } = await validateUser();
    if (!isValid) {
      return NextResponse.json({ error }, { status: 401 });
    }

    const id = params.id;

    // Check if ICD exists
    const existingIcd = await db.getOne("SELECT id FROM icd WHERE id = $1", [
      id,
    ]);

    if (!existingIcd) {
      return NextResponse.json(
        {
          error: "ICD not found",
        },
        { status: 404 }
      );
    }

    // Delete ICD
    const query = "DELETE FROM icd WHERE id = $1";
    await db.delete(query, [id]);

    return NextResponse.json({
      success: true,
      message: "ICD deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting ICD:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
