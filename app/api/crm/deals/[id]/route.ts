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

    // Check if this is a transition to "won" stage
    const isWinningDeal =
      isStageChange &&
      (body.stage.toLowerCase() === "won" ||
        body.stage.toLowerCase() === "closed_won" ||
        body.stage === "CLOSED_WON");

    console.log("Is winning deal:", isWinningDeal);

    // AUTO-TRANSITION: If moved to "won" stage, transition to delivery pipeline
    if (isWinningDeal) {
      // Check if delivery pipeline exists
      const { data: deliveryBoard } = await supabaseAdmin
        .from("CRMBoard")
        .select("id, title")
        .or("title.ilike.%delivery%,title.ilike.%fulfillment%")
        .single();

      if (deliveryBoard) {
        // Get first column of delivery pipeline
        const { data: firstColumn } = await supabaseAdmin
          .from("CRMColumn")
          .select("stage, title")
          .eq("boardId", deliveryBoard.id)
          .order("order", { ascending: true })
          .limit(1)
          .single();

        if (firstColumn) {
          // Update to move to delivery pipeline
          updateData = {
            ...updateData,
            boardId: deliveryBoard.id,
            stage: firstColumn.stage,
            outcome: "won",
          };

          // Create DEAL_WON activity (special activity type)
          await supabaseAdmin.from("CRMActivity").insert({
            type: "DEAL_WON",
            content: `Deal won with value $${body.value || currentDeal?.value || 0}`,
            dealId: parseInt(id),
            createdByUserId: userId,
            createdAt: new Date().toISOString(),
          });

          // Create pipeline transition activity
          await supabaseAdmin.from("CRMActivity").insert({
            type: "STAGE_CHANGE",
            content: `Deal automatically moved to ${deliveryBoard.title} pipeline - ${firstColumn.title}`,
            dealId: parseInt(id),
            createdByUserId: userId,
            createdAt: new Date().toISOString(),
          });

          // Log to stage history
          await supabaseAdmin.from("CRMDealStageHistory").insert({
            dealId: parseInt(id),
            fromStage: currentDeal.stage,
            toStage: firstColumn.stage,
            changedByUserId: userId,
            changedAt: new Date().toISOString(),
          });

          // Create reference card in original Won column
          await supabaseAdmin.from("CRMDealReference").insert({
            dealId: parseInt(id),
            boardId: currentDeal.boardId,
            stage: currentDeal.stage,
            note: `Won on ${new Date().toLocaleDateString()} - Now in ${deliveryBoard.title}`,
          });
        }
      } else {
        // No delivery pipeline found, just mark as won
        updateData = {
          ...updateData,
          outcome: "won",
        };

        // Create DEAL_WON activity
        await supabaseAdmin.from("CRMActivity").insert({
          type: "DEAL_WON",
          content: `Deal won with value $${body.value || currentDeal?.value || 0}`,
          dealId: parseInt(id),
          createdByUserId: userId,
          createdAt: new Date().toISOString(),
        });
      }
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

    // Log regular stage change if stage was updated (and not already logged by won transition)
    if (isStageChange && !isWinningDeal) {
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

    if (error) {
      console.error("Error updating CRM deal:", error);
      return NextResponse.json(
        { error: "Failed to update deal", details: error.message },
        { status: 500 },
      );
    }

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
