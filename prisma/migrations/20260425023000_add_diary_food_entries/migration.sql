CREATE TABLE "diary_food_entries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "date_ymd" TEXT NOT NULL,
    "slot" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "food_name" TEXT NOT NULL,
    "brand_name" TEXT,
    "portion_description" TEXT,
    "calories" DOUBLE PRECISION,
    "fatsecret_food_id" TEXT,
    "fatsecret_serving_id" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "diary_food_entries_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "diary_food_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "idx_diary_food_entries_user_date_slot" ON "diary_food_entries"("user_id", "date_ymd", "slot", "sort_order");

ALTER TABLE "diary_food_entries" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own food entries"
ON "diary_food_entries"
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own food entries"
ON "diary_food_entries"
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own food entries"
ON "diary_food_entries"
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own food entries"
ON "diary_food_entries"
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
