// CRM Types

export enum CRMLeadStatus {
  NEW = "New",
  CONTACTED = "Contacted",
  QUALIFIED = "Qualified",
  PROPOSAL = "Proposal",
  NEGOTIATION = "Negotiation",
  CLOSED_WON = "Closed Won",
  CLOSED_LOST = "Closed Lost",
}

export enum CRMDealStage {
  PROSPECTING = "Prospecting",
  QUALIFICATION = "Qualification",
  PROPOSAL = "Proposal",
  NEGOTIATION = "Negotiation",
  CLOSED_WON = "Closed Won",
  CLOSED_LOST = "Closed Lost",
}

export enum CRMActivityType {
  CALL = "CALL",
  EMAIL = "EMAIL",
  MEETING = "MEETING",
  NOTE = "NOTE",
  STAGE_CHANGE = "STAGE_CHANGE",
}

export enum CRMEmailDirection {
  INBOUND = "INBOUND",
  OUTBOUND = "OUTBOUND",
}

export interface CRMContact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  organizationId?: string;
  position?: string;
  address?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdByUserId?: string;
}

export interface CRMLead {
  id: string;
  title: string;
  contactId?: string;
  contact?: CRMContact;
  status: CRMLeadStatus;
  source?: string;
  value?: number;
  notes?: string;
  columnId: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  createdByUserId?: string;
  assignedUserId?: string;
  assignedUser?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CRMDeal {
  id: string;
  deal_id: number;
  title: string;
  contactId?: string;
  contact?: CRMContact;
  leadId?: string;
  lead?: CRMLead;
  value?: number;
  stage: string;
  expectedCloseDate?: Date;
  notes?: string;
  columnId?: string;
  boardId?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  createdByUserId?: string;
  assignedUserId?: string;
  assignedUser?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CRMActivity {
  id: string;
  type: CRMActivityType;
  content?: string;
  contactId?: string;
  leadId?: string;
  dealId?: string;
  createdAt: Date;
  createdByUserId?: string;
  createdByUser?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CRMEmail {
  id: string;
  userId?: string;
  dealId?: number;
  deal?: CRMDeal;
  leadId?: string;
  lead?: CRMLead;
  contactId?: string;
  contact?: CRMContact;
  subject?: string;
  body?: string;
  fromEmail?: string;
  toEmail?: string;
  ccEmails?: string[];
  sentAt?: Date;
  receivedAt?: Date;
  direction: CRMEmailDirection;
  emailProviderId?: string;
  threadId?: string;
  createdAt: Date;
  attachments?: CRMEmailAttachment[];
  isRead?: boolean;
  status?: string;
}

export interface CRMEmailAttachment {
  id: string;
  emailId: string;
  filename: string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
  createdAt: Date;
}

// Board-like structures for CRM
export interface CRMColumn {
  id: string;
  title: string;
  boardId: string; // For leads or deals board
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CRMBoard {
  id: string;
  title: string;
  type: "leads" | "deals";
  description?: string;
  backgroundUrl?: string;
  isDefault?: boolean;
  createdByUserId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CRMColumnWithLeads extends CRMColumn {
  leads: CRMLead[];
}

export interface CRMBoardWithColumns extends CRMBoard {
  columns: CRMColumnWithLeads[];
}

export interface CRMColumnWithDeals extends CRMColumn {
  deals: CRMDeal[];
}

export interface CRMBoardWithColumnsDeals extends CRMBoard {
  columns: CRMColumnWithDeals[];
}

// Form types
export type CRMContactCreationData = {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  address?: string;
  notes?: string;
};

export type CRMContactEditData = CRMContactCreationData & {
  id: string;
};

export type CRMLeadCreationData = {
  title: string;
  contactId?: string;
  status?: CRMLeadStatus;
  source?: string;
  value?: number;
  notes?: string;
  columnId: string;
  assignedUserId?: string;
};

export type CRMLeadEditData = CRMLeadCreationData & {
  id: string;
};

export type CRMDealCreationData = {
  title: string;
  contactId?: string;
  leadId?: string;
  value?: number;
  stage?: CRMDealStage;
  expectedCloseDate?: Date;
  notes?: string;
  columnId: string;
  assignedUserId?: string;
};

export type CRMDealEditData = CRMDealCreationData & {
  id: string;
};

export type CRMActivityCreationData = {
  type: CRMActivityType;
  content?: string;
  contactId?: string;
  leadId?: string;
  dealId?: string;
};

export type CRMEmailCreationData = {
  dealId?: string;
  leadId?: string;
  contactId?: string;
  subject: string;
  body: string;
  fromEmail: string;
  toEmail: string;
  ccEmails?: string[];
  sentAt?: Date;
  direction: CRMEmailDirection;
  emailProviderId?: string;
  threadId?: string;
};

export type CRMEmailAttachmentCreationData = {
  emailId: string;
  filename: string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
};
