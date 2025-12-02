const fetch = require('node-fetch');

async function testEpicRolesAPI() {
  const baseURL = 'http://localhost:3000/api/admin/epic-roles';

  try {
    console.log('Testing GET /api/admin/epic-roles...');
    const response = await fetch(baseURL);
    const data = await response.json();

    if (response.ok) {
      console.log('✅ GET successful!');
      console.log(`Found ${data.length} epic roles`);
      console.log('Sample roles:', data.slice(0, 3).map(r => `${r.name} (${r.category})`));
    } else {
      console.log('❌ GET failed:', data);
    }

    // Test creating a new role
    console.log('\nTesting POST /api/admin/epic-roles...');
    const newRole = {
      name: 'Test Role',
      category: 'other',
      sortOrder: 999
    };

    const postResponse = await fetch(baseURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRole)
    });

    const postData = await postResponse.json();

    if (postResponse.ok) {
      console.log('✅ POST successful!');
      console.log('Created role:', postData);
    } else {
      console.log('❌ POST failed:', postData);
    }

  } catch (error) {
    console.error('Error testing API:', error.message);
  }
}

testEpicRolesAPI();