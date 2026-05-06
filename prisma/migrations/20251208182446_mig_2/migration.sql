-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "subscriptionStatus" TEXT NOT NULL DEFAULT 'none',
    "lastPaymentAt" TIMESTAMP(3),
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerificationToken" TEXT,
    "emailVerificationTokenExpiry" TIMESTAMP(3),
    "passwordResetToken" TEXT,
    "passwordResetTokenExpiry" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "public_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team" (
    "id" TEXT NOT NULL,
    "teamId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "about" TEXT NOT NULL,
    "bootcampAbout" TEXT,
    "calendar" TEXT NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analysts" (
    "id" TEXT NOT NULL,
    "analystId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "calendly" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "analysts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscribers" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "subscribedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "subscribers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "stripeSessionId" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bootcamps" (
    "id" TEXT NOT NULL,
    "bootcampId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "priceAmount" DOUBLE PRECISION NOT NULL,
    "duration" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "mentors" TEXT[],
    "registrationStartDate" TIMESTAMP(3) NOT NULL,
    "registrationEndDate" TIMESTAMP(3) NOT NULL,
    "bootcampStartDate" TIMESTAMP(3),
    "tags" TEXT[],
    "gradientPosition" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "heroSubheading" TEXT,
    "heroDescription" TEXT[],
    "infoCards" JSONB,
    "mentorDetails" JSONB,
    "curriculumSections" JSONB,
    "targetAudience" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bootcamps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bootcamp_lessons" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "bootcampId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "youtubeVideoId" TEXT NOT NULL,
    "thumbnail" TEXT,
    "order" INTEGER NOT NULL,
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bootcamp_lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bootcamp_registrations" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "bootcampId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "stripeSessionId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "expiresAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bootcamp_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plans" (
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
    "features" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stripeSubscriptionId" TEXT NOT NULL,
    "stripeCustomerId" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "planType" TEXT NOT NULL,
    "planId" TEXT,
    "price" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_methods" (
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stripeInvoiceId" TEXT,
    "stripePaymentIntentId" TEXT,
    "subscriptionId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "status" TEXT NOT NULL,
    "description" TEXT,
    "invoiceDate" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "billing_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "analystId" INTEGER NOT NULL,
    "analystName" TEXT NOT NULL,
    "reviewerName" TEXT NOT NULL,
    "userId" TEXT,
    "reviewerId" TEXT,
    "userProfilePicture" TEXT,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "reviewDate" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "research_page_content" (
    "id" TEXT NOT NULL,
    "heroTitleAuthenticated" TEXT NOT NULL,
    "heroDescriptionAuthenticated" TEXT NOT NULL,
    "heroTitleGuest" TEXT NOT NULL,
    "heroDescriptionGuest" TEXT NOT NULL,
    "heroBulletPoints" TEXT[],
    "faqTitle" TEXT NOT NULL,
    "faqDescription" TEXT NOT NULL,
    "faqItems" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "research_page_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shariah_tiles" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "compliancePoints" TEXT[],
    "footerLeft" TEXT NOT NULL,
    "footerRight" TEXT NOT NULL,
    "ctaLabel" TEXT NOT NULL,
    "detailPath" TEXT NOT NULL,
    "lockedTitle" TEXT NOT NULL,
    "lockedDescription" TEXT NOT NULL,
    "analystNotes" TEXT NOT NULL,
    "complianceMetrics" JSONB,
    "customTable" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shariah_tiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "binance_credentials" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "apiSecret" TEXT NOT NULL,
    "passphrase" TEXT,
    "useTestnet" BOOLEAN NOT NULL DEFAULT false,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "binance_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bootcamp_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bootcampId" TEXT NOT NULL,
    "lessons" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bootcamp_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "public_users_email_key" ON "public_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "team_teamId_key" ON "team"("teamId");

-- CreateIndex
CREATE INDEX "team_teamId_idx" ON "team"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "analysts_analystId_key" ON "analysts"("analystId");

-- CreateIndex
CREATE INDEX "analysts_analystId_idx" ON "analysts"("analystId");

-- CreateIndex
CREATE UNIQUE INDEX "subscribers_email_key" ON "subscribers"("email");

-- CreateIndex
CREATE INDEX "subscribers_email_idx" ON "subscribers"("email");

-- CreateIndex
CREATE INDEX "bookings_clientEmail_idx" ON "bookings"("clientEmail");

-- CreateIndex
CREATE INDEX "bookings_date_idx" ON "bookings"("date");

-- CreateIndex
CREATE INDEX "bookings_stripeSessionId_idx" ON "bookings"("stripeSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "bootcamps_bootcampId_key" ON "bootcamps"("bootcampId");

-- CreateIndex
CREATE INDEX "bootcamps_bootcampId_idx" ON "bootcamps"("bootcampId");

-- CreateIndex
CREATE INDEX "bootcamps_isActive_idx" ON "bootcamps"("isActive");

-- CreateIndex
CREATE INDEX "bootcamp_lessons_bootcampId_idx" ON "bootcamp_lessons"("bootcampId");

-- CreateIndex
CREATE INDEX "bootcamp_lessons_lessonId_idx" ON "bootcamp_lessons"("lessonId");

-- CreateIndex
CREATE INDEX "bootcamp_registrations_userId_idx" ON "bootcamp_registrations"("userId");

-- CreateIndex
CREATE INDEX "bootcamp_registrations_bootcampId_idx" ON "bootcamp_registrations"("bootcampId");

-- CreateIndex
CREATE INDEX "bootcamp_registrations_stripeSessionId_idx" ON "bootcamp_registrations"("stripeSessionId");

-- CreateIndex
CREATE INDEX "bootcamp_registrations_customerEmail_idx" ON "bootcamp_registrations"("customerEmail");

-- CreateIndex
CREATE UNIQUE INDEX "plans_planId_key" ON "plans"("planId");

-- CreateIndex
CREATE INDEX "plans_planId_idx" ON "plans"("planId");

-- CreateIndex
CREATE INDEX "plans_isActive_idx" ON "plans"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripeSubscriptionId_key" ON "subscriptions"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "subscriptions_userId_idx" ON "subscriptions"("userId");

-- CreateIndex
CREATE INDEX "subscriptions_stripeSubscriptionId_idx" ON "subscriptions"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "subscriptions_stripeCustomerId_idx" ON "subscriptions"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "subscriptions_planId_idx" ON "subscriptions"("planId");

-- CreateIndex
CREATE INDEX "payment_methods_userId_idx" ON "payment_methods"("userId");

-- CreateIndex
CREATE INDEX "payment_methods_stripePaymentMethodId_idx" ON "payment_methods"("stripePaymentMethodId");

-- CreateIndex
CREATE INDEX "payment_methods_stripeCustomerId_idx" ON "payment_methods"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "billing_history_userId_idx" ON "billing_history"("userId");

-- CreateIndex
CREATE INDEX "billing_history_stripeInvoiceId_idx" ON "billing_history"("stripeInvoiceId");

-- CreateIndex
CREATE INDEX "billing_history_stripePaymentIntentId_idx" ON "billing_history"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "billing_history_subscriptionId_idx" ON "billing_history"("subscriptionId");

-- CreateIndex
CREATE INDEX "reviews_analystId_idx" ON "reviews"("analystId");

-- CreateIndex
CREATE INDEX "reviews_status_idx" ON "reviews"("status");

-- CreateIndex
CREATE INDEX "reviews_userId_idx" ON "reviews"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "shariah_tiles_slug_key" ON "shariah_tiles"("slug");

-- CreateIndex
CREATE INDEX "shariah_tiles_slug_idx" ON "shariah_tiles"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "binance_credentials_userId_key" ON "binance_credentials"("userId");

-- CreateIndex
CREATE INDEX "binance_credentials_userId_idx" ON "binance_credentials"("userId");

-- CreateIndex
CREATE INDEX "bootcamp_progress_userId_idx" ON "bootcamp_progress"("userId");

-- CreateIndex
CREATE INDEX "bootcamp_progress_bootcampId_idx" ON "bootcamp_progress"("bootcampId");

-- CreateIndex
CREATE UNIQUE INDEX "bootcamp_progress_userId_bootcampId_key" ON "bootcamp_progress"("userId", "bootcampId");

-- AddForeignKey
ALTER TABLE "analysts" ADD CONSTRAINT "analysts_analystId_fkey" FOREIGN KEY ("analystId") REFERENCES "team"("teamId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bootcamp_lessons" ADD CONSTRAINT "bootcamp_lessons_bootcampId_fkey" FOREIGN KEY ("bootcampId") REFERENCES "bootcamps"("bootcampId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bootcamp_registrations" ADD CONSTRAINT "bootcamp_registrations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bootcamp_registrations" ADD CONSTRAINT "bootcamp_registrations_bootcampId_fkey" FOREIGN KEY ("bootcampId") REFERENCES "bootcamps"("bootcampId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("planId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_history" ADD CONSTRAINT "billing_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_history" ADD CONSTRAINT "billing_history_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("stripeSubscriptionId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_analystId_fkey" FOREIGN KEY ("analystId") REFERENCES "team"("teamId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "binance_credentials" ADD CONSTRAINT "binance_credentials_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
