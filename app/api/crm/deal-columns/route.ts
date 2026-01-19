import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";

export interface CRMDealColumn {
  id: string;
  title: string;
  stage: string;
  color: string;
  order: number;
  boardId: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get boardId from query params (default to crm-deals-board for backward compatibility)
    const { searchParams } = new URL(request.url);
    const boardId = searchParams.get("boardId") || "default-sales-pipeline";

    const { data: columns, error } = await supabaseAdmin
      .from("CRMColumn")
      .select("*")
      .eq("boardId", boardId)
      .order("order", { ascending: true });

    if (error) {
      console.error("Error fetching CRM deal columns:", error);
      return NextResponse.json(
        { error: "Failed to fetch columns", details: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      columns: columns as CRMDealColumn[],
    });
  } catch (error) {
    console.error("Error in CRM deal columns API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, stage, color, boardId, order } = body;

    if (!title || !stage || !boardId) {
      return NextResponse.json(
        { error: "Missing required fields: title, stage, boardId" },
        { status: 400 },
      );
    }

    // Get the highest order number for this board
    const { data: existingColumns } = await supabaseAdmin
      .from("CRMColumn")
      .select("order")
      .eq("boardId", boardId)
      .order("order", { ascending: false })
      .limit(1);

    const nextOrder =
      existingColumns && existingColumns.length > 0
        ? (existingColumns[0].order || 0) + 1
        : 0;

    const { data: column, error } = await supabaseAdmin
      .from("CRMColumn")
      .insert({
        title,
        stage,
        color: color || "#3b82f6",
        boardId,
        order: order !== undefined ? order : nextOrder,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating CRM column:", error);
      return NextResponse.json(
        { error: "Failed to create column", details: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ column });
  } catch (error) {
    console.error("Error in CRM columns POST API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
