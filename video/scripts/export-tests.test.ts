import { describe, expect, it } from "vitest";
import { pickTests, testTitles } from "./export-tests";

const file = `
describe("allowGuide", () => {
  it("refuses questions without Upstash in production (fails closed)", async () => {});
  it.skip("is skipped", () => {});
  it.todo("is not written yet");
  test(\`the tile is on \${path}\`, async () => {});
  it('uses single quotes', () => {});
});
`;

describe("export-tests", () => {
  it("reads it( and test( titles, leaving out skipped and todo tests", () => {
    expect(testTitles(file)).toEqual([
      "refuses questions without Upstash in production (fails closed)",
      "the tile is on ${path}",
      "uses single quotes",
    ]);
  });

  it("returns only titles that exist in the test files, and names the missing ones", () => {
    const files = { "src/lib/rate-limit.test.ts": file };
    const { tests, missing } = pickTests(
      [
        { file: "src/lib/rate-limit.test.ts", title: "refuses questions without Upstash in production (fails closed)" },
        { file: "src/lib/rate-limit.test.ts", title: "is skipped" },
        { file: "src/lib/nowhere.test.ts", title: "anything" },
      ],
      files,
    );
    expect(tests).toEqual([{ file: "src/lib/rate-limit.test.ts", title: "refuses questions without Upstash in production (fails closed)" }]);
    expect(missing).toHaveLength(2);
  });
});
