import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!session || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const { data: organization, error } = await supabaseAdmin
      .from("CRMOrganization")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching CRM organization:", error);
      return NextResponse.json(
        { error: "Failed to fetch organization" },
        { status: 500 }
      );
    }

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    return NextResponse.json({
      organization: organization,
    });
  } catch (error) {
    console.error("Error in CRM organization API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!session || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const { data: organization, error } = await supabaseAdmin
      .from("CRMOrganization")
      .update({
        ...body,
        updatedAt: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating CRM organization:", error);
      return NextResponse.json(
        { error: "Failed to update organization" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      organization: organization,
    });
  } catch (error) {
    console.error("Error in CRM organization update API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!session || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const { error } = await supabaseAdmin
      .from("CRMOrganization")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting CRM organization:", error);
      return NextResponse.json(
        { error: "Failed to delete organization" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in CRM organization delete API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}