import { NextResponse } from "next/server";
import imaps from "imap-simple";
import { simpleParser } from "mailparser";
import { supabase } from "../../../lib/supabase"; // Adjust path

export async function POST(request) {
  try {
    const {
      host = "imap.gmail.com",
      port = 993,
      user = process.env.GMAIL_USER,
      pass = process.env.GMAIL_PASS,
      tls = true,
    } = await request.json(); // Use env vars as defaults

    console.log("IMAP Config:", {
      host,
      port,
      user: user ? "set" : "not set",
      pass: pass ? "set" : "not set",
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

    const searchCriteria = ["UNSEEN"];
    const fetchOptions = {
      bodies: [""],
      struct: true,
      envelope: true,
      markSeen: false,
    };

    const messages = await connection.search(searchCriteria, fetchOptions);
    console.log(`Found ${messages.length} unread emails`);

    if (messages.length === 0) {
      connection.end();
      return NextResponse.json({ message: "No new emails" }, { status: 200 });
    }

    let emailsProcessed = 0;
    for (const message of messages) {
      const envelope = message.attributes?.envelope;
      if (!envelope) {
        console.log("Skipping message without envelope");
        continue;
      }

      console.log("Envelope:", JSON.stringify(envelope, null, 2));

      // Parse the full message
      let fromEmail = "";
      let toEmail = "";
      let subject = "No Subject";
      let body = "";

      try {
        console.log("Parts:", JSON.stringify(message.parts, null, 2));
        if (message.parts && message.parts.length > 0) {
          const fullMessage = message.parts[0].body; // Full message body
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

      const { error } = await supabase.from("CRMEmail").insert([
        {
          fromEmail: fromEmail,
          toEmail: toEmail,
          subject: subject,
          body: body,
          receivedAt: new Date().toISOString(),
          direction: "inbound",
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
      { message: `${emailsProcessed} emails processed` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
