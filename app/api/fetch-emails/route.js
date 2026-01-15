import { NextResponse } from "next/server";
import imaps from "imap-simple";
import { simpleParser } from "mailparser";
import { supabaseAdmin } from "../../../lib/supabase"; // Use admin client

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
      const sinceDate = lastEmailDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      searchCriteria = ['SINCE', sinceDate];
      console.log(`Fetching emails since ${sinceDate}`);
    } else {
      // No emails in database yet, fetch recent ones
      searchCriteria = ['SINCE', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]]; // Last 30 days
      console.log("No existing emails found, fetching from last 30 days");
    }

    const fetchOptions = {
      bodies: [""],
      struct: true,
      envelope: true,
      markSeen: false,
    };

    const messages = await connection.search(searchCriteria, fetchOptions);
    console.log(`Found ${messages.length} new emails to process`);

    if (messages.length === 0) {
      connection.end();
      return NextResponse.json({ message: "No new emails found" }, { status: 200 });
    }

    let emailsProcessed = 0;
    // Process all found emails since we're only getting new ones
    const messagesToProcess = messages;

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
      const { error } = await supabaseAdmin.from("CRMEmail").insert([
        {
          fromEmail: fromEmail,
          toEmail: toEmail,
          subject: subject,
          body: body,
          receivedAt: new Date(envelope.date).toISOString(),
          direction: "INBOUND",
        },
      ]);

      if (error) {
        console.error("Supabase error:", error);
      } else {
        emailsProcessed++;
      }
    }

    connection.end();
    return NextResponse.json(
      { message: `${emailsProcessed} new emails processed from ${messagesToProcess.length} found` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
