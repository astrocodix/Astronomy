-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AIMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'unknown',
    "sources" JSONB NOT NULL DEFAULT '[]',
    "language" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AIMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "AIConversation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_AIMessage" ("content", "conversationId", "createdAt", "id", "language", "role") SELECT "content", "conversationId", "createdAt", "id", "language", "role" FROM "AIMessage";
DROP TABLE "AIMessage";
ALTER TABLE "new_AIMessage" RENAME TO "AIMessage";
CREATE TABLE "new_AIUsageLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "configurationHash" TEXT NOT NULL DEFAULT '',
    "tokens" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AIUsageLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_AIUsageLog" ("createdAt", "id", "model", "status", "tokens", "userId") SELECT "createdAt", "id", "model", "status", "tokens", "userId" FROM "AIUsageLog";
DROP TABLE "AIUsageLog";
ALTER TABLE "new_AIUsageLog" RENAME TO "AIUsageLog";
CREATE INDEX "AIUsageLog_userId_createdAt_idx" ON "AIUsageLog"("userId", "createdAt");
CREATE TABLE "new_Question" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "moduleId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "concept" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "promptEn" TEXT NOT NULL,
    "promptAr" TEXT NOT NULL,
    "explanationEn" TEXT NOT NULL,
    "explanationAr" TEXT NOT NULL,
    "answer" JSONB NOT NULL,
    "data" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "reviewStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "generated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Question_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Question_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Question" ("answer", "concept", "createdAt", "data", "difficulty", "explanationAr", "explanationEn", "generated", "id", "lessonId", "moduleId", "promptAr", "promptEn", "reviewStatus", "status", "type") SELECT "answer", "concept", "createdAt", "data", "difficulty", "explanationAr", "explanationEn", "generated", "id", "lessonId", "moduleId", "promptAr", "promptEn", "reviewStatus", "status", "type" FROM "Question";
DROP TABLE "Question";
ALTER TABLE "new_Question" RENAME TO "Question";
CREATE INDEX "Question_lessonId_difficulty_idx" ON "Question"("lessonId", "difficulty");
CREATE INDEX "Question_moduleId_status_idx" ON "Question"("moduleId", "status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

