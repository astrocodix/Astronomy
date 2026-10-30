-- Enforce a single active examination per learner, including concurrent requests.
CREATE UNIQUE INDEX "ExamAttempt_one_active_per_user" ON "ExamAttempt" ("userId") WHERE "status" = 'IN_PROGRESS';
