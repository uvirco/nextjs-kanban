import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { CRMDeal } from "@/types/crm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!session || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const { data: deal, error } = await supabaseAdmin
      .from("CRMDeal")
      .select(
        `
        *,
        contact:CRMContact(*),
        assignedUser:assignedUserId(id, name, email)
      `,
      )
      .eq("deal_id", id)
      .single();

    if (error) {
      console.error("Error fetching CRM deal:", error);
      return NextResponse.json(
        { error: "Failed to fetch deal" },
        { status: 500 },
      );
    }

    // Map deal_id to id for consistency
    const dealWithId = deal ? { ...deal, id: deal.deal_id } : null;

    return NextResponse.json(dealWithId);
  } catch (error) {
    console.error("Error in CRM deal API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!session || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    console.log(
      "PUT /api/crm/deals/[id] - Received body:",
      JSON.stringify(body, null, 2),
    );

    // Get current deal to track stage change
    const { data: currentDeal } = await supabaseAdmin
      .from("CRMDeal")
      .select("stage, boardId, value")
      .eq("deal_id", id)
      .single();

    console.log("Current deal:", currentDeal);

    let updateData = { ...body, updatedAt: new Date().toISOString() };
    const isStageChange =
      body.stage && currentDeal && currentDeal.stage !== body.stage;

    console.log("Is stage change:", isStageChange);
    console.log("New stage:", body.stage);

    // If there's a stage change, just update the deal stage
    if (isStageChange) {
      updateData = {
        ...updateData,
        stage: body.stage,
      };

      // Create STAGE_CHANGE activity
      await supabaseAdmin.from("CRMActivity").insert({
        type: "STAGE_CHANGE",
        content: `Deal moved to ${body.stage}`,
        dealId: parseInt(id),
        createdByUserId: userId,
        createdAt: new Date().toISOString(),
      });

      // Log to stage history
      await supabaseAdmin.from("CRMDealStageHistory").insert({
        dealId: parseInt(id),
        fromStage: currentDeal.stage,
        toStage: body.stage,
        changedByUserId: userId,
        changedAt: new Date().toISOString(),
      });
    }

    const { data: deal, error } = await supabaseAdmin
      .from("CRMDeal")
      .update(updateData)
      .eq("deal_id", id)
      .select(
        `
        *,
        contact:contactId(*)
      `,
      )
      .single();

    if (error) {
      console.error("Error updating CRM deal:", error);
      return NextResponse.json(
        { error: "Failed to update deal", details: error.message },
        { status: 500 },
      );
    }

    // Log regular stage change if stage was updated
    if (isStageChange) {
      // Log to CRMDealStageHistory
      await supabaseAdmin.from("CRMDealStageHistory").insert({
        dealId: parseInt(id),
        fromStage: currentDeal.stage,
        toStage: body.stage,
        changedByUserId: userId,
        changedAt: new Date().toISOString(),
      });

      // Log to CRMActivity table
      await supabaseAdmin.from("CRMActivity").insert({
        type: "STAGE_CHANGE",
        content: `Deal moved from ${currentDeal.stage} to ${body.stage}`,
        dealId: parseInt(id),
        createdByUserId: userId,
        createdAt: new Date().toISOString(),
      });
    }

    // Map deal_id to id for consistency
    const dealWithId = deal ? { ...deal, id: deal.deal_id } : null;

    return NextResponse.json({
      deal: dealWithId as CRMDeal,
    });
  } catch (error) {
    console.error("Error in CRM deal update API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!session || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const { error } = await supabaseAdmin
      .from("CRMDeal")
      .delete()
      .eq("deal_id", id);

    if (error) {
      console.error("Error deleting CRM deal:", error);
      return NextResponse.json(
        { error: "Failed to delete deal" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error in CRM deal deletion API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
