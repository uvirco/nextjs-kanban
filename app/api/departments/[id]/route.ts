import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const departmentId = params.id;
    const body = await request.json();
    const { name, description, managerId } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Department name is required" },
        { status: 400 }
      );
    }

    const { data: department, error } = await supabaseAdmin
      .from("Department")
      .update({
        name,
        description: description || null,
        managerId: managerId || null,
        updatedAt: new Date().toISOString(),
      })
      .eq("id", departmentId)
      .select(`
        *,
        manager:User(id, name, email)
      `)
      .single();

    if (error) {
      console.error("Error updating department:", error);
      return NextResponse.json(
        { error: "Failed to update department" },
        { status: 500 }
      );
    }

    return NextResponse.json(department);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const departmentId = params.id;

    // Check if department is being used by any tasks
    const { data: tasksUsingDepartment, error: checkError } = await supabaseAdmin
      .from("Task")
      .select("id")
      .eq("departmentId", departmentId)
      .limit(1);

    if (checkError) {
      console.error("Error checking department usage:", checkError);
      return NextResponse.json(
        { error: "Failed to check department usage" },
        { status: 500 }
      );
    }

    if (tasksUsingDepartment && tasksUsingDepartment.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete department that is assigned to tasks. Please reassign tasks first." },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("Department")
      .delete()
      .eq("id", departmentId);

    if (error) {
      console.error("Error deleting department:", error);
      return NextResponse.json(
        { error: "Failed to delete department" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}