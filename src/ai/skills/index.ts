import { Skill } from "./types";
import { oopSkill } from "./oop";
import { dbmsSkill } from "./dbms";

const skills: Record<string, Skill> = {
  OOP: oopSkill,
  DBMS: dbmsSkill,
};

export function getSkill(topic: string): Skill | undefined {
  return skills[topic.toUpperCase()];
}

export function listSkills(): Skill[] {
  return Object.values(skills);
}