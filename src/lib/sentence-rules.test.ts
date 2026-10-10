import { describe, expect, it } from "vitest";
import { checkSentence, usesWord } from "./sentence-rules";

describe("usesWord", () => {
  it("finds the word whatever the case or punctuation", () => {
    expect(usesWord("Laconic, as ever.", "laconic", [])).toBe(true);
    expect(usesWord("She called him “laconic”.", "laconic", [])).toBe(true);
  });

  it("accepts a different ending", () => {
    expect(usesWord("He answered laconically.", "laconic", [])).toBe(true);
    expect(usesWord("They kept arguing.", "argue", [])).toBe(true);
    expect(usesWord("She smiled happily.", "happy", [])).toBe(true);
    expect(usesWord("He runs every day.", "run", [])).toBe(true);
  });

  it("accepts an irregular form only when the dictionary lists it", () => {
    expect(usesWord("She ran home.", "run", ["runs", "ran"])).toBe(true);
    expect(usesWord("She ran home.", "run", [])).toBe(false);
  });

  it("rejects a word that only starts the same way", () => {
    expect(usesWord("What a catastrophe.", "cat", [])).toBe(false);
    expect(usesWord("That was good.", "go", [])).toBe(false);
  });

  it("rejects the word inside another word", () => {
    expect(usesWord("The uncanny valley.", "can", [])).toBe(false);
  });

  it("handles phrases, apostrophes and hyphens", () => {
    expect(usesWord("An  ad hoc fix.", "ad hoc", [])).toBe(true);
    expect(usesWord("It’s five o’clock.", "o'clock", [])).toBe(true);
    expect(usesWord("Good for my well-being.", "well-being", [])).toBe(true);
    expect(usesWord("An ad for hoc.", "ad hoc", [])).toBe(false);
  });
});

describe("checkSentence", () => {
  it("passes a good sentence", () => {
    expect(checkSentence("His reply was laconic.", "laconic", [])).toBeNull();
  });

  it("asks for more when it is too short", () => {
    expect(checkSentence("Laconic.", "laconic", [])).toMatch(/at least 10/);
  });

  it("rejects one that is too long", () => {
    const long = `laconic ${"a".repeat(280)}`;
    expect(checkSentence(long, "laconic", [])).toMatch(/under 280/);
  });

  it("asks for the word when it is missing", () => {
    expect(checkSentence("His reply was short.", "laconic", [])).toBe(
      'Use "laconic" in the sentence.',
    );
  });
});
