-- CreateTable
CREATE TABLE "diary_meals" (
    "user_id" UUID NOT NULL,
    "date_ymd" TEXT NOT NULL,
    "slot" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "diary_meals_pkey" PRIMARY KEY ("user_id","date_ymd","slot")
);

-- CreateIndex
CREATE INDEX "idx_diary_meals_user_date" ON "diary_meals"("user_id", "date_ymd");
