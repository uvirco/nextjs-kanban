import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/crm/boards - Fetch all boards
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "deals";

    const { data, error } = await supabaseAdmin
      .from("CRMBoard")
      .select("*")
      .eq("type", type)
      .order("isDefault", { ascending: false })
      .order("title", { ascending: true });

    if (error) {
      console.error("Error fetching boards:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ boards: data || [] });
  } catch (error: any) {
    console.error("Error in GET /api/crm/boards:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/crm/boards - Create a new board
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      type = "deals",
      backgroundUrl,
      isDefault = false,
    } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Generate readable ID from title (slug)
    const generateSlug = (title: string): string => {
      return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with hyphens
        .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
    };

    const slug = generateSlug(title);

    // Check if slug already exists, append number if needed
    let boardId = slug;
    let counter = 1;
    let slugExists = true;

    while (slugExists) {
      const { data: existing } = await supabaseAdmin
        .from("CRMBoard")
        .select("id")
        .eq("id", boardId)
        .limit(1);

      if (!existing || existing.length === 0) {
        slugExists = false;
      } else {
        boardId = `${slug}-${counter}`;
        counter++;
      }
    }

    // Get the user from the database
    const { data: users } = await supabaseAdmin
      .from("User")
      .select("id")
      .eq("email", session.user.email)
      .limit(1);

    const userId = users?.[0]?.id;

    // If this is set as default, unset other defaults
    if (isDefault) {
      await supabaseAdmin
        .from("CRMBoard")
        .update({ isDefault: false })
        .eq("type", type);
    }

    const { data, error } = await supabaseAdmin
      .from("CRMBoard")
      .insert({
        id: boardId, // Use readable slug as ID
        title,
        description,
        type,
        backgroundUrl,
        isDefault,
        createdByUserId: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating board:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ board: data }, { status: 201 });
  } catch (error: any) {
    console.error("Error in POST /api/crm/boards:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
