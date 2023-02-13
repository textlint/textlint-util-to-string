import { split } from "sentence-splitter";
import { StringSource } from "../src/StringSource";
import assert from "assert";

describe("sentence-splitter", function () {
    it("should handle TxtSentenceNode without compile error", function () {
        const [sentence1, _whitespace, sentence2] = split("Hello world. This is a test.");
        assert.strictEqual(new StringSource(sentence1).toString(), "Hello world.");
        assert.strictEqual(new StringSource(sentence2).toString(), "This is a test.");
    });
});
