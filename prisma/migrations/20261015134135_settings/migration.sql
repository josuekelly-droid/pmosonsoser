-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "facebook" TEXT,
    "instagram" TEXT,
    "whatsapp" TEXT,
    "baseFee" INTEGER NOT NULL DEFAULT 500,
    "pricePerKm" INTEGER NOT NULL DEFAULT 150,
    "freeDeliveryThreshold" INTEGER NOT NULL DEFAULT 5000000,
    "maxRadiusKm" INTEGER NOT NULL DEFAULT 550,
    "bankName" TEXT,
    "bankIban" TEXT,
    "bankHolder" TEXT,
    "wuFirstName" TEXT,
    "wuLastName" TEXT,
    "wuCity" TEXT,
    "wuCountry" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);
