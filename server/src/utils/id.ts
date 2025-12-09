// ID generation utilities
import { nanoid } from "nanoid";

export function generateId(prefix?: string): string {
  const id = nanoid(12);
  return prefix ? `${prefix}_${id}` : id;
}

export function generateQuizId(): string {
  return generateId("quiz");
}

export function generatePDFId(): string {
  return generateId("pdf");
}

export function generateQuestionId(): string {
  return generateId("q");
}
