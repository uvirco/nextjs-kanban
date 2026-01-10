"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { auth } from "@/auth";
import { MESSAGES } from "@/utils/messages";
import {
  CRMContactCreationData,
  CRMContactEditData,
  CRMLeadCreationData,
  CRMLeadEditData,
  CRMDealCreationData,
  CRMDealEditData,
  CRMActivityCreationData,
  CRMLeadStatus,
  CRMDealStage,
  CRMActivityType,
} from "@/types/crm";

// CRM Contact CRUD

export async function handleCreateCRMContact(data: CRMContactCreationData) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, message: MESSAGES.AUTH.REQUIRED };
  }

  const CreateContactSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().optional(),
    company: z.string().optional(),
    position: z.string().optional(),
    address: z.string().optional(),
    notes: z.string().optional(),
  });

  const parse = CreateContactSchema.safeParse(data);

  if (!parse.success) {
    return {
      success: false,
      message: parse.error.errors.map((e) => e.message).join(", "),
    };
  }

  try {
    const { data: contact, error } = await supabaseAdmin
      .from("CRMContact")
      .insert({
        ...parse.data,
        email: parse.data.email || null,
        createdByUserId: userId,
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/crm/contacts");
    return { success: true, data: contact };
  } catch (error) {
    console.error("Error creating CRM contact:", error);
    return { success: false, message: "Failed to create contact" };
  }
}

export async function handleUpdateCRMContact(data: CRMContactEditData) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, message: MESSAGES.AUTH.REQUIRED };
  }

  const UpdateContactSchema = z.object({
    id: z.string().min(1, "Contact ID is required"),
    name: z.string().min(1, "Name is required"),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().optional(),
    company: z.string().optional(),
    position: z.string().optional(),
    address: z.string().optional(),
    notes: z.string().optional(),
  });

  const parse = UpdateContactSchema.safeParse(data);

  if (!parse.success) {
    return {
      success: false,
      message: parse.error.errors.map((e) => e.message).join(", "),
    };
  }

  try {
    const { data: contact, error } = await supabaseAdmin
      .from("CRMContact")
      .update({
        ...parse.data,
        email: parse.data.email || null,
        updatedAt: new Date(),
      })
      .eq("id", parse.data.id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/crm/contacts");
    revalidatePath(`/crm/contacts/${parse.data.id}`);
    return { success: true, data: contact };
  } catch (error) {
    console.error("Error updating CRM contact:", error);
    return { success: false, message: "Failed to update contact" };
  }
}

export async function handleDeleteCRMContact(id: string) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, message: MESSAGES.AUTH.REQUIRED };
  }

  try {
    const { error } = await supabaseAdmin
      .from("CRMContact")
      .delete()
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/crm/contacts");
    return { success: true };
  } catch (error) {
    console.error("Error deleting CRM contact:", error);
    return { success: false, message: "Failed to delete contact" };
  }
}

// CRM Lead CRUD

export async function handleCreateCRMLead(data: CRMLeadCreationData) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, message: MESSAGES.AUTH.REQUIRED };
  }

  const CreateLeadSchema = z.object({
    title: z.string().min(1, "Title is required"),
    contactId: z.string().optional(),
    status: z.nativeEnum(CRMLeadStatus).optional(),
    source: z.string().optional(),
    value: z.number().optional(),
    notes: z.string().optional(),
    columnId: z.string().min(1, "Column ID is required"),
    assignedUserId: z.string().optional(),
  });

  const parse = CreateLeadSchema.safeParse(data);

  if (!parse.success) {
    return {
      success: false,
      message: parse.error.errors.map((e) => e.message).join(", "),
    };
  }

  try {
    // Find the maximum order in the column
    const { data: maxOrderLead, error: maxOrderError } = await supabaseAdmin
      .from("CRMLead")
      .select("order")
      .eq("columnId", parse.data.columnId)
      .order("order", { ascending: false })
      .limit(1)
      .single();

    const newOrder = maxOrderLead ? maxOrderLead.order + 1 : 0;

    const { data: lead, error } = await supabaseAdmin
      .from("CRMLead")
      .insert({
        ...parse.data,
        order: newOrder,
        createdByUserId: userId,
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/crm/leads");
    return { success: true, data: lead };
  } catch (error) {
    console.error("Error creating CRM lead:", error);
    return { success: false, message: "Failed to create lead" };
  }
}

export async function handleUpdateCRMLead(data: CRMLeadEditData) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, message: MESSAGES.AUTH.REQUIRED };
  }

  const UpdateLeadSchema = z.object({
    id: z.string().min(1, "Lead ID is required"),
    title: z.string().min(1, "Title is required"),
    contactId: z.string().optional(),
    status: z.nativeEnum(CRMLeadStatus).optional(),
    source: z.string().optional(),
    value: z.number().optional(),
    notes: z.string().optional(),
    columnId: z.string().optional(),
    assignedUserId: z.string().optional(),
  });

  const parse = UpdateLeadSchema.safeParse(data);

  if (!parse.success) {
    return {
      success: false,
      message: parse.error.errors.map((e) => e.message).join(", "),
    };
  }

  try {
    const { data: lead, error } = await supabaseAdmin
      .from("CRMLead")
      .update({
        ...parse.data,
        updatedAt: new Date(),
      })
      .eq("id", parse.data.id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/crm/leads");
    return { success: true, data: lead };
  } catch (error) {
    console.error("Error updating CRM lead:", error);
    return { success: false, message: "Failed to update lead" };
  }
}

export async function handleDeleteCRMLead(id: string) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, message: MESSAGES.AUTH.REQUIRED };
  }

  try {
    const { error } = await supabaseAdmin.from("CRMLead").delete().eq("id", id);

    if (error) throw error;

    revalidatePath("/crm/leads");
    return { success: true };
  } catch (error) {
    console.error("Error deleting CRM lead:", error);
    return { success: false, message: "Failed to delete lead" };
  }
}

// CRM Deal CRUD (similar to leads)

export async function handleCreateCRMDeal(data: CRMDealCreationData) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, message: MESSAGES.AUTH.REQUIRED };
  }

  const CreateDealSchema = z.object({
    title: z.string().min(1, "Title is required"),
    contactId: z.string().optional(),
    leadId: z.string().optional(),
    value: z.number().optional(),
    stage: z.nativeEnum(CRMDealStage).optional(),
    expectedCloseDate: z.date().optional(),
    notes: z.string().optional(),
    columnId: z.string().min(1, "Column ID is required"),
    assignedUserId: z.string().optional(),
  });

  const parse = CreateDealSchema.safeParse(data);

  if (!parse.success) {
    return {
      success: false,
      message: parse.error.errors.map((e) => e.message).join(", "),
    };
  }

  try {
    // Find the maximum order in the column
    const { data: maxOrderDeal, error: maxOrderError } = await supabaseAdmin
      .from("CRMDeal")
      .select("order")
      .eq("columnId", parse.data.columnId)
      .order("order", { ascending: false })
      .limit(1)
      .single();

    const newOrder = maxOrderDeal ? maxOrderDeal.order + 1 : 0;

    const { data: deal, error } = await supabaseAdmin
      .from("CRMDeal")
      .insert({
        ...parse.data,
        order: newOrder,
        createdByUserId: userId,
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/crm/deals");
    return { success: true, data: deal };
  } catch (error) {
    console.error("Error creating CRM deal:", error);
    return { success: false, message: "Failed to create deal" };
  }
}

export async function handleUpdateCRMDeal(data: CRMDealEditData) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, message: MESSAGES.AUTH.REQUIRED };
  }

  const UpdateDealSchema = z.object({
    id: z.string().min(1, "Deal ID is required"),
    title: z.string().min(1, "Title is required"),
    contactId: z.string().optional(),
    leadId: z.string().optional(),
    value: z.number().optional(),
    stage: z.nativeEnum(CRMDealStage).optional(),
    expectedCloseDate: z.date().optional(),
    notes: z.string().optional(),
    columnId: z.string().optional(),
    assignedUserId: z.string().optional(),
  });

  const parse = UpdateDealSchema.safeParse(data);

  if (!parse.success) {
    return {
      success: false,
      message: parse.error.errors.map((e) => e.message).join(", "),
    };
  }

  try {
    const { data: deal, error } = await supabaseAdmin
      .from("CRMDeal")
      .update({
        ...parse.data,
        updatedAt: new Date(),
      })
      .eq("id", parse.data.id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/crm/deals");
    return { success: true, data: deal };
  } catch (error) {
    console.error("Error updating CRM deal:", error);
    return { success: false, message: "Failed to update deal" };
  }
}

export async function handleDeleteCRMDeal(id: string) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, message: MESSAGES.AUTH.REQUIRED };
  }

  try {
    const { error } = await supabaseAdmin.from("CRMDeal").delete().eq("id", id);

    if (error) throw error;

    revalidatePath("/crm/deals");
    return { success: true };
  } catch (error) {
    console.error("Error deleting CRM deal:", error);
    return { success: false, message: "Failed to delete deal" };
  }
}

// CRM Activity CRUD

export async function handleCreateCRMActivity(data: CRMActivityCreationData) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, message: MESSAGES.AUTH.REQUIRED };
  }

  const CreateActivitySchema = z.object({
    type: z.nativeEnum(CRMActivityType),
    content: z.string().optional(),
    contactId: z.string().optional(),
    leadId: z.string().optional(),
    dealId: z.string().optional(),
  });

  const parse = CreateActivitySchema.safeParse(data);

  if (!parse.success) {
    return {
      success: false,
      message: parse.error.errors.map((e) => e.message).join(", "),
    };
  }

  try {
    const { data: activity, error } = await supabaseAdmin
      .from("CRMActivity")
      .insert({
        ...parse.data,
        createdByUserId: userId,
      })
      .select()
      .single();

    if (error) throw error;

    // Revalidate related paths
    if (parse.data.contactId)
      revalidatePath(`/crm/contacts/${parse.data.contactId}`);
    if (parse.data.leadId) revalidatePath("/crm/leads");
    if (parse.data.dealId) revalidatePath("/crm/deals");

    return { success: true, data: activity };
  } catch (error) {
    console.error("Error creating CRM activity:", error);
    return { success: false, message: "Failed to create activity" };
  }
}
