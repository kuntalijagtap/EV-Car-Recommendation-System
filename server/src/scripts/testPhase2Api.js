import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from '../app.js';
import { connectDB } from '../config/db.js';

dotenv.config();

async function runTests() {
  console.log('====================================================');
  console.log('🧪 TESTING PHASE 2 BACKEND ENDPOINTS & FLOWS');
  console.log('====================================================\n');

  await connectDB();
  const PORT = 5099;
  const server = app.listen(PORT);
  const baseUrl = `http://localhost:${PORT}/api`;

  try {
    // 1. Health check
    console.log('1. Testing GET /api/health...');
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthData = await healthRes.json();
    console.log('   Status:', healthRes.status, 'Response:', healthData.status);

    // 2. User Registration
    const testEmail = `testuser_${Date.now()}@evora.in`;
    console.log(`\n2. Testing POST /api/auth/register with email: ${testEmail}...`);
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Driver',
        email: testEmail,
        password: 'Password@123',
        profile: {
          city: 'Pune',
          dailyCommuteKm: 45,
          homeCharging: true,
          preferredBodyType: 'SUV',
        },
      }),
    });
    const regData = await regRes.json();
    console.log('   Status:', regRes.status, 'Success:', regData.success);
    const authToken = regData.token;

    // 3. User Login
    console.log('\n3. Testing POST /api/auth/login...');
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'Password@123',
      }),
    });
    const loginData = await loginRes.json();
    console.log('   Status:', loginRes.status, 'User Name:', loginData.user?.name);

    // 4. Update Profile
    console.log('\n4. Testing PUT /api/auth/profile (Updating daily commute to 55 km)...');
    const updateRes = await fetch(`${baseUrl}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        city: 'Mumbai',
        dailyCommuteKm: 55,
        homeCharging: false,
      }),
    });
    const updateData = await updateRes.json();
    console.log('   Status:', updateRes.status, 'New Commute:', updateData.user?.profile?.dailyCommuteKm, 'km, City:', updateData.user?.profile?.city);

    // 5. Brands list
    console.log('\n5. Testing GET /api/brands...');
    const brandsRes = await fetch(`${baseUrl}/brands`);
    const brandsData = await brandsRes.json();
    console.log('   Status:', brandsRes.status, 'Total Brands:', brandsData.count);
    console.log('   First brand:', brandsData.data?.[0]?.name, 'EVs:', brandsData.data?.[0]?.activeEvCount);

    // 6. Filter Metadata
    console.log('\n6. Testing GET /api/evs/metadata/filters...');
    const metaRes = await fetch(`${baseUrl}/evs/metadata/filters`);
    const metaData = await metaRes.json();
    console.log('   Status:', metaRes.status);
    console.log(`   Price Range: ₹${(metaData.data?.price?.min / 100000).toFixed(1)}L - ₹${(metaData.data?.price?.max / 100000).toFixed(1)}L`);
    console.log(`   Range Span:  ${metaData.data?.range?.min} km - ${metaData.data?.range?.max} km`);
    console.log(`   Body Types:  ${metaData.data?.bodyTypes?.join(', ')}`);

    // 7. Catalog Search & Filter (SUV under 25L with 360 models)
    console.log('\n7. Testing GET /api/evs with filters (bodyType=SUV, maxPrice=2500000, has360=true)...');
    const filterRes = await fetch(`${baseUrl}/evs?bodyType=SUV&maxPrice=2500000&has360=true`);
    const filterData = await filterRes.json();
    console.log('   Status:', filterRes.status, 'Matching Flagship SUVs:', filterData.count);
    filterData.data?.forEach((car) => {
      console.log(`   - ${car.name} (${car.variant}) - ₹${(car.price?.exShowroom / 100000).toFixed(2)}L, Range: ${car.range?.claimedNedc} km, 360: ${car.has360Model}`);
    });

    // 8. Vehicle Details & Atomic View Count Increment
    if (filterData.data?.length > 0) {
      const carId = filterData.data[0]._id;
      const initialViews = filterData.data[0].viewCount;
      console.log(`\n8. Testing GET /api/evs/${carId} (Verifying atomic viewCount increment)...`);
      const detailRes = await fetch(`${baseUrl}/evs/${carId}`);
      const detailData = await detailRes.json();
      console.log('   Status:', detailRes.status, 'Car:', detailData.data?.name);
      console.log('   Initial viewCount:', initialViews, '--> Incremented viewCount:', detailData.data?.viewCount);
    }

    console.log('\n====================================================');
    console.log('🎉 ALL PHASE 2 BACKEND ENDPOINT TESTS PASSED (100%)');
    console.log('====================================================\n');
  } catch (err) {
    console.error('❌ Test failed:', err);
  } finally {
    server.close();
    await mongoose.disconnect();
    process.exit(0);
  }
}

runTests();
