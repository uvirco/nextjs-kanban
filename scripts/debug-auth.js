require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Environment variables loaded:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
console.log('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function testAuthFlow() {
  try {
    console.log('\n=== Testing Auth Flow ===');

    const credentials = {
      email: 'admin@company.com',
      password: 'admin123'
    };

    console.log('Testing credentials:', credentials.email);

    // Step 1: Check credentials
    if (!credentials?.email || !credentials?.password) {
      console.log('❌ Missing credentials');
      return null;
    }
    console.log('✅ Credentials provided');

    // Step 2: Query user from database
    console.log('Querying user from database...');
    const { data: user, error } = await supabaseAdmin
      .from("User")
      .select("*")
      .eq("email", credentials.email)
      .single();

    if (error) {
      console.log('❌ Database error:', error.message);
      return null;
    }

    if (!user) {
      console.log('❌ User not found');
      return null;
    }

    console.log('✅ User found:', user.email, user.name);

    // Step 3: Check if user has password and is active
    if (!user.password) {
      console.log('❌ User has no password');
      return null;
    }

    if (!user.isActive) {
      console.log('❌ User is not active');
      return null;
    }

    console.log('✅ User is active and has password');

    // Step 4: Verify password
    console.log('Verifying password...');
    const isValidPassword = await bcrypt.compare(credentials.password, user.password);

    if (!isValidPassword) {
      console.log('❌ Password verification failed');
      return null;
    }

    console.log('✅ Password verified successfully');

    // Step 5: Return user object
    const result = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    console.log('✅ Auth successful, returning user:', result);
    return result;

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    return null;
  }
}

testAuthFlow();