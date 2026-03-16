import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config({ path: "../../apps/server/.env" });

import { PrismaClient } from "./prisma/generated/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data (reverse dependency order)
  await prisma.performanceScore.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.statusUpdate.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.fuelLog.deleteMany();
  await prisma.stop.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.hoursOfServiceLog.deleteMany();
  await prisma.driverAssignment.deleteMany();
  await prisma.maintenanceLog.deleteMany();
  await prisma.fleetDocument.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.trailer.deleteMany();
  await prisma.truck.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  // --- ADMIN USER ---
  const adminPasswordHash = await bcrypt.hash("12345678", 10);

  const admin = await prisma.user.create({
    data: {
      username: "admin",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      name: "System Administrator",
      email: "admin@example.com",
    },
  });

  console.log(`✅ Seeded admin user: ${admin.username}`);

  // --- TRUCKS ---
  const trucks = await Promise.all([
    prisma.truck.create({
      data: {
        unitNumber: "TRK-001",
        vin: "1FUJGLDR5CLBP8834",
        make: "Freightliner",
        model: "Cascadia",
        year: 2022,
        licensePlate: "GP-TRK-001",
        status: "AVAILABLE",
        mileage: 125000,
        fuelType: "DIESEL",
        tankCapacityLitres: 400,
      },
    }),
    prisma.truck.create({
      data: {
        unitNumber: "TRK-002",
        vin: "3AKJHHDR7LSLF9921",
        make: "MAN",
        model: "TGX 26.540",
        year: 2023,
        licensePlate: "GP-TRK-002",
        status: "AVAILABLE",
        mileage: 82000,
        fuelType: "DIESEL",
        tankCapacityLitres: 450,
      },
    }),
    prisma.truck.create({
      data: {
        unitNumber: "TRK-003",
        vin: "5AKJHHDR9MSLF1142",
        make: "Scania",
        model: "R500",
        year: 2021,
        licensePlate: "GP-TRK-003",
        status: "MAINTENANCE",
        mileage: 210000,
        fuelType: "DIESEL",
        tankCapacityLitres: 500,
      },
    }),
    prisma.truck.create({
      data: {
        unitNumber: "TRK-004",
        vin: "7BKJHHDR1NSLF3363",
        make: "Volvo",
        model: "FH16",
        year: 2024,
        licensePlate: "GP-TRK-004",
        status: "AVAILABLE",
        mileage: 15000,
        fuelType: "DIESEL",
        tankCapacityLitres: 475,
      },
    }),
    prisma.truck.create({
      data: {
        unitNumber: "TRK-005",
        vin: "9CKJHHDR3PSLF5584",
        make: "Mercedes-Benz",
        model: "Actros 2645",
        year: 2023,
        licensePlate: "GP-TRK-005",
        status: "IN_TRANSIT",
        mileage: 95000,
        fuelType: "DIESEL",
        tankCapacityLitres: 420,
      },
    }),
  ]);

  console.log(`✅ Created ${trucks.length} trucks`);

  // --- TRAILERS ---
  const trailers = await Promise.all([
    prisma.trailer.create({
      data: {
        unitNumber: "TRL-001",
        type: "DRY_VAN",
        capacityTonnes: 30,
        licensePlate: "GP-TRL-001",
        status: "AVAILABLE",
      },
    }),
    prisma.trailer.create({
      data: {
        unitNumber: "TRL-002",
        type: "FLATBED",
        capacityTonnes: 35,
        licensePlate: "GP-TRL-002",
        status: "AVAILABLE",
      },
    }),
    prisma.trailer.create({
      data: {
        unitNumber: "TRL-003",
        type: "REEFER",
        capacityTonnes: 25,
        licensePlate: "GP-TRL-003",
        status: "IN_TRANSIT",
      },
    }),
    prisma.trailer.create({
      data: {
        unitNumber: "TRL-004",
        type: "TANKER",
        capacityTonnes: 34,
        licensePlate: "GP-TRL-004",
        status: "AVAILABLE",
      },
    }),
  ]);

  console.log(`✅ Created ${trailers.length} trailers`);

  // --- CUSTOMERS ---
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: "Shoprite Holdings",
        email: "logistics@shoprite.co.za",
        phone: "+27 21 980 4000",
        address: "Cnr William Dabbs St & Old Paarl Rd",
        city: "Cape Town",
        province: "Western Cape",
        postalCode: "7500",
      },
    }),
    prisma.customer.create({
      data: {
        name: "Pick n Pay",
        email: "supply@pnp.co.za",
        phone: "+27 21 658 1000",
        address: "101 Rosmead Ave, Kenilworth",
        city: "Cape Town",
        province: "Western Cape",
        postalCode: "7708",
      },
    }),
    prisma.customer.create({
      data: {
        name: "Woolworths SA",
        email: "distribution@woolworths.co.za",
        phone: "+27 21 407 9111",
        address: "93 Longmarket St",
        city: "Cape Town",
        province: "Western Cape",
        postalCode: "8001",
      },
    }),
    prisma.customer.create({
      data: {
        name: "Sasol Mining",
        email: "logistics@sasol.com",
        phone: "+27 17 614 2000",
        address: "1 Sturdee Ave, Rosebank",
        city: "Johannesburg",
        province: "Gauteng",
        postalCode: "2196",
      },
    }),
    prisma.customer.create({
      data: {
        name: "PPC Cement",
        email: "orders@ppc.co.za",
        phone: "+27 11 386 9000",
        address: "148 Katherine St, Sandton",
        city: "Johannesburg",
        province: "Gauteng",
        postalCode: "2196",
      },
    }),
  ]);

  console.log(`✅ Created ${customers.length} customers`);

  // --- MAINTENANCE LOGS ---
  const maintenanceLogs = await Promise.all([
    prisma.maintenanceLog.create({
      data: {
        type: "SCHEDULED",
        description: "Annual service - oil change, filters, brake inspection",
        cost: 12500,
        mileageAtService: 120000,
        scheduledDate: new Date("2026-03-15"),
        status: "SCHEDULED",
        vendorName: "Freightliner Centurion",
        truckId: trucks[0]!.id,
      },
    }),
    prisma.maintenanceLog.create({
      data: {
        type: "UNSCHEDULED",
        description: "Turbo replacement - loss of power reported",
        cost: 45000,
        mileageAtService: 208000,
        scheduledDate: new Date("2026-03-10"),
        status: "IN_PROGRESS",
        vendorName: "Scania Truck Centre JHB",
        truckId: trucks[2]!.id,
      },
    }),
    prisma.maintenanceLog.create({
      data: {
        type: "INSPECTION",
        description: "COF renewal inspection",
        cost: 3500,
        scheduledDate: new Date("2026-03-20"),
        status: "SCHEDULED",
        trailerId: trailers[0]!.id,
      },
    }),
  ]);

  console.log(`✅ Created ${maintenanceLogs.length} maintenance logs`);

  console.log("🎉 Seed complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
