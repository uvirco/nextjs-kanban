import { NextResponse } from "next/server";
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

export async function GET() {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: columns, error } = await supabaseAdmin
      .from("CRMColumn")
      .select("*")
      .eq("boardId", "crm-deals-board")
      .order("order", { ascending: true });

    if (error) {
      console.error("Error fetching CRM deal columns:", error);
      return NextResponse.json(
        { error: "Failed to fetch columns", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      columns: columns as CRMDealColumn[],
    });
  } catch (error) {
    console.error("Error in CRM deal columns API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
