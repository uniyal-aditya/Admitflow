-- AlterEnum
-- Phase 1 addendum: the dataset's 8 'waiting_list' timeline stages need this
-- DeadlineEvent value; the initial migration's enum was generated before it
-- was added to the schema.
ALTER TYPE "DeadlineEvent" ADD VALUE 'waiting_list';
