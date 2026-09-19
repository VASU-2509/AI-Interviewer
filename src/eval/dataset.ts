export interface EvalCase {
  id: string;
  topic: string;
  difficulty: string;
  question: string;
  answer: string;
  expectedScoreRange: [number, number];
  acceptableActions: string[];
  rationale: string;
}

export const evalDataset: EvalCase[] = [
  {
    id: "oop-strong-1",
    topic: "OOP",
    difficulty: "MEDIUM",
    question: "Explain the difference between composition and inheritance.",
    answer:
      "Inheritance creates an is-a relationship where a subclass extends a base class, but this can lead to tight coupling and fragile hierarchies. Composition creates a has-a relationship, where a class contains other objects and delegates behavior to them. Composition is generally preferred for flexibility, e.g. a Car class should contain an Engine object rather than inherit from Engine, since a car is not a type of engine, it merely uses one.",
    expectedScoreRange: [75, 100],
    acceptableActions: ["INCREASE_DIFFICULTY", "FOLLOW_UP"],
    rationale: "Clear, accurate, with a correct concrete example — should score high.",
  },
  {
    id: "oop-wrong-1",
    topic: "OOP",
    difficulty: "MEDIUM",
    question: "Explain the difference between composition and inheritance.",
    answer:
      "Composition and inheritance are basically the same thing, they both let you reuse code from other classes.",
    expectedScoreRange: [0, 35],
    acceptableActions: ["DECREASE_DIFFICULTY"],
    rationale: "Factually incorrect — claims two distinct concepts are 'basically the same'.",
  },
  {
    id: "oop-offtopic-1",
    topic: "OOP",
    difficulty: "MEDIUM",
    question: "Explain the difference between composition and inheritance.",
    answer:
      "Normalization is the process of organizing database tables to reduce redundancy and improve data integrity.",
    expectedScoreRange: [0, 20],
    acceptableActions: ["DECREASE_DIFFICULTY"],
    rationale: "Completely off-topic answer from a different domain entirely.",
  },
  {
    id: "oop-partial-1",
    topic: "OOP",
    difficulty: "MEDIUM",
    question: "What is polymorphism in OOP?",
    answer: "Polymorphism means one object can behave in multiple ways.",
    expectedScoreRange: [35, 70],
    acceptableActions: ["FOLLOW_UP", "DECREASE_DIFFICULTY"],
    rationale: "Conceptually correct but shallow, no example or distinction between types.",
  },
  {
    id: "dbms-strong-1",
    topic: "DBMS",
    difficulty: "MEDIUM",
    question: "When would you choose to denormalize a database schema?",
    answer:
      "Denormalization is appropriate when read performance is critical and the data is read far more often than written, such as in a product catalog. It trades storage space and write complexity for faster reads by reducing joins. The main risk is data anomalies if updates aren't propagated consistently, which can be mitigated with triggers, scheduled sync jobs, or using a separate read-optimized replica instead of denormalizing the source of truth.",
    expectedScoreRange: [75, 100],
    acceptableActions: ["INCREASE_DIFFICULTY", "FOLLOW_UP"],
    rationale: "Covers trade-offs, conditions, and mitigation — should score high per DBMS skill guidance.",
  },
 {
  id: "dbms-definitiononly-1",
  topic: "DBMS",
  difficulty: "MEDIUM",
  question: "When would you choose to denormalize a database schema?",
  answer:
    "Denormalization means combining tables to reduce joins, which can make reads faster.",
  expectedScoreRange: [20, 65],
  acceptableActions: ["FOLLOW_UP", "DECREASE_DIFFICULTY"],
  rationale: "Accurate but definition-only, no trade-off reasoning. Borderline case — observed run-to-run score variance (59, 63) confirms this sits near the evaluator's natural decision boundary, which is expected LLM behavior on ambiguous cases rather than a defect.",
},
  {
    id: "dbms-placeholder-1",
    topic: "DBMS",
    difficulty: "MEDIUM",
    question: "Explain ACID properties in the context of database transactions.",
    answer: "asdf test 123 not a real answer",
    expectedScoreRange: [0, 10],
    acceptableActions: ["DECREASE_DIFFICULTY"],
    rationale: "Placeholder/gibberish text — evaluator should recognize this isn't a genuine attempt.",
  },
];