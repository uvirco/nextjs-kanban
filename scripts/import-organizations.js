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

async function importOrganizations() {
  const results = [];

  // Read CSV file
  fs.createReadStream(
    path.join(__dirname, "../pipedrive_data/organizations-11427970-33.csv")
  )
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      console.log(`Parsed ${results.length} organizations from CSV`);

      for (const org of results) {
        try {
          // Map CSV fields to our table schema
          const organizationData = {
            name: org["Name"]?.trim(),
            address: org["Full/combined address of Address"]?.trim(),
            website: org["Website"]?.trim(),
            industry: org["Industry"]?.trim(),
            annualRevenue: org["Annual revenue"]
              ? parseFloat(org["Annual revenue"])
              : null,
            numberOfEmployees: org["Number of employees"]
              ? parseInt(org["Number of employees"])
              : null,
            countryCode: org["Country Code"]?.trim(),
            createdAt: org["Organization created"]
              ? new Date(org["Organization created"])
              : new Date(),
            updatedAt: org["Update time"]
              ? new Date(org["Update time"])
              : new Date(),
            assignedUserId: ownerMap[org["Owner"]?.trim()] || null,
            // Optional: Add externalId if you want to store the Pipedrive ID
            // externalId: org['ID']?.trim(),
          };

          // Skip if name is empty
          if (!organizationData.name) {
            console.log(
              `Skipping organization with empty name: ${JSON.stringify(org)}`
            );
            continue;
          }

          // Insert into CRMOrganization
          const { data, error } = await supabase
            .from("CRMOrganization")
            .insert(organizationData)
            .select();

          if (error) {
            console.error(
              `Error inserting organization "${organizationData.name}":`,
              error
            );
          } else {
            console.log(`Inserted organization: ${organizationData.name}`);
          }
        } catch (error) {
          console.error(
            `Error processing organization: ${JSON.stringify(org)}`,
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
importOrganizations();
