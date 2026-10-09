import { describe, expect, it } from "vitest";
import { cleanQuery, fromFallback, normalise } from "./dictionary";

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
    const entry = normalise("run", [
      {
        phonetic: "/rʌn/",
        meanings: [
          {
            partOfSpeech: "verb",
            definitions: [
              { definition: "one", example: "I run." },
              { definition: "two" },
            ],
          },
        ],
      },
      {
        meanings: [
          {
            partOfSpeech: "verb",
            definitions: [{ definition: "three" }, { definition: "four" }],
          },
          { partOfSpeech: "noun", definitions: [{ definition: "a jog" }] },
        ],
      },
    ]);

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
    const entry = normalise("big", [
      {
        meanings: [
          {
            partOfSpeech: "adjective",
            synonyms: ["large", "huge", "vast", "giant", "great", "grand"],
            definitions: [{ definition: "of great size", synonyms: ["large", "tall"] }],
          },
        ],
      },
    ]);

    expect(entry?.meanings[0].synonyms).toEqual([
      "large",
      "tall",
      "huge",
      "vast",
      "giant",
      "great",
    ]);
  });

  it("picks the first audio clip and makes it https", () => {
    const entry = normalise("cat", [
      {
        phonetics: [{ text: "/kæt/" }, { audio: "//cdn.example/cat.mp3" }],
        meanings: [{ partOfSpeech: "noun", definitions: [{ definition: "a pet" }] }],
      },
    ]);

    expect(entry?.phonetic).toBe("/kæt/");
    expect(entry?.audio_url).toBe("https://cdn.example/cat.mp3");
  });

  it("returns null when nothing has a definition", () => {
    expect(normalise("zzz", [{ meanings: [{ partOfSpeech: "noun" }] }])).toBeNull();
    expect(normalise("zzz", [])).toBeNull();
  });
});

describe("fromFallback", () => {
  it("reshapes entries so normalise can read them", () => {
    const entry = normalise(
      "laconic",
      fromFallback({
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
      }),
    );

    expect(entry).toEqual({
      word: "laconic",
      phonetic: "/ləˈkɒnɪk/",
      audio_url: null,
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
    });
  });

  it("gives nothing for a word with no entries", () => {
    expect(normalise("zzz", fromFallback({ entries: [] }))).toBeNull();
    expect(normalise("zzz", fromFallback({}))).toBeNull();
  });
});
