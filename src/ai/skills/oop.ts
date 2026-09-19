import { Skill } from "./types";

export const oopSkill: Skill = {
  id: "OOP",
  displayName: "Object-Oriented Programming",
  questionGuidance: `Draw from core OOP concepts: encapsulation, inheritance, polymorphism, abstraction, composition vs inheritance, SOLID principles (especially Single Responsibility, Open/Closed, and Liskov Substitution), and common design patterns (Strategy, Factory, Observer, Decorator). Prefer scenario-based questions ("design a system that...") over pure definitional ones at MEDIUM difficulty and above.`,
  evaluationGuidance: `When evaluating, specifically check whether the candidate's answer would hold up in a real code review: did they consider maintainability, coupling, and extensibility, not just correctness of the definition? A textbook-correct definition with no practical grounding should not score above 70 on technicalDepth.`,
};