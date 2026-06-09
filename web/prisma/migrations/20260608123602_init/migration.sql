-- CreateTable
CREATE TABLE "Timelapse" (
    "id" UUID NOT NULL,
    "ownerId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Untitled',
    "canvasWidth" INTEGER NOT NULL,
    "canvasHeight" INTEGER NOT NULL,
    "gifDelayMs" INTEGER NOT NULL DEFAULT 500,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Timelapse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Frame" (
    "id" UUID NOT NULL,
    "timelapseId" UUID NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "originalKey" TEXT NOT NULL,
    "processedKey" TEXT,
    "cropX" DOUBLE PRECISION,
    "cropY" DOUBLE PRECISION,
    "cropW" DOUBLE PRECISION,
    "cropH" DOUBLE PRECISION,
    "rotation" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "scale" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "offsetX" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "offsetY" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "width" INTEGER,
    "height" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Frame_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Timelapse_ownerId_updatedAt_idx" ON "Timelapse"("ownerId", "updatedAt");

-- CreateIndex
CREATE INDEX "Frame_timelapseId_orderIndex_idx" ON "Frame"("timelapseId", "orderIndex");

-- AddForeignKey
ALTER TABLE "Frame" ADD CONSTRAINT "Frame_timelapseId_fkey" FOREIGN KEY ("timelapseId") REFERENCES "Timelapse"("id") ON DELETE CASCADE ON UPDATE CASCADE;
