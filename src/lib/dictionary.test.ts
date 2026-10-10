import { describe, expect, it } from "vitest";
import { cleanQuery, normalise, pickSuggestions } from "./dictionary";

describe("cleanQuery", () => {
  it("lowercases and trims", () => {
    expect(cleanQuery("  Laconic ")).toBe("laconic");
  });

  it("keeps hyphens, apostrophes and single spaces", () => {
    expect(cleanQuery("well-being")).toBe("well-being");
    expect(cleanQuery("o'clock")).toBe("o'clock");
    expect(cleanQuery("ad   hoc")).toBe("ad hoc");
  });

  it("rejects empty, numeric and overlong input", () => {
    expect(cleanQuery("")).toBeNull();
    expect(cleanQuery("42")).toBeNull();
    expect(cleanQuery("a".repeat(51))).toBeNull();
  });
});

describe("normalise", () => {
  it("merges entries by part of speech and caps definitions", () => {
    const entry = normalise("run", {
      entries: [
        {
          partOfSpeech: "verb",
          pronunciations: [{ text: "/rʌn/" }],
          senses: [
            { definition: "one", examples: ["I run."] },
            { definition: "two" },
          ],
        },
        {
          partOfSpeech: "verb",
          senses: [{ definition: "three" }, { definition: "four" }],
        },
        { partOfSpeech: "noun", senses: [{ definition: "a jog" }] },
      ],
    });

    expect(entry?.phonetic).toBe("/rʌn/");
    expect(entry?.meanings.map((meaning) => meaning.partOfSpeech)).toEqual([
      "verb",
      "noun",
    ]);
    expect(entry?.meanings[0].definitions).toEqual([
      { definition: "one", example: "I run." },
      { definition: "two" },
      { definition: "three" },
    ]);
  });

  it("dedupes and caps synonyms from both levels", () => {
    const entry = normalise("big", {
      entries: [
        {
          partOfSpeech: "adjective",
          synonyms: ["large", "huge", "vast", "giant", "great", "grand"],
          senses: [{ definition: "of great size", synonyms: ["large", "tall"] }],
        },
      ],
    });

    expect(entry?.meanings[0].synonyms).toEqual([
      "large",
      "tall",
      "huge",
      "vast",
      "giant",
      "great",
    ]);
  });

  it("picks the first pronunciation and skips related-word notes", () => {
    const entry = normalise("laconic", {
      entries: [
        {
          partOfSpeech: "adjective",
          pronunciations: [{ text: "/ləˈkɒnɪk/" }, { text: "/ləˈkɑnɪk/" }],
          synonyms: ["brief"],
          senses: [
            {
              definition: "using few words",
              examples: ["Near-synonym: brief", "A laconic reply."],
              synonyms: ["terse"],
            },
            { definition: "of a speaker, concise", examples: ["Synonyms: curt, terse"] },
          ],
        },
      ],
    });

    expect(entry).toEqual({
      word: "laconic",
      phonetic: "/ləˈkɒnɪk/",
      meanings: [
        {
          partOfSpeech: "adjective",
          definitions: [
            { definition: "using few words", example: "A laconic reply." },
            { definition: "of a speaker, concise" },
          ],
          synonyms: ["terse", "brief"],
        },
      ],
      forms: [],
    });
  });

  it("keeps inflected forms and drops table markup and the word itself", () => {
    const entry = normalise("run", {
      entries: [
        {
          partOfSpeech: "verb",
          forms: [
            { word: "runs", tags: ["present"] },
            { word: "Ran", tags: ["past"] },
            { word: "run", tags: ["participle"] },
            { word: "no-table-tags", tags: ["table-tags"] },
            { word: "glossary", tags: ["inflection-template"] },
            { word: "ran", tags: ["past", "plural"] },
            {},
          ],
          senses: [{ definition: "to move fast" }],
        },
        {
          partOfSpeech: "noun",
          forms: [{ word: "runs", tags: ["plural"] }],
          senses: [{ definition: "a jog" }],
        },
      ],
    });

    expect(entry?.forms).toEqual(["runs", "ran"]);
  });

  it("returns null when nothing has a definition", () => {
    expect(normalise("zzz", { entries: [{ partOfSpeech: "noun" }] })).toBeNull();
    expect(normalise("zzz", { entries: [] })).toBeNull();
    expect(normalise("zzz", {})).toBeNull();
  });
});

describe("pickSuggestions", () => {
  it("drops the original word, bad entries and repeats, and keeps three", () => {
    const results = [
      { word: "definately", score: 9 },
      { word: "Definitely", score: 8 },
      { word: "definitely", score: 7 },
      { word: "route 66", score: 6 },
      { score: 5 },
      { word: "delicately", score: 4 },
      { word: "ice cream", score: 3 },
      { word: "finally", score: 2 },
    ];

    expect(pickSuggestions("definately", results)).toEqual([
      "definitely",
      "delicately",
      "ice cream",
    ]);
  });

  it("gives nothing for an unexpected response", () => {
    expect(pickSuggestions("cat", null)).toEqual([]);
    expect(pickSuggestions("cat", { message: "error" })).toEqual([]);
  });
});
