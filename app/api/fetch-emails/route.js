import { NextResponse } from "next/server";
import imaps from "imap-simple";
import { simpleParser } from "mailparser";
import { supabaseAdmin } from "../../../lib/supabase"; // Use admin client

// Extract deal ID from email subject line
// Supports formats: #123, Deal #123, Deal 123, [Deal 123], [#123]
function extractDealId(subject) {
  if (!subject) return null;
  
  // Pattern 1: #123
  let match = subject.match(/#(\d+)/);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  
  // Pattern 2: Deal #123 or Deal 123
  match = subject.match(/deal\s*#?(\d+)/i);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  
  // Pattern 3: [Deal 123] or [#123]
  match = subject.match(/\[(?:deal\s*)?#?(\d+)\]/i);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  
  return null;
}

export async function POST(request) {
  try {
    let configData = {};
    try {
      configData = await request.json();
    } catch (e) {
      // No body provided, use defaults
    }

    const {
      host = "imap.gmail.com",
      port = 993,
      user = process.env.GMAIL_USER,
      pass = process.env.GMAIL_PASS,
      tls = true,
    } = configData;

    console.log("IMAP Config:", {
      host,
      port,
      user: user ? user : "not set",
      pass: pass ? "***" : "not set",
      tls,
    });

    const config = {
      imap: {
        user: user,
        password: pass,
        host: host,
        port: port,
        tls: true,
        tlsOptions: { rejectUnauthorized: false, servername: "imap.gmail.com" },
      },
    };

    const connection = await imaps.connect(config);
    console.log("Connected to IMAP");

    const box = await connection.openBox("INBOX");
    console.log("Opened INBOX");

    // Get the most recent email date from database to only fetch newer emails
    const { data: lastEmail } = await supabaseAdmin
      .from("CRMEmail")
      .select("receivedAt")
      .order("receivedAt", { ascending: false })
      .limit(1)
      .single();

    let searchCriteria;
    if (lastEmail && lastEmail.receivedAt) {
      // Fetch emails newer than the last one we have
      const lastEmailDate = new Date(lastEmail.receivedAt);
      // Add 1 second to avoid fetching the same email again
      lastEmailDate.setSeconds(lastEmailDate.getSeconds() + 1);
      
      // Use ALL and filter later - SINCE has syntax issues with imap-simple
      searchCriteria = ['ALL'];
      console.log(`Fetching all emails (will filter to those after ${lastEmailDate.toISOString()})`);
    } else {
      // No emails in database yet, fetch all emails
      searchCriteria = ['ALL'];
      console.log(`No existing emails found, fetching all emails`);
    }

    const fetchOptions = {
      bodies: [""],
      struct: true,
      envelope: true,
      markSeen: false,
    };

    const messages = await connection.search(searchCriteria, fetchOptions);
    console.log(`Found ${messages.length} emails from server`);

    // Filter messages by date if we have a last email date
    let messagesToProcess = messages;
    if (lastEmail) {
      const lastEmailTime = new Date(lastEmail.receivedAt).getTime();
      messagesToProcess = messages.filter((message) => {
        const messageDate = message.attributes?.date;
        if (!messageDate) return false;
        return new Date(messageDate).getTime() > lastEmailTime;
      });
      console.log(`Filtered to ${messagesToProcess.length} new emails (after ${lastEmail.receivedAt})`);
    }

    if (messagesToProcess.length === 0) {
      connection.end();
      return NextResponse.json({ message: "No new emails found" }, { status: 200 });
    }

    let emailsProcessed = 0;
    let emailsLinked = 0;

    for (const message of messagesToProcess) {
      const envelope = message.attributes?.envelope;
      if (!envelope) {
        console.log("Skipping message without envelope");
        continue;
      }

      console.log("Processing email:", envelope.subject);

      // Parse the full message
      let fromEmail = "";
      let toEmail = "";
      let subject = "No Subject";
      let body = "";

      try {
        if (message.parts && message.parts.length > 0) {
          const fullMessage = message.parts[0].body;
          const parsed = await simpleParser(fullMessage);
          fromEmail = parsed.from?.text || "";
          toEmail = parsed.to?.text || "";
          subject = parsed.subject || "No Subject";
          body = parsed.text || parsed.html || "";
        }
      } catch (parseError) {
        console.error("Parse error:", parseError);
        body = "Error parsing email";
      }

      // Insert the new email (no duplicate check needed since we're only fetching newer emails)
      
      // Try to auto-link email to deal based on subject line
      console.log(`Processing email subject: "${subject}"`);
      const dealNumber = extractDealId(subject);
      console.log(`Extracted deal number: ${dealNumber}`);
      let dealId = null;
      
      if (dealNumber) {
        console.log(`Found deal reference #${dealNumber} in subject: "${subject}"`);
        
        const { data: deal, error: dealError } = await supabaseAdmin
          .from("CRMDeal")
          .select("deal_id")
          .eq("deal_id", dealNumber)
          .single();
        
        console.log(`Database query result:`, { deal, dealError });
        
        if (deal && !dealError) {
          dealId = deal.deal_id; // CRMEmail.dealId references CRMDeal.deal_id (INTEGER)
          emailsLinked++;
          console.log(`✅ Auto-linked email to Deal #${dealNumber} (deal_id: ${dealId})`);
        } else {
          console.warn(`⚠️ Deal #${dealNumber} not found in database`, dealError);
        }
      } else {
        console.log(`No deal reference found in subject`);
      }
      
      const emailDate = new Date(envelope.date).toISOString();
      const { data: insertedEmail, error } = await supabaseAdmin.from("CRMEmail").insert([
        {
          fromEmail: fromEmail,
          toEmail: toEmail,
          subject: subject,
          body: body,
          receivedAt: emailDate,
          direction: "INBOUND",
          dealId: dealId, // Auto-linked deal ID if found
          isRead: false,
          status: "ACTIVE"
        },
      ]).select();

      if (error) {
        console.error("Supabase error:", error);
      } else {
        emailsProcessed++;
        
        // If email was linked to a deal, log it as an activity
        if (dealId && insertedEmail && insertedEmail[0]) {
          await supabaseAdmin.from("CRMActivity").insert({
            type: "EMAIL",
            content: `Email received: ${subject}`,
            dealId: dealId,
            createdAt: emailDate, // Use email's date, not current time
          });
        }
      }
    }

    connection.end();
    
    // Count how many emails were auto-linked
    const { data: recentEmails } = await supabaseAdmin
      .from("CRMEmail")
      .select("id, dealId")
      .order("receivedAt", { ascending: false })
      .limit(emailsProcessed);
    
    const linkedCount = recentEmails?.filter(e => e.dealId).length || 0;
    const unlinkedCount = emailsProcessed - linkedCount;
    
    return NextResponse.json(
      { 
        message: `${emailsProcessed} new emails processed from ${messagesToProcess.length} found`,
        linked: linkedCount,
        unlinked: unlinkedCount,
        details: `${linkedCount} auto-linked to deals, ${unlinkedCount} require manual linking`
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
