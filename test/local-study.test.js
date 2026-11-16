import test from "node:test";
import assert from "node:assert/strict";
import { cleanText, splitSentences, makeExtractiveSummary, makeFlashcards, makeQuiz } from "../public/local-study.js";

const sample = "The Constitution is the supreme law of South Africa. All law and conduct inconsistent with the Constitution is invalid. The Bill of Rights protects the rights of everyone in the country. Courts interpret and apply the Constitution when resolving disputes.";

test("cleanText normalises whitespace", () => {
  assert.equal(cleanText("  law\r\n\n\n study  "), "law\n\nstudy");
});

test("splitSentences returns sentence units", () => {
  assert.equal(splitSentences(sample).length, 4);
});

test("local summary returns selected source sentences", () => {
  const summary = makeExtractiveSummary(sample, 2);
  assert.ok(summary.includes("Constitution"));
  assert.ok(summary.split("\n\n").length <= 2);
});

test("flashcards are derived from provided material", () => {
  const cards = makeFlashcards(sample, 3);
  assert.ok(cards.length > 0);
  assert.ok(cards.every(card => card.question.includes("________") && card.answer));
});

test("quiz questions are returned as review prompts", () => {
  const quiz = makeQuiz(sample, 2);
  assert.equal(quiz.length, 2);
  assert.ok(quiz[0].explanation.includes("original notes"));
});
