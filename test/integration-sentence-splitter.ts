import { split, TxtSentenceNode } from "sentence-splitter";
import { StringSource } from "../src/StringSource";
import assert from "assert";

describe("sentence-splitter", function () {
    it("should handle TxtSentenceNode without compile error", function () {
        const results = split("Hello world. This is a test.");
        const [sentence1, sentence2] = results.filter((r) => {
            return r.type === "Sentence";
        }) as TxtSentenceNode[];
        assert.strictEqual(new StringSource(sentence1).toString(), "Hello world.");
        assert.strictEqual(new StringSource(sentence2).toString(), "This is a test.");
    });
});
