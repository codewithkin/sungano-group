-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'DISPATCHER', 'DRIVER', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "DriverStatus" AS ENUM ('AVAILABLE', 'ON_TRIP', 'OFF_DUTY', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "FleetStatus" AS ENUM ('AVAILABLE', 'IN_TRANSIT', 'MAINTENANCE', 'OUT_OF_SERVICE');

-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('DIESEL', 'PETROL', 'LNG', 'ELECTRIC');

-- CreateEnum
CREATE TYPE "TrailerType" AS ENUM ('FLATBED', 'REEFER', 'DRY_VAN', 'TANKER', 'LOWBED', 'CURTAIN_SIDE', 'CONTAINER');

-- CreateEnum
CREATE TYPE "MaintenanceType" AS ENUM ('SCHEDULED', 'UNSCHEDULED', 'INSPECTION');

-- CreateEnum
CREATE TYPE "MaintenanceStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('FUEL', 'TOLLS', 'MAINTENANCE', 'ACCOMMODATION', 'FINES', 'PERMITS', 'OTHER');

-- CreateEnum
CREATE TYPE "UpdateType" AS ENUM ('INFO', 'WARNING', 'DELAY', 'LOCATION', 'DELIVERY_CONFIRMED', 'PICKUP_CONFIRMED', 'ISSUE');

-- CreateEnum
CREATE TYPE "IncidentType" AS ENUM ('ACCIDENT', 'BREAKDOWN', 'DELAY', 'COMPLIANCE', 'THEFT', 'WEATHER', 'OTHER');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ShipmentStatus" AS ENUM ('PENDING', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TripStatus" AS ENUM ('PLANNED', 'DISPATCHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "StopType" AS ENUM ('PICKUP', 'DELIVERY', 'FUEL', 'REST', 'INSPECTION');

-- CreateEnum
CREATE TYPE "StopStatus" AS ENUM ('PENDING', 'EN_ROUTE', 'ARRIVED', 'COMPLETED', 'SKIPPED');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'DISPATCHER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "driver" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "licenseClass" TEXT NOT NULL,
    "licenseExpiry" TIMESTAMP(3) NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "status" "DriverStatus" NOT NULL DEFAULT 'AVAILABLE',
    "hireDate" TIMESTAMP(3) NOT NULL,
    "medicalExpiryDate" TIMESTAMP(3),
    "emergencyContact" TEXT,
    "emergencyPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "driver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "driver_assignment" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "truckId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "driver_assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hours_of_service_log" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "drivingHrs" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "onDutyHrs" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sleeperHrs" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "offDutyHrs" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hours_of_service_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "truck" (
    "id" TEXT NOT NULL,
    "unitNumber" TEXT NOT NULL,
    "vin" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "licensePlate" TEXT NOT NULL,
    "status" "FleetStatus" NOT NULL DEFAULT 'AVAILABLE',
    "mileage" INTEGER NOT NULL DEFAULT 0,
    "fuelType" "FuelType" NOT NULL DEFAULT 'DIESEL',
    "tankCapacityLitres" DOUBLE PRECISION NOT NULL,
    "currentLocationLat" DOUBLE PRECISION,
    "currentLocationLng" DOUBLE PRECISION,
    "lastLocationUpdate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "truck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trailer" (
    "id" TEXT NOT NULL,
    "unitNumber" TEXT NOT NULL,
    "type" "TrailerType" NOT NULL,
    "capacityTonnes" DOUBLE PRECISION NOT NULL,
    "licensePlate" TEXT NOT NULL,
    "status" "FleetStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trailer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_log" (
    "id" TEXT NOT NULL,
    "type" "MaintenanceType" NOT NULL,
    "description" TEXT NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "mileageAtService" INTEGER,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "completedDate" TIMESTAMP(3),
    "status" "MaintenanceStatus" NOT NULL DEFAULT 'SCHEDULED',
    "vendorName" TEXT,
    "truckId" TEXT,
    "trailerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fleet_document" (
    "id" TEXT NOT NULL,
    "truckId" TEXT,
    "trailerId" TEXT,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fleet_document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fuel_log" (
    "id" TEXT NOT NULL,
    "truckId" TEXT NOT NULL,
    "tripId" TEXT,
    "litres" DOUBLE PRECISION NOT NULL,
    "costPerLitre" DOUBLE PRECISION NOT NULL,
    "totalCost" DOUBLE PRECISION NOT NULL,
    "mileageAt" INTEGER NOT NULL,
    "station" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fuel_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense" (
    "id" TEXT NOT NULL,
    "tripId" TEXT,
    "category" "ExpenseCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "receiptUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "status_update" (
    "id" TEXT NOT NULL,
    "tripId" TEXT,
    "shipmentId" TEXT,
    "authorId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "UpdateType" NOT NULL,
    "isVisibleToCustomer" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "status_update_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incident" (
    "id" TEXT NOT NULL,
    "driverId" TEXT,
    "truckId" TEXT,
    "type" "IncidentType" NOT NULL,
    "severity" "Severity" NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "resolution" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_score" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "period" TIMESTAMP(3) NOT NULL,
    "onTimeDeliveryPct" DOUBLE PRECISION NOT NULL,
    "fuelEfficiency" DOUBLE PRECISION,
    "safetyScore" DOUBLE PRECISION,
    "hoursCompliance" DOUBLE PRECISION,
    "customerRating" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "performance_score_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "province" TEXT,
    "postalCode" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipment" (
    "id" TEXT NOT NULL,
    "referenceNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "weight" DOUBLE PRECISION,
    "volume" DOUBLE PRECISION,
    "specialInstructions" TEXT,
    "status" "ShipmentStatus" NOT NULL DEFAULT 'PENDING',
    "pickupAddress" TEXT NOT NULL,
    "pickupLat" DOUBLE PRECISION,
    "pickupLng" DOUBLE PRECISION,
    "deliveryAddress" TEXT NOT NULL,
    "deliveryLat" DOUBLE PRECISION,
    "deliveryLng" DOUBLE PRECISION,
    "requestedPickup" TIMESTAMP(3) NOT NULL,
    "requestedDelivery" TIMESTAMP(3) NOT NULL,
    "actualPickup" TIMESTAMP(3),
    "actualDelivery" TIMESTAMP(3),
    "proofOfDelivery" TEXT,
    "tripId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trip" (
    "id" TEXT NOT NULL,
    "tripNumber" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "truckId" TEXT NOT NULL,
    "trailerId" TEXT,
    "status" "TripStatus" NOT NULL DEFAULT 'PLANNED',
    "plannedStartTime" TIMESTAMP(3) NOT NULL,
    "plannedEndTime" TIMESTAMP(3) NOT NULL,
    "actualStartTime" TIMESTAMP(3),
    "actualEndTime" TIMESTAMP(3),
    "plannedDistanceKm" DOUBLE PRECISION,
    "actualDistanceKm" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stop" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "shipmentId" TEXT,
    "sequence" INTEGER NOT NULL,
    "type" "StopType" NOT NULL,
    "address" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "plannedArrival" TIMESTAMP(3),
    "plannedDeparture" TIMESTAMP(3),
    "actualArrival" TIMESTAMP(3),
    "actualDeparture" TIMESTAMP(3),
    "notes" TEXT,
    "status" "StopStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stop_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "driver_userId_key" ON "driver"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "driver_licenseNumber_key" ON "driver"("licenseNumber");

-- CreateIndex
CREATE INDEX "driver_assignment_driverId_idx" ON "driver_assignment"("driverId");

-- CreateIndex
CREATE INDEX "driver_assignment_truckId_idx" ON "driver_assignment"("truckId");

-- CreateIndex
CREATE INDEX "hours_of_service_log_driverId_date_idx" ON "hours_of_service_log"("driverId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "truck_unitNumber_key" ON "truck"("unitNumber");

-- CreateIndex
CREATE UNIQUE INDEX "truck_vin_key" ON "truck"("vin");

-- CreateIndex
CREATE UNIQUE INDEX "trailer_unitNumber_key" ON "trailer"("unitNumber");

-- CreateIndex
CREATE INDEX "maintenance_log_truckId_idx" ON "maintenance_log"("truckId");

-- CreateIndex
CREATE INDEX "maintenance_log_trailerId_idx" ON "maintenance_log"("trailerId");

-- CreateIndex
CREATE INDEX "maintenance_log_scheduledDate_idx" ON "maintenance_log"("scheduledDate");

-- CreateIndex
CREATE INDEX "fleet_document_truckId_idx" ON "fleet_document"("truckId");

-- CreateIndex
CREATE INDEX "fleet_document_trailerId_idx" ON "fleet_document"("trailerId");

-- CreateIndex
CREATE INDEX "fuel_log_truckId_idx" ON "fuel_log"("truckId");

-- CreateIndex
CREATE INDEX "fuel_log_tripId_idx" ON "fuel_log"("tripId");

-- CreateIndex
CREATE INDEX "fuel_log_date_idx" ON "fuel_log"("date");

-- CreateIndex
CREATE INDEX "expense_tripId_idx" ON "expense"("tripId");

-- CreateIndex
CREATE INDEX "expense_category_idx" ON "expense"("category");

-- CreateIndex
CREATE INDEX "status_update_tripId_idx" ON "status_update"("tripId");

-- CreateIndex
CREATE INDEX "status_update_shipmentId_idx" ON "status_update"("shipmentId");

-- CreateIndex
CREATE INDEX "incident_driverId_idx" ON "incident"("driverId");

-- CreateIndex
CREATE INDEX "incident_truckId_idx" ON "incident"("truckId");

-- CreateIndex
CREATE INDEX "incident_severity_idx" ON "incident"("severity");

-- CreateIndex
CREATE UNIQUE INDEX "performance_score_driverId_period_key" ON "performance_score"("driverId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "shipment_referenceNumber_key" ON "shipment"("referenceNumber");

-- CreateIndex
CREATE INDEX "shipment_customerId_idx" ON "shipment"("customerId");

-- CreateIndex
CREATE INDEX "shipment_tripId_idx" ON "shipment"("tripId");

-- CreateIndex
CREATE INDEX "shipment_status_idx" ON "shipment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "trip_tripNumber_key" ON "trip"("tripNumber");

-- CreateIndex
CREATE INDEX "trip_driverId_idx" ON "trip"("driverId");

-- CreateIndex
CREATE INDEX "trip_truckId_idx" ON "trip"("truckId");

-- CreateIndex
CREATE INDEX "trip_status_idx" ON "trip"("status");

-- CreateIndex
CREATE INDEX "stop_tripId_idx" ON "stop"("tripId");

-- CreateIndex
CREATE INDEX "stop_shipmentId_idx" ON "stop"("shipmentId");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver" ADD CONSTRAINT "driver_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_assignment" ADD CONSTRAINT "driver_assignment_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_assignment" ADD CONSTRAINT "driver_assignment_truckId_fkey" FOREIGN KEY ("truckId") REFERENCES "truck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hours_of_service_log" ADD CONSTRAINT "hours_of_service_log_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_log" ADD CONSTRAINT "maintenance_log_truckId_fkey" FOREIGN KEY ("truckId") REFERENCES "truck"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_log" ADD CONSTRAINT "maintenance_log_trailerId_fkey" FOREIGN KEY ("trailerId") REFERENCES "trailer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fleet_document" ADD CONSTRAINT "fleet_document_truckId_fkey" FOREIGN KEY ("truckId") REFERENCES "truck"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fleet_document" ADD CONSTRAINT "fleet_document_trailerId_fkey" FOREIGN KEY ("trailerId") REFERENCES "trailer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fuel_log" ADD CONSTRAINT "fuel_log_truckId_fkey" FOREIGN KEY ("truckId") REFERENCES "truck"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fuel_log" ADD CONSTRAINT "fuel_log_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trip"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense" ADD CONSTRAINT "expense_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trip"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "status_update" ADD CONSTRAINT "status_update_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trip"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "status_update" ADD CONSTRAINT "status_update_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "shipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident" ADD CONSTRAINT "incident_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident" ADD CONSTRAINT "incident_truckId_fkey" FOREIGN KEY ("truckId") REFERENCES "truck"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_score" ADD CONSTRAINT "performance_score_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipment" ADD CONSTRAINT "shipment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipment" ADD CONSTRAINT "shipment_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trip"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip" ADD CONSTRAINT "trip_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip" ADD CONSTRAINT "trip_truckId_fkey" FOREIGN KEY ("truckId") REFERENCES "truck"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip" ADD CONSTRAINT "trip_trailerId_fkey" FOREIGN KEY ("trailerId") REFERENCES "trailer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stop" ADD CONSTRAINT "stop_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stop" ADD CONSTRAINT "stop_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "shipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
