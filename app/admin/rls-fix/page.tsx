export default function RLSFixPage() {
  return (
    <div style={{ padding: "20px", fontFamily: "system-ui, -apple-system" }}>
      <h1>🔧 RLS Policy Fix Required</h1>

      <div
        style={{
          backgroundColor: "#fff3cd",
          border: "1px solid #ffc107",
          borderRadius: "4px",
          padding: "15px",
          marginBottom: "20px",
        }}
      >
        <p style={{ margin: 0, marginBottom: "10px" }}>
          <strong>⚠️ Issue:</strong> The CRMDealProduct table RLS policies are
          too restrictive.
        </p>
        <p style={{ margin: 0 }}>
          <strong>Error:</strong> "new row violates row-level security policy"
        </p>
      </div>

      <h2>Solution (Manual - 5 minutes)</h2>

      <ol style={{ lineHeight: "1.8" }}>
        <li>
          <strong>Open Supabase Console</strong>
          <br />
          <a href="https://app.supabase.com" target="_blank" rel="noreferrer">
            https://app.supabase.com
          </a>
          <br />
          Select your project
        </li>

        <li>
          <strong>Go to SQL Editor</strong>
          <br />
          Click "SQL Editor" in the left sidebar
        </li>

        <li>
          <strong>Create New Query</strong>
          <br />
          Click "+ New Query" button
        </li>

        <li>
          <strong>Copy the SQL</strong>
          <br />
          Get it from here:{" "}
          <a href="/api/admin/rls-fix-sql" target="_blank" rel="noreferrer">
            /api/admin/rls-fix-sql
          </a>
          <br />
          Or copy this directly:
          <pre
            style={{
              backgroundColor: "#f5f5f5",
              padding: "10px",
              borderRadius: "4px",
              overflow: "auto",
              fontSize: "12px",
            }}
          >
            {`-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public."CRMDealProduct";
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public."CRMDealProduct";
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public."CRMDealProduct";
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public."CRMDealProduct";
DROP POLICY IF EXISTS "Allow users to read their deal products" ON public."CRMDealProduct";
DROP POLICY IF EXISTS "Allow authenticated users to insert deal products" ON public."CRMDealProduct";
DROP POLICY IF EXISTS "Allow creators to update deal products" ON public."CRMDealProduct";
DROP POLICY IF EXISTS "Allow creators to delete deal products" ON public."CRMDealProduct";

-- Create new permissive policies
CREATE POLICY "Allow authenticated users to read" ON public."CRMDealProduct"
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert" ON public."CRMDealProduct"
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update" ON public."CRMDealProduct"
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete" ON public."CRMDealProduct"
  FOR DELETE USING (auth.role() = 'authenticated');`}
          </pre>
        </li>

        <li>
          <strong>Paste into the SQL Editor</strong>
          <br />
          Clear any existing text and paste the SQL
        </li>

        <li>
          <strong>Execute</strong>
          <br />
          Press <code>Ctrl+Enter</code> (Windows) or <code>Cmd+Enter</code>{" "}
          (Mac)
          <br />
          Wait for "Query Executed Successfully"
        </li>

        <li>
          <strong>Restart Dev Server</strong>
          <br />
          In your terminal:
          <pre
            style={{
              backgroundColor: "#f5f5f5",
              padding: "10px",
              borderRadius: "4px",
            }}
          >
            npm run dev
          </pre>
        </li>

        <li>
          <strong>Test</strong>
          <br />
          Go to a deal and try adding a product
          <br />
          It should now work! ✅
        </li>
      </ol>

      <div
        style={{
          backgroundColor: "#e7f3ff",
          border: "1px solid #0066cc",
          borderRadius: "4px",
          padding: "15px",
          marginTop: "20px",
        }}
      >
        <p style={{ margin: "0 0 10px 0" }}>
          <strong>ℹ️ Note for Production:</strong>
        </p>
        <p style={{ margin: 0 }}>
          These permissive policies are for development. For production, replace
          with role-based access control that validates user's relationship to
          the deal.
        </p>
      </div>
    </div>
  );
}
