-- Database Table Backup and Restore Script
-- Generated: 2025-12-11T16:49:25.804Z
-- Tables: billing_history, binance_credentials, bookings, bootcamp_lessons, bootcamp_progress, bootcamp_registrations, bootcamps, payment_methods, plans, public_users, research_page_content, shariah_tiles, subscribers, subscriptions

-- This script can be used to restore the deleted tables

-- ====================================================
-- Table: billing_history
-- Row count: 0
-- ====================================================

CREATE TABLE IF NOT EXISTS "billing_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stripeInvoiceId" TEXT,
    "stripePaymentIntentId" TEXT,
    "subscriptionId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd'::text,
    "status" TEXT NOT NULL,
    "description" TEXT,
    "invoiceDate" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    "paidAt" TIMESTAMP WITHOUT TIME ZONE,
    "createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id")
);


-- ====================================================
-- Table: binance_credentials
-- Row count: 3
-- ====================================================

CREATE TABLE IF NOT EXISTS "binance_credentials" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "apiSecret" TEXT NOT NULL,
    "passphrase" TEXT,
    "useTestnet" BOOLEAN NOT NULL DEFAULT false,
    "label" TEXT,
    "createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    PRIMARY KEY ("id")
);

-- Insert data into binance_credentials
-- Note: Data export included in metadata JSON file
-- Row count: 3


-- ====================================================
-- Table: bookings
-- Row count: 0
-- ====================================================

CREATE TABLE IF NOT EXISTS "bookings" (
    "id" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "date" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    "time" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "stripeSessionId" TEXT,
    "expiresAt" TIMESTAMP WITHOUT TIME ZONE,
    "createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    PRIMARY KEY ("id")
);


-- ====================================================
-- Table: bootcamp_lessons
-- Row count: 0
-- ====================================================

CREATE TABLE IF NOT EXISTS "bootcamp_lessons" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "bootcampId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "youtubeVideoId" TEXT NOT NULL,
    "thumbnail" TEXT,
    "order" INTEGER NOT NULL,
    "duration" INTEGER,
    "createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    PRIMARY KEY ("id")
);


-- ====================================================
-- Table: bootcamp_progress
-- Row count: 0
-- ====================================================

CREATE TABLE IF NOT EXISTS "bootcamp_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bootcampId" TEXT NOT NULL,
    "lessons" JSONB NOT NULL,
    "updatedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    PRIMARY KEY ("id")
);


-- ====================================================
-- Table: bootcamp_registrations
-- Row count: 0
-- ====================================================

CREATE TABLE IF NOT EXISTS "bootcamp_registrations" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "bootcampId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "stripeSessionId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending'::text,
    "expiresAt" TIMESTAMP WITHOUT TIME ZONE,
    "notes" TEXT,
    "createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    PRIMARY KEY ("id")
);


-- ====================================================
-- Table: bootcamps
-- Row count: 6
-- ====================================================

CREATE TABLE IF NOT EXISTS "bootcamps" (
    "id" TEXT NOT NULL,
    "bootcampId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "priceAmount" DOUBLE PRECISION NOT NULL,
    "duration" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "mentors" ARRAY,
    "registrationStartDate" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    "registrationEndDate" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    "bootcampStartDate" TIMESTAMP WITHOUT TIME ZONE,
    "tags" ARRAY,
    "gradientPosition" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "heroSubheading" TEXT,
    "heroDescription" ARRAY,
    "infoCards" JSONB,
    "mentorDetails" JSONB,
    "curriculumSections" JSONB,
    "targetAudience" JSONB,
    "createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    PRIMARY KEY ("id")
);

-- Insert data into bootcamps
-- Note: Data export included in metadata JSON file
-- Row count: 6


-- ====================================================
-- Table: payment_methods
-- Row count: 0
-- ====================================================

CREATE TABLE IF NOT EXISTS "payment_methods" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stripePaymentMethodId" TEXT NOT NULL,
    "stripeCustomerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "last4" TEXT,
    "brand" TEXT,
    "expMonth" INTEGER,
    "expYear" INTEGER,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    PRIMARY KEY ("id")
);


-- ====================================================
-- Table: plans
-- Row count: 3
-- ====================================================

CREATE TABLE IF NOT EXISTS "plans" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "priceDisplay" TEXT NOT NULL,
    "priceAmount" DOUBLE PRECISION NOT NULL,
    "stripePriceId" TEXT,
    "billingInterval" TEXT NOT NULL,
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "features" ARRAY,
    "createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    PRIMARY KEY ("id")
);

-- Insert data into plans
-- Note: Data export included in metadata JSON file
-- Row count: 3


-- ====================================================
-- Table: public_users
-- Row count: 43
-- ====================================================

CREATE TABLE IF NOT EXISTS "public_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "subscriptionStatus" TEXT NOT NULL DEFAULT 'none'::text,
    "lastPaymentAt" TIMESTAMP WITHOUT TIME ZONE,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerificationToken" TEXT,
    "emailVerificationTokenExpiry" TIMESTAMP WITHOUT TIME ZONE,
    "passwordResetToken" TEXT,
    "passwordResetTokenExpiry" TIMESTAMP WITHOUT TIME ZONE,
    "createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    PRIMARY KEY ("id")
);

-- Insert data into public_users
-- Note: Data export included in metadata JSON file
-- Row count: 43


-- ====================================================
-- Table: research_page_content
-- Row count: 0
-- ====================================================

CREATE TABLE IF NOT EXISTS "research_page_content" (
    "id" TEXT NOT NULL,
    "heroTitleAuthenticated" TEXT NOT NULL,
    "heroDescriptionAuthenticated" TEXT NOT NULL,
    "heroTitleGuest" TEXT NOT NULL,
    "heroDescriptionGuest" TEXT NOT NULL,
    "heroBulletPoints" ARRAY,
    "faqTitle" TEXT NOT NULL,
    "faqDescription" TEXT NOT NULL,
    "faqItems" JSONB NOT NULL,
    "createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    PRIMARY KEY ("id")
);


-- ====================================================
-- Table: shariah_tiles
-- Row count: 0
-- ====================================================

CREATE TABLE IF NOT EXISTS "shariah_tiles" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "compliancePoints" ARRAY,
    "footerLeft" TEXT NOT NULL,
    "footerRight" TEXT NOT NULL,
    "ctaLabel" TEXT NOT NULL,
    "detailPath" TEXT NOT NULL,
    "lockedTitle" TEXT NOT NULL,
    "lockedDescription" TEXT NOT NULL,
    "analystNotes" TEXT NOT NULL,
    "complianceMetrics" JSONB,
    "customTable" JSONB,
    "createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    PRIMARY KEY ("id")
);


-- ====================================================
-- Table: subscribers
-- Row count: 24
-- ====================================================

CREATE TABLE IF NOT EXISTS "subscribers" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "subscribedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    PRIMARY KEY ("id")
);

-- Insert data into subscribers
-- Note: Data export included in metadata JSON file
-- Row count: 24


-- ====================================================
-- Table: subscriptions
-- Row count: 66
-- ====================================================

CREATE TABLE IF NOT EXISTS "subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stripeSubscriptionId" TEXT NOT NULL,
    "stripeCustomerId" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "planType" TEXT NOT NULL,
    "planId" TEXT,
    "price" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "currentPeriodStart" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    "currentPeriodEnd" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    PRIMARY KEY ("id")
);

-- Insert data into subscriptions
-- Note: Data export included in metadata JSON file
-- Row count: 66


