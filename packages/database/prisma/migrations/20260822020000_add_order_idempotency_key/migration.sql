ALTER TABLE "orders" ADD COLUMN "idempotencyKey" TEXT;

UPDATE "orders"
SET "idempotencyKey" = 'legacy-' || "id"
WHERE "idempotencyKey" IS NULL;

ALTER TABLE "orders" ALTER COLUMN "idempotencyKey" SET NOT NULL;

CREATE UNIQUE INDEX "orders_tenantId_idempotencyKey_key"
ON "orders"("tenantId", "idempotencyKey");
