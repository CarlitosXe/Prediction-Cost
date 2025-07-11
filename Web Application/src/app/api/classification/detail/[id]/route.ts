// src/app/api/classification/detail/[id]/route.ts - KEEP THIS IMPLEMENTATION
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";
import { db } from "@/lib/db";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const classificationId = params.id;

    if (!classificationId) {
      return NextResponse.json(
        { error: "Classification ID is required" },
        { status: 400 }
      );
    }

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

    // Fetch classification details
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
        drug_results,
        radio_results,
        laborat_results,
        api_timestamp
      FROM 
        classif_history 
      WHERE 
        id = $1 AND user_id = $2
    `;

    const classification = await db.getOne(query, [classificationId, userId]);

    if (!classification) {
      return NextResponse.json(
        { error: "Classification not found" },
        { status: 404 }
      );
    }

    // Safely parse JSON data from the database
    const safelyParseJSON = (jsonString: any) => {
      // If it's already an object, return it
      if (typeof jsonString === "object" && jsonString !== null) {
        return jsonString;
      }

      // If it's a string, try to parse it
      if (typeof jsonString === "string") {
        try {
          return JSON.parse(jsonString);
        } catch (error) {
          console.error("Error parsing JSON:", error);
          return jsonString; // Return the original string if parsing fails
        }
      }

      // Return the original value if it's neither an object nor a string
      return jsonString;
    };

    // Process each field independently to avoid one error affecting others
    if (classification.drug_results) {
      classification.drug_results = safelyParseJSON(
        classification.drug_results
      );
    }

    if (classification.radio_results) {
      classification.radio_results = safelyParseJSON(
        classification.radio_results
      );
    }

    if (classification.laborat_results) {
      classification.laborat_results = safelyParseJSON(
        classification.laborat_results
      );
    }

    return NextResponse.json({
      success: true,
      classification,
    });
  } catch (error) {
    console.error("Error fetching classification detail:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
