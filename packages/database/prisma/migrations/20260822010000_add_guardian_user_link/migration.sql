ALTER TABLE "guardians" ADD COLUMN "userId" TEXT;

CREATE UNIQUE INDEX "guardians_userId_key" ON "guardians"("userId");

ALTER TABLE "guardians"
ADD CONSTRAINT "guardians_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
