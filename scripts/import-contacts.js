const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: path.join(__dirname, "../.env.local") });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Map owner names to user IDs (you may need to adjust these based on your User table)
const ownerMap = {
  "Uvirco Sales": null, // Set to null for now
  Pierre: null,
  "Dirk Lindeque": null,
};

async function importContacts() {
  const results = [];

  // Read CSV file
  fs.createReadStream(
    path.join(__dirname, "../pipedrive_data/people-11427970-34.csv")
  )
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      console.log(`Parsed ${results.length} contacts from CSV`);

      for (const contact of results) {
        try {
          // Map CSV fields to our table schema
          const contactData = {
            name: contact["Name"]?.trim(),
            email:
              contact["Email - Work"]?.trim() ||
              contact["Email - Home"]?.trim() ||
              contact["Email - Other"]?.trim(),
            phone:
              contact["Phone - Work"]?.trim() ||
              contact["Phone - Mobile"]?.trim() ||
              contact["Phone - Home"]?.trim(),
            company: contact["Organization"]?.trim(),
            organizationId: contact["Organization ID"]?.trim(), // Assuming the column exists
            position: contact["Label"]?.trim(),
            createdAt: contact["Person created"]
              ? new Date(contact["Person created"])
              : new Date(),
            updatedAt: contact["Update time"]
              ? new Date(contact["Update time"])
              : new Date(),
            createdByUserId: ownerMap[contact["Owner"]?.trim()] || null,
            // Optional: Add externalId if you want to store the Pipedrive ID
            // externalId: contact['ID']?.trim(),
          };

          // Skip if name is empty
          if (!contactData.name) {
            console.log(
              `Skipping contact with empty name: ${JSON.stringify(contact)}`
            );
            continue;
          }

          // Insert into CRMContact
          const { data, error } = await supabase
            .from("CRMContact")
            .insert(contactData)
            .select();

          if (error) {
            console.error(
              `Error inserting contact "${contactData.name}":`,
              error
            );
          } else {
            console.log(`Inserted contact: ${contactData.name}`);
          }
        } catch (error) {
          console.error(
            `Error processing contact: ${JSON.stringify(contact)}`,
            error
          );
        }
      }

      console.log("Import completed");
      process.exit(0);
    })
    .on("error", (error) => {
      console.error("Error reading CSV:", error);
      process.exit(1);
    });
}

// Run the import
importContacts();
