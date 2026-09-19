import { Skill } from "./types";

export const dbmsSkill: Skill = {
  id: "DBMS",
  displayName: "Database Management Systems",
  questionGuidance: `Draw from core DBMS concepts: normalization (1NF-3NF, BCNF), ACID properties, transaction isolation levels, indexing (clustered vs non-clustered, when indexes hurt write performance), joins and query optimization, and deadlocks. Prefer questions that require reasoning about trade-offs (e.g., "when would you denormalize?") over pure recall at MEDIUM difficulty and above.`,
  evaluationGuidance: `When evaluating, check whether the candidate understands trade-offs, not just definitions — for example, knowing that indexes speed up reads but slow down writes, or that higher isolation levels reduce concurrency. A definition-only answer with no trade-off awareness should not score above 70 on technicalDepth.`,
};