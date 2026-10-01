import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import {
  User,
  Brand,
  EV,
  Review,
  ReviewVote,
  Wishlist,
  Conversation,
  ChargingStation,
  OwnershipClaim,
} from '../models/index.js';
import { loadKaggleCsv } from '../utils/csvLoader.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/evora';

// Default brands in Indian EV ecosystem
const BRANDS_DATA = [
  {
    name: 'Tata Motors',
    originCountry: 'India',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Tata_logo.svg',
    website: 'https://ev.tatamotors.com',
    description: 'India’s pioneer and market leader in electric mobility with the Gen 2 & Gen 3 acti.ev architecture.',
    supportContact: '1800 209 8282',
  },
  {
    name: 'MG Motor',
    originCountry: 'UK / China',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/MG_Motor_logo.svg',
    website: 'https://www.mgmotor.co.in',
    description: 'Innovator in smart connected electric vehicles featuring BaaS (Battery as a Service) models.',
    supportContact: '1800 100 6464',
  },
  {
    name: 'Mahindra Electric',
    originCountry: 'India',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/Mahindra_Auto_new_logo.png',
    website: 'https://auto.mahindra.com',
    description: 'Homegrown SUV specialist pioneering born-electric INGLO architecture vehicles.',
    supportContact: '1800 209 6006',
  },
  {
    name: 'Hyundai',
    originCountry: 'South Korea',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Hyundai_Motor_Company_logo.svg',
    website: 'https://www.hyundai.com/in',
    description: 'Global leader bringing high-speed 800V E-GMP electric architecture to India.',
    supportContact: '1800 11 4645',
  },
  {
    name: 'BYD',
    originCountry: 'China',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6c/BYD_Company_logo.svg',
    website: 'https://bydautoindia.com',
    description: 'World’s foremost EV and ultra-safe Blade Battery technology pioneer.',
    supportContact: '1800 209 8888',
  },
  {
    name: 'Kia',
    originCountry: 'South Korea',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/47/Kia_logo.svg',
    website: 'https://www.kia.com/in',
    description: 'Cutting edge performance electric mobility with ultra-rapid charging capabilities.',
    supportContact: '1800 108 5000',
  },
  {
    name: 'BMW',
    originCountry: 'Germany',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/44/BMW.svg',
    website: 'https://www.bmw.in',
    description: 'Luxury German electric powerhouse leading premium EV sales in India with the i-Series.',
    supportContact: '1800 102 2269',
  },
  {
    name: 'Volvo',
    originCountry: 'Sweden',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Volvo-Iron-Mark-Black.svg',
    website: 'https://www.volvocars.com/in',
    description: 'Scandinavian safety and luxury with all-electric twin-motor powertrains.',
    supportContact: '1800 102 9100',
  },
  {
    name: 'Mercedes-Benz',
    originCountry: 'Germany',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/90/Mercedes-Logo.svg',
    website: 'https://www.mercedes-benz.co.in',
    description: 'The pinnacle of luxury luxury electric engineering under the EQ badge.',
    supportContact: '000 800 050 1888',
  },
  {
    name: 'Citroen',
    originCountry: 'France',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/af/Citro%C3%ABn_2022.svg',
    website: 'https://www.citroen.in',
    description: 'French comfort focused on affordable urban electric motoring with Advanced Comfort suspension.',
    supportContact: '1800 267 1000',
  },
];

// Sample public charging stations across India
const CHARGING_STATIONS_DATA = [
  {
    name: 'Tata Power EZ Charge - Phoenix Marketcity',
    operator: 'Tata Power EZ Charge',
    location: { type: 'Point', coordinates: [73.9168, 18.5621] }, // [lng, lat] Pune
    address: 'Phoenix Marketcity, Viman Nagar, Pune, Maharashtra 411014',
    city: 'Pune',
    state: 'Maharashtra',
    connectorTypes: ['CCS2', 'Type 2', '15A Socket'],
    powerKw: 60,
    totalPorts: 4,
    availablePorts: 3,
    costPerKwh: 19.5,
    openHours: '24x7',
    amenities: ['Mall', 'Food Court', 'Washroom', 'Cinema', 'Free Wi-Fi'],
  },
  {
    name: 'Jio-bp pulse - Baner Highway Station',
    operator: 'Jio-bp pulse',
    location: { type: 'Point', coordinates: [73.7844, 18.5597] }, // Pune Baner
    address: 'Near Balewadi High Street, Mumbai-Bangalore Highway, Baner, Pune',
    city: 'Pune',
    state: 'Maharashtra',
    connectorTypes: ['CCS2', 'GB/T'],
    powerKw: 120,
    totalPorts: 6,
    availablePorts: 4,
    costPerKwh: 21.0,
    openHours: '24x7',
    amenities: ['Wild Bean Cafe', 'Restroom', 'Convenience Store', 'Air Pump'],
  },
  {
    name: 'Kazam Supercharger - Kothrud Depot',
    operator: 'Kazam',
    location: { type: 'Point', coordinates: [73.8058, 18.5074] }, // Pune Kothrud
    address: 'Near Karve Statue, Kothrud, Pune 411038',
    city: 'Pune',
    state: 'Maharashtra',
    connectorTypes: ['CCS2', 'Type 2', '15A Socket'],
    powerKw: 30,
    totalPorts: 2,
    availablePorts: 2,
    costPerKwh: 17.0,
    openHours: '06:00 - 23:00',
    amenities: ['Chai Point', 'ATM', 'Parking'],
  },
  {
    name: 'Tata Power Fast Hub - Bandra Kurla Complex',
    operator: 'Tata Power EZ Charge',
    location: { type: 'Point', coordinates: [72.8687, 19.0657] }, // Mumbai BKC
    address: 'G Block, Bandra Kurla Complex, Bandra East, Mumbai 400051',
    city: 'Mumbai',
    state: 'Maharashtra',
    connectorTypes: ['CCS2', 'CHAdeMO', 'Type 2'],
    powerKw: 150,
    totalPorts: 8,
    availablePorts: 5,
    costPerKwh: 22.5,
    openHours: '24x7',
    amenities: ['Starbucks', 'Executive Lounge', 'Valet', 'Restroom'],
  },
  {
    name: 'Fortum Charge & Drive - Oberoi Mall',
    operator: 'Fortum',
    location: { type: 'Point', coordinates: [72.8601, 19.1741] }, // Mumbai Goregaon
    address: 'Western Express Hwy, Yashodham, Goregaon, Mumbai 400063',
    city: 'Mumbai',
    state: 'Maharashtra',
    connectorTypes: ['CCS2', 'Type 2'],
    powerKw: 60,
    totalPorts: 4,
    availablePorts: 2,
    costPerKwh: 18.5,
    openHours: '10:00 - 23:00',
    amenities: ['Shopping Mall', 'Food Court', 'Cinema'],
  },
  {
    name: 'Jio-bp pulse Hub - Navi Mumbai Palm Beach',
    operator: 'Jio-bp pulse',
    location: { type: 'Point', coordinates: [73.0031, 19.0434] }, // Navi Mumbai
    address: 'Palm Beach Road, Sanpada, Navi Mumbai 400705',
    city: 'Mumbai',
    state: 'Maharashtra',
    connectorTypes: ['CCS2', 'GB/T'],
    powerKw: 120,
    totalPorts: 4,
    availablePorts: 3,
    costPerKwh: 20.0,
    openHours: '24x7',
    amenities: ['Cafe', 'Car Wash', 'Restroom'],
  },
  {
    name: 'Bescom EV Smart Hub - Indiranagar',
    operator: 'Bescom',
    location: { type: 'Point', coordinates: [77.6412, 12.9784] }, // Bengaluru
    address: '100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru 560038',
    city: 'Bengaluru',
    state: 'Karnataka',
    connectorTypes: ['CCS2', 'Type 2', '15A Socket'],
    powerKw: 50,
    totalPorts: 4,
    availablePorts: 3,
    costPerKwh: 16.5,
    openHours: '24x7',
    amenities: ['Restaurants', 'Shopping', 'Coffee Shop'],
  },
  {
    name: 'Tata Power EZ Charge - Electronic City Phase 1',
    operator: 'Tata Power EZ Charge',
    location: { type: 'Point', coordinates: [77.6648, 12.8452] }, // Bengaluru
    address: 'Near Infosys Gate 1, Electronic City Phase 1, Bengaluru 560100',
    city: 'Bengaluru',
    state: 'Karnataka',
    connectorTypes: ['CCS2', 'Type 2'],
    powerKw: 60,
    totalPorts: 4,
    availablePorts: 2,
    costPerKwh: 18.0,
    openHours: '24x7',
    amenities: ['Tech Park Canteen', 'Restroom', 'ATM'],
  },
  {
    name: 'Statiq Hypercharger - Cyber City',
    operator: 'Statiq',
    location: { type: 'Point', coordinates: [77.0888, 28.4952] }, // Delhi NCR Gurgaon
    address: 'DLF Cyber City, Building 10, Sector 24, Gurugram 122002',
    city: 'Delhi NCR',
    state: 'Haryana',
    connectorTypes: ['CCS2', 'Type 2'],
    powerKw: 120,
    totalPorts: 6,
    availablePorts: 4,
    costPerKwh: 21.0,
    openHours: '24x7',
    amenities: ['CyberHub Eateries', 'Restrooms', 'Security'],
  },
  {
    name: 'Tata Power Hub - Connaught Place',
    operator: 'Tata Power EZ Charge',
    location: { type: 'Point', coordinates: [77.2197, 28.6315] }, // Central Delhi
    address: 'Outer Circle, Near Shivaji Stadium Metro, Connaught Place, New Delhi',
    city: 'Delhi NCR',
    state: 'Delhi',
    connectorTypes: ['CCS2', 'Type 2', 'GB/T'],
    powerKw: 60,
    totalPorts: 4,
    availablePorts: 3,
    costPerKwh: 19.0,
    openHours: '24x7',
    amenities: ['Metro Station', 'Cafes', 'Tourist Area'],
  },
  {
    name: 'Jio-bp pulse - Gachibowli Financial District',
    operator: 'Jio-bp pulse',
    location: { type: 'Point', coordinates: [78.3489, 17.4399] }, // Hyderabad
    address: 'ISB Road, Financial District, Nanakramguda, Hyderabad 500032',
    city: 'Hyderabad',
    state: 'Telangana',
    connectorTypes: ['CCS2', 'Type 2'],
    powerKw: 60,
    totalPorts: 4,
    availablePorts: 2,
    costPerKwh: 19.5,
    openHours: '24x7',
    amenities: ['Wild Bean Cafe', 'Restroom', 'Convenience Store'],
  },
  {
    name: 'Tata Power EZ Charge - HITEC City Cyber Towers',
    operator: 'Tata Power EZ Charge',
    location: { type: 'Point', coordinates: [78.3772, 17.4504] }, // Hyderabad
    address: 'Cyber Towers, HITEC City, Madhapur, Hyderabad 500081',
    city: 'Hyderabad',
    state: 'Telangana',
    connectorTypes: ['CCS2', 'GB/T', '15A Socket'],
    powerKw: 50,
    totalPorts: 4,
    availablePorts: 3,
    costPerKwh: 18.0,
    openHours: '24x7',
    amenities: ['Food Court', 'Metro Access', 'ATM'],
  },
];

// Rich interactive 360 hotspots for flagship models
function getHotspotsForVehicle(fullName) {
  const name = fullName.toLowerCase();
  if (name.includes('nexon')) {
    return [
      {
        id: 'hs_nexon_port',
        viewType: 'exterior',
        name: 'CCS2 Fast Charging Port',
        category: 'charging_port',
        coordinates: { yaw: 90, pitch: -10 },
        title: 'Front Fender CCS2 Port',
        description: 'Illuminated smart charging flap with charge level indicator. Supports up to 50kW DC fast charging (10-80% in 40 mins).',
        specHighlight: '50kW Max DC Fast Charging | V2V & V2L Power Bank Capability',
      },
      {
        id: 'hs_nexon_battery',
        viewType: 'exterior',
        name: 'acti.ev Structural Battery Pack',
        category: 'battery_pack',
        coordinates: { yaw: 0, pitch: -30 },
        title: '45 kWh High Density LFP Battery',
        description: 'IP67 rated liquid-cooled lithium-iron-phosphate battery pack with structural floor integration.',
        specHighlight: '45 kWh Capacity | IP67 Water Ingress Protection | 8 Yrs / 160,000 km Warranty',
      },
      {
        id: 'hs_nexon_cockpit',
        viewType: 'interior',
        name: 'Cinematic Touchscreen & Cockpit',
        category: 'infotainment',
        coordinates: { yaw: 180, pitch: 5 },
        title: '12.3-inch Cinematic Infotainment by HARMAN',
        description: 'Ultra-crisp 12.3-inch display with wireless Android Auto & Apple CarPlay, arcade apps, and voice assistant.',
        specHighlight: '12.3" Screen | JBL 9-Speaker Audio with Subwoofer | Voice Controlled Sunroof',
      },
      {
        id: 'hs_nexon_boot',
        viewType: 'exterior',
        name: 'Family Cargo Boot Space',
        category: 'boot_space',
        coordinates: { yaw: 270, pitch: -5 },
        title: '350 Litres Boot Capacity',
        description: 'Accommodates 3 full-size suitcases with 60:40 rear split-folding seats expanding cargo to 690 litres.',
        specHighlight: '350L Deep Luggage Capacity with Tyre Mobility Kit Stored Under Floor',
      },
    ];
  }
  if (name.includes('windsor')) {
    return [
      {
        id: 'hs_windsor_lounge',
        viewType: 'interior',
        name: 'Aero Lounge Luxury Seating',
        category: 'infotainment',
        coordinates: { yaw: 180, pitch: 0 },
        title: '135° Reclining Aero Lounge Seats',
        description: 'First-in-class rear sofa-like business class comfort reclining up to 135 degrees with quilted faux leather.',
        specHighlight: '135° Extreme Recline | Grand View Glass Roof | 15.6" GrandView Display',
      },
      {
        id: 'hs_windsor_battery',
        viewType: 'exterior',
        name: 'Prismatic LFP Battery with BaaS',
        category: 'battery_pack',
        coordinates: { yaw: 0, pitch: -35 },
        title: '38 kWh Prismatic Cell Battery',
        description: 'High thermal stability cells eligible for MG’s innovative Battery-as-a-Service rental programme.',
        specHighlight: '38 kWh Pack | Lifetime Battery Warranty for 1st Owner | 332 km ARAI Range',
      },
      {
        id: 'hs_windsor_boot',
        viewType: 'exterior',
        name: 'Massive Aero Boot',
        category: 'boot_space',
        coordinates: { yaw: 270, pitch: -10 },
        title: '604 Litres Giant Luggage Capacity',
        description: 'Segment-leading boot space fitting 5 large cabin suitcases with a low loading lip.',
        specHighlight: '604 Litres Segment Best Boot Space',
      },
    ];
  }
  if (name.includes('ioniq 5')) {
    return [
      {
        id: 'hs_ioniq_charging',
        viewType: 'exterior',
        name: '800V Ultra-Fast Charging Architecture',
        category: 'charging_port',
        coordinates: { yaw: 90, pitch: -5 },
        title: 'Patented 800V Multi-Charging System',
        description: 'Charges from 10% to 80% in an astonishing 18 minutes on 350kW DC chargers.',
        specHighlight: '350 kW DC Charging Ready | 10% to 80% in 18 minutes | V2L bi-directional charging',
      },
      {
        id: 'hs_ioniq_interior',
        viewType: 'interior',
        name: 'Universal Island & Living Space',
        category: 'infotainment',
        coordinates: { yaw: 180, pitch: 0 },
        title: 'Sliding Universal Island Console',
        description: 'Center console slides backwards by 140 mm with eco-processed leather and magnetic dashboard pins.',
        specHighlight: 'Dual 12.3" Panoramic Displays | Bose 8-Speaker Audio | Augmented Reality HUD',
      },
    ];
  }
  if (name.includes('seal')) {
    return [
      {
        id: 'hs_seal_ctb',
        viewType: 'exterior',
        name: 'CTB (Cell-to-Body) Structural Architecture',
        category: 'battery_pack',
        coordinates: { yaw: 0, pitch: -25 },
        title: 'BYD Blade Cell-to-Body Technology',
        description: 'The Blade Battery is integrated into the vehicle structure, achieving 40,500 Nm/deg torsional stiffness.',
        specHighlight: '82.56 kWh Blade Battery | 0-100 km/h in 3.8s | 580 km Range | 5-Star Euro NCAP',
      },
    ];
  }
  // Generic flagship hotspots
  return [
    {
      id: `hs_${name.replace(/\s+/g, '_')}_port`,
      viewType: 'exterior',
      name: 'Smart Fast Charging Port',
      category: 'charging_port',
      coordinates: { yaw: 90, pitch: -10 },
      title: 'CCS2 Fast Charging Port',
      description: 'Supports high power DC fast charging with intelligent battery thermal management.',
      specHighlight: 'Standard CCS2 Combo Connector with automated locking actuator',
    },
    {
      id: `hs_${name.replace(/\s+/g, '_')}_interior`,
      viewType: 'interior',
      name: 'High-Tech Digital Cockpit',
      category: 'infotainment',
      coordinates: { yaw: 180, pitch: 0 },
      title: 'Digital Instrument Cluster & Touchscreen',
      description: 'Connected navigation, real-time energy flow monitor, and customizable driving modes.',
      specHighlight: 'Regenerative braking paddle shifters and live trip analytics',
    },
  ];
}

async function seed() {
  console.log('====================================================');
  console.log('🌱 Starting EVora Database Seed (Phase 1)');
  console.log('====================================================\n');

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB.');

    // Step 1: Clean existing collections
    console.log('🧹 Purging old data...');
    await Promise.all([
      User.deleteMany({}),
      Brand.deleteMany({}),
      EV.deleteMany({}),
      Review.deleteMany({}),
      ReviewVote.deleteMany({}),
      Wishlist.deleteMany({}),
      Conversation.deleteMany({}),
      ChargingStation.deleteMany({}),
      OwnershipClaim.deleteMany({}),
    ]);
    console.log('✅ Cleared all 9 collections.');

    // Step 2: Seed Brands
    console.log('\n🏷️  Seeding Brands...');
    const insertedBrands = await Brand.insertMany(BRANDS_DATA);
    const brandMap = new Map();
    insertedBrands.forEach((b) => brandMap.set(b.name.toLowerCase(), b._id));
    console.log(`✅ Seeded ${insertedBrands.length} Brands.`);

    // Step 3: Seed Users (Admin + regular test users)
    console.log('\n👥 Seeding Users...');
    const users = await User.create([
      {
        name: 'Admin EVora',
        email: 'admin@evora.in',
        password: 'Admin@12345',
        role: 'admin',
        profile: {
          city: 'Pune',
          monthlyBudget: 50000,
          dailyCommuteKm: 50,
          familySize: 4,
          homeCharging: true,
          preferredBodyType: 'SUV',
        },
      },
      {
        name: 'Kuntali Jagtap',
        email: 'kuntali@evora.in',
        password: 'User@12345',
        role: 'user',
        profile: {
          city: 'Pune',
          monthlyBudget: 25000,
          dailyCommuteKm: 35,
          familySize: 4,
          homeCharging: true,
          preferredBodyType: 'SUV',
        },
      },
      {
        name: 'Rahul Sharma',
        email: 'rahul@evora.in',
        password: 'User@12345',
        role: 'user',
        profile: {
          city: 'Mumbai',
          monthlyBudget: 35000,
          dailyCommuteKm: 65,
          familySize: 5,
          homeCharging: false,
          preferredBodyType: 'Sedan',
        },
      },
      {
        name: 'Ananya Deshmukh',
        email: 'ananya@evora.in',
        password: 'User@12345',
        role: 'user',
        profile: {
          city: 'Bengaluru',
          monthlyBudget: 20000,
          dailyCommuteKm: 25,
          familySize: 2,
          homeCharging: true,
          preferredBodyType: 'Hatchback',
        },
      },
    ]);
    console.log(`✅ Seeded ${users.length} Users.`);

    // Step 4: Seed Charging Stations
    console.log('\n⚡ Seeding Charging Stations with GeoJSON coordinates...');
    const insertedStations = await ChargingStation.insertMany(CHARGING_STATIONS_DATA);
    console.log(`✅ Seeded ${insertedStations.length} Charging Stations.`);

    // Step 5: Ingest Kaggle EV CSV dataset
    console.log('\n🚗 Ingesting EV catalog from Kaggle CSV...');
    // Look for CSV in multiple locations
    const candidatePaths = [
      process.env.KAGGLE_CSV_PATH,
      'C:\\data\\kaggle_evs.csv',
      'C:\\data\\evs.csv',
      'C:\\data\\ev_dataset.csv',
      path.resolve(__dirname, '../../../data/kaggle_evs.csv'),
      path.resolve(__dirname, '../../../../data/kaggle_evs.csv'),
    ].filter(Boolean);

    let foundCsvPath = null;
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        foundCsvPath = p;
        break;
      }
    }

    if (!foundCsvPath) {
      throw new Error(
        `Kaggle CSV not found. Please place your CSV file in "C:\\Users\\Kuntali Jagtap\\Documents\\evora\\data\\kaggle_evs.csv" or "C:\\data"`
      );
    }

    console.log(`📄 Reading Kaggle dataset from: ${foundCsvPath}`);
    const rawEvs = await loadKaggleCsv(foundCsvPath);
    console.log(`📊 Successfully parsed ${rawEvs.length} vehicle rows from CSV.`);

    // Prepare EV documents with brand references, flagship 360 models, and hotspots
    let flagshipCount = 0;
    const evDocuments = [];

    for (const item of rawEvs) {
      // Find or assign brandId
      let brandId = brandMap.get(item.brandName.toLowerCase());
      if (!brandId) {
        // Try fuzzy brand lookup
        for (const [k, v] of brandMap.entries()) {
          if (item.brandName.toLowerCase().includes(k) || k.includes(item.brandName.toLowerCase())) {
            brandId = v;
            break;
          }
        }
      }
      if (!brandId) {
        // Default to first brand (Tata)
        brandId = insertedBrands[0]._id;
      }

      // Check if flagship
      const isFlagshipEv = item.has360Model;
      if (isFlagshipEv) flagshipCount++;

      const hotspots = isFlagshipEv ? getHotspotsForVehicle(item.name) : [];

      evDocuments.push({
        ...item,
        brandId,
        hotspots360: hotspots,
        images: [
          { url: item.imageUrl, caption: `${item.name} Exterior Front`, isPrimary: true },
          { url: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1000&q=80', caption: 'Rear Profile & Tail Lamps', isPrimary: false },
          { url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80', caption: 'Interior Cockpit & Console', isPrimary: false },
        ],
        ratingAggregates: {
          averageRating: 0,
          totalReviews: 0,
          categoryAverages: {
            range: 0,
            comfort: 0,
            chargingExperience: 0,
            buildQuality: 0,
            valueForMoney: 0,
          },
        },
        viewCount: Math.floor(Math.random() * 500) + 100,
        isSampleData: true,
      });
    }

    const insertedEvs = await EV.insertMany(evDocuments);
    console.log(`✅ Seeded ${insertedEvs.length} EVs (${flagshipCount} Flagships with full 360° models and hotspots).`);

    // Step 6: Seed Rich Authentic Reviews & Atomically Update Rating Aggregates
    console.log('\n⭐ Seeding Verified Reviews and calculating rating aggregates...');
    const userMap = {
      kuntali: users[1]._id,
      rahul: users[2]._id,
      ananya: users[3]._id,
      admin: users[0]._id,
    };

    // Find specific vehicles for authentic reviews
    const nexon = insertedEvs.find(e => e.name.toLowerCase().includes('nexon')) || insertedEvs[0];
    const windsor = insertedEvs.find(e => e.name.toLowerCase().includes('windsor')) || insertedEvs[1];
    const punch = insertedEvs.find(e => e.name.toLowerCase().includes('punch')) || insertedEvs[2];
    const ioniq = insertedEvs.find(e => e.name.toLowerCase().includes('ioniq')) || insertedEvs[3];
    const seal = insertedEvs.find(e => e.name.toLowerCase().includes('seal')) || insertedEvs[4];
    const tiago = insertedEvs.find(e => e.name.toLowerCase().includes('tiago')) || insertedEvs[5];

    const sampleReviews = [
      {
        evId: nexon._id,
        userId: userMap.kuntali,
        rating: 5,
        categoryRatings: { range: 5, comfort: 5, chargingExperience: 4, buildQuality: 5, valueForMoney: 5 },
        title: 'Phenomenal daily driver for Pune traffic and Lonavala weekend trips',
        body: 'Been driving the Nexon EV Empowered Plus for 8 months now. Daily commute of 35 km from Kothrud to Hinjawadi IT Park consumes barely 10% battery. AC is always on 24°C in auto mode. On highway runs to Mumbai via Expressway, I get an authentic 385 km on a single charge with 18% remaining. Fast charging at Jio-bp Baner took just 38 minutes from 20% to 80%. Build quality feels rock solid like a tank.',
        pros: ['True 380+ km real-world highway range', 'Ventilated seats work wonders in summer', 'JBL 9-speaker soundstage is top tier'],
        cons: ['Software infotainment had a couple of freezes initially, resolved after OTA update'],
        city: 'Pune',
        monthsOwned: 8,
        ownerReportedRealWorldRangeKm: 395,
        isVerifiedOwner: true,
        helpfulCount: 24,
      },
      {
        evId: nexon._id,
        userId: userMap.rahul,
        rating: 4,
        categoryRatings: { range: 4, comfort: 4, chargingExperience: 4, buildQuality: 5, valueForMoney: 4 },
        title: 'Solid engineering and great paddle regen braking',
        body: 'The 4-level regenerative braking allows near one-pedal driving in heavy Western Express Highway bumper-to-bumper jams. Paddle shifters make adjusting regen on downhills effortless. Rear seat under-thigh support is slightly upright for very tall passengers, but overall very satisfying EV ownership.',
        pros: ['Punchy 143 bhp motor acceleration', 'High ground clearance tackles Mumbai potholes easily'],
        cons: ['Rear headroom is slightly snug for 6-footers'],
        city: 'Mumbai',
        monthsOwned: 5,
        ownerReportedRealWorldRangeKm: 370,
        isVerifiedOwner: true,
        helpfulCount: 15,
      },
      {
        evId: windsor._id,
        userId: userMap.rahul,
        rating: 5,
        categoryRatings: { range: 4, comfort: 5, chargingExperience: 5, buildQuality: 4, valueForMoney: 5 },
        title: 'The back seat feels like an Emirates business class recliner',
        body: 'Purchased the Windsor EV Essence primarily for chauffeured office commutes in Mumbai. The 135-degree Aero Lounge recline is completely unrivaled at this 15-lakh price bracket. My family loves the massive glass panoramic roof. The 38 kWh battery gives a realistic 270 km in city traffic, which is plenty for 3 days of commuting before plugging into my 7.2 kW home wallbox.',
        pros: ['135-degree reclining sofa seats', 'Gigantic 604-litre trunk', 'Huge 15.6-inch touchscreen is buttery smooth'],
        cons: ['Physical buttons for AC would have been preferred over screen menus'],
        city: 'Mumbai',
        monthsOwned: 3,
        ownerReportedRealWorldRangeKm: 275,
        isVerifiedOwner: true,
        helpfulCount: 31,
      },
      {
        evId: punch._id,
        userId: userMap.ananya,
        rating: 5,
        categoryRatings: { range: 5, comfort: 4, chargingExperience: 4, buildQuality: 5, valueForMoney: 5 },
        title: 'Best compact urban EV for Bengaluru tech corridors',
        body: 'Punch EV is tailor-made for Bengaluru traffic. Compact exterior dimensions make squeezing through Outer Ring Road bottlenecks and parking in crowded Indiranagar lanes an absolute breeze. With a 35 kWh battery, I easily get 320 km per charge with AC running non-stop. 360-degree camera is extremely clear and helpful.',
        pros: ['360 camera makes tight parking effortless', 'Crisp dual 10.25 inch screens', 'High seating position with commanding road view'],
        cons: ['Front bonnet charging port requires getting out and plugging in from the front'],
        city: 'Bengaluru',
        monthsOwned: 6,
        ownerReportedRealWorldRangeKm: 325,
        isVerifiedOwner: true,
        helpfulCount: 19,
      },
      {
        evId: ioniq._id,
        userId: userMap.admin,
        rating: 5,
        categoryRatings: { range: 5, comfort: 5, chargingExperience: 5, buildQuality: 5, valueForMoney: 5 },
        title: 'Futuristic design and jaw-dropping 18-minute 800V fast charging',
        body: 'Hyundai Ioniq 5 feels like an electric spaceship. Plugged it into a 150kW Tata Power charger on the expressway, and it shot from 18% to 80% in just 19 minutes! The interior space feels like a contemporary living room with sustainable materials. Real-world range effortlessly exceeds 510 km on highway driving at 100 km/h cruising speed.',
        pros: ['800V ultra-rapid charging architecture', 'Spacious flat-floor living room interior', 'V2L powers coffee machines and laptops on camping trips'],
        cons: ['Turning radius is slightly wide for tight U-turns'],
        city: 'Pune',
        monthsOwned: 12,
        ownerReportedRealWorldRangeKm: 515,
        isVerifiedOwner: true,
        helpfulCount: 42,
      },
      {
        evId: seal._id,
        userId: userMap.rahul,
        rating: 5,
        categoryRatings: { range: 5, comfort: 5, chargingExperience: 5, buildQuality: 5, valueForMoney: 5 },
        title: 'Porsche Taycan performance at one-third of the price',
        body: '3.8 seconds 0-100 km/h is genuinely neck-snapping. The Blade battery Cell-to-Body architecture makes the chassis feel rigid and glued to corners. Real-world range is around 490 km with enthusiastic driving. Head-turner everywhere in Mumbai.',
        pros: ['Insane 523 bhp acceleration', 'Ultra-safe Blade battery design', 'Heated & ventilated sports bucket seats'],
        cons: ['Low ground clearance requires caution over steep monsoon speed breakers'],
        city: 'Mumbai',
        monthsOwned: 4,
        ownerReportedRealWorldRangeKm: 495,
        isVerifiedOwner: true,
        helpfulCount: 28,
      },
      {
        evId: tiago._id,
        userId: userMap.ananya,
        rating: 4,
        categoryRatings: { range: 4, comfort: 4, chargingExperience: 4, buildQuality: 4, valueForMoney: 5 },
        title: 'Unbeatable value for an entry-level family electric car',
        body: 'Bought the Tiago EV for daily grocery runs and office commute in Bengaluru. Running cost is less than Re 1 per kilometer when charged at home overnight. Air conditioning is ice cold. Great suspension tuning for city broken roads.',
        pros: ['Incredible cost savings compared to petrol', 'Zippy sport mode', 'Compact and easy to handle'],
        cons: ['No DC fast charge above 25 kW'],
        city: 'Bengaluru',
        monthsOwned: 10,
        ownerReportedRealWorldRangeKm: 220,
        isVerifiedOwner: true,
        helpfulCount: 14,
      },
    ];

    const insertedReviews = await Review.insertMany(sampleReviews);
    console.log(`✅ Seeded ${insertedReviews.length} Reviews.`);

    // Recalculate rating aggregates for each vehicle that received reviews
    for (const ev of insertedEvs) {
      const reviews = insertedReviews.filter(r => r.evId.toString() === ev._id.toString());
      if (reviews.length > 0) {
        const total = reviews.length;
        const avgRating = Math.round((reviews.reduce((acc, r) => acc + r.rating, 0) / total) * 10) / 10;
        const avgRange = Math.round((reviews.reduce((acc, r) => acc + r.categoryRatings.range, 0) / total) * 10) / 10;
        const avgComfort = Math.round((reviews.reduce((acc, r) => acc + r.categoryRatings.comfort, 0) / total) * 10) / 10;
        const avgCharging = Math.round((reviews.reduce((acc, r) => acc + r.categoryRatings.chargingExperience, 0) / total) * 10) / 10;
        const avgBuild = Math.round((reviews.reduce((acc, r) => acc + r.categoryRatings.buildQuality, 0) / total) * 10) / 10;
        const avgValue = Math.round((reviews.reduce((acc, r) => acc + r.categoryRatings.valueForMoney, 0) / total) * 10) / 10;

        await EV.findByIdAndUpdate(ev._id, {
          ratingAggregates: {
            averageRating: avgRating,
            totalReviews: total,
            categoryAverages: {
              range: avgRange,
              comfort: avgComfort,
              chargingExperience: avgCharging,
              buildQuality: avgBuild,
              valueForMoney: avgValue,
            },
          },
          aiSummary: {
            whatOwnersLike: [
              'Smooth whisper-quiet driving and instant torque',
              'Substantial monthly cost savings over petrol/diesel',
              'Consistent air conditioning performance in peak Indian heat',
            ],
            whatOwnersDislike: [
              'Public fast charger queues during festival holidays',
              'Initial software glitches before first dealership OTA patch',
            ],
            lastGeneratedAt: new Date(),
          },
        });
      }
    }
    console.log('✅ Updated denormalized ratingAggregates across reviewed EVs.');

    // Step 7: Seed Review Votes (Junction collection)
    console.log('\n🗳️  Seeding Review Votes...');
    await ReviewVote.create([
      { reviewId: insertedReviews[0]._id, userId: userMap.rahul, voteType: 'helpful' },
      { reviewId: insertedReviews[0]._id, userId: userMap.ananya, voteType: 'helpful' },
      { reviewId: insertedReviews[2]._id, userId: userMap.kuntali, voteType: 'helpful' },
      { reviewId: insertedReviews[3]._id, userId: userMap.admin, voteType: 'helpful' },
    ]);
    console.log('✅ Seeded Review Votes (Strict compound unique index userId + reviewId verified).');

    // Step 8: Seed Wishlists (M:N Junction collection)
    console.log('\n❤️  Seeding Wishlists...');
    await Wishlist.create([
      { userId: userMap.kuntali, evId: nexon._id, notes: 'Top choice for daily Hinjawadi commute' },
      { userId: userMap.kuntali, evId: ioniq._id, notes: 'Dream dream car for future road trips' },
      { userId: userMap.rahul, evId: windsor._id, notes: 'Ideal for chauffeur-driven family travel' },
      { userId: userMap.rahul, evId: seal._id, notes: 'Track day performance sedan' },
      { userId: userMap.ananya, evId: punch._id, notes: 'Perfect size for city driving' },
    ]);
    console.log('✅ Seeded Wishlist junction documents.');

    // Step 9: Seed Ownership Claims
    console.log('\n🛡️  Seeding Ownership Claims for Verified Owner Badge verification...');
    await OwnershipClaim.create([
      {
        userId: userMap.kuntali,
        evId: nexon._id,
        registrationNumberMasked: 'MH12**8877',
        proofDocumentUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=500&q=80',
        status: 'approved',
        adminNotes: 'Verified via Maharashtra Vahan RTO portal document check',
        reviewedBy: userMap.admin,
      },
      {
        userId: userMap.rahul,
        evId: windsor._id,
        registrationNumberMasked: 'MH02**1122',
        proofDocumentUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=500&q=80',
        status: 'approved',
        adminNotes: 'Verified via insurance policy certificate',
        reviewedBy: userMap.admin,
      },
      {
        userId: userMap.ananya,
        evId: punch._id,
        registrationNumberMasked: 'KA03**4455',
        proofDocumentUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=500&q=80',
        status: 'pending',
        adminNotes: 'Awaiting front RC photo verification',
      },
    ]);
    console.log('✅ Seeded Ownership Claims.');

    console.log('\n====================================================');
    console.log('🎉 PHASE 1 DATABASE SEED COMPLETED SUCCESSFULLY!');
    console.log(`- Brands: ${insertedBrands.length}`);
    console.log(`- EVs: ${insertedEvs.length} (${flagshipCount} Flagships with full 360° models)`);
    console.log(`- Users: ${users.length}`);
    console.log(`- Charging Stations: ${insertedStations.length}`);
    console.log(`- Reviews: ${insertedReviews.length}`);
    console.log('====================================================\n');
  } catch (error) {
    console.error('❌ Seeding failed with error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
