// LICENSE : MIT
"use strict";
import assert from "assert";
import { parse } from "@textlint/markdown-to-ast";
import type { TxtNode, TxtParentNode } from "@textlint/ast-node-types";
import { StructuredSource } from "structured-source";
import { StringSource } from "../src/StringSource";

type TokenMap = {
    original: readonly [number, number];
    intermediate: readonly [number, number];
    generatedValue: string;
    generated?: readonly [number, number];
};

/**
 * StringSource#originalIndexFromIndex of textlint-util-to-string 3.3.4.
 * It is the reference to check that the current implementation returns the same results.
 */
const originalIndexFromIndex_3_3_4 = (tokenMaps: TokenMap[], generatedIndex: number, isEnd = false) => {
    const hitTokenMaps = tokenMaps.filter((tokenMap, index) => {
        const generated = tokenMap.generated;
        const nextTokenMap = tokenMaps[index + 1];
        const nextGenerated = nextTokenMap ? nextTokenMap.generated : null;
        if (!generated) {
            return false;
        }
        if (nextGenerated) {
            if (generated[0] <= generatedIndex && generatedIndex <= nextGenerated[0]) {
                return true;
            }
        } else {
            if (generated[0] <= generatedIndex && generatedIndex <= generated[1]) {
                return true;
            }
        }
        return false;
    });
    if (hitTokenMaps.length === 0) {
        return;
    }
    const hitTokenMap = isEnd ? hitTokenMaps[0] : hitTokenMaps[hitTokenMaps.length - 1];
    if (!hitTokenMap.generated) {
        return;
    }
    const outerAdjust = generatedIndex - hitTokenMap.generated[0];
    const innerAdjust = hitTokenMap.intermediate[0] - hitTokenMap.original[0];
    return outerAdjust + innerAdjust + hitTokenMap.original[0];
};

const markdown = `This is **strong** and *emphasis* and \`code\` text.

[link **text**](https://example.com "title") and ![alt text](https://example.com/img.png) end.

Line 1
Line 2 with <span>html</span> and <b>bold</b>.

- list item with __strong__
    - nested \`code\` item

> quote with [link](https://example.com)

日本語の**文章**です。\`コード\`と[リンク](https://example.com)。

**a****b** *c*d \`e\`f

![](https://example.com/empty-alt.png)
`;

const collectParagraphs = (node: TxtNode, results: TxtParentNode[] = []) => {
    if (node.type === "Paragraph") {
        results.push(node as TxtParentNode);
    }
    ((node as TxtParentNode).children || []).forEach((child) => collectParagraphs(child, results));
    return results;
};

describe("compatibility with 3.3.4", () => {
    const AST = parse(markdown);
    const nodes: TxtParentNode[] = [AST, ...collectParagraphs(AST)];
    nodes.forEach((node) => {
        it(`should return the same original index for ${JSON.stringify(node.raw.slice(0, 30))}`, () => {
            const source = new StringSource(node);
            const tokenMaps: TokenMap[] = (source as any).tokenMaps;
            const generated = source.toString();
            // generated ranges are the same as 3.3.4: [length of generated string before it, + length of intermediate]
            let generatedLength = 0;
            tokenMaps.forEach((tokenMap) => {
                assert.deepStrictEqual(Object.keys(tokenMap), [
                    "original",
                    "intermediate",
                    "generatedValue",
                    "generated"
                ]);
                assert.deepStrictEqual(tokenMap.generated, [
                    generatedLength,
                    generatedLength + tokenMap.intermediate[1] - tokenMap.intermediate[0]
                ]);
                generatedLength += tokenMap.generatedValue.length;
            });
            assert.strictEqual(generatedLength, generated.length);
            for (let index = -1; index <= generated.length + 1; index++) {
                assert.strictEqual(
                    source.originalIndexFromIndex(index),
                    originalIndexFromIndex_3_3_4(tokenMaps, index),
                    `index: ${index}`
                );
                assert.strictEqual(
                    source.originalIndexFromIndex(index, true),
                    originalIndexFromIndex_3_3_4(tokenMaps, index, true),
                    `index: ${index}, isEnd: true`
                );
            }
        });
        it(`should return the same original position for ${JSON.stringify(node.raw.slice(0, 30))}`, () => {
            const source = new StringSource(node);
            const tokenMaps: TokenMap[] = (source as any).tokenMaps;
            const originalSource = new StructuredSource(node.raw);
            const generatedSource = new StructuredSource(source.toString());
            for (let index = 0; index <= source.toString().length; index++) {
                const expectedIndex = originalIndexFromIndex_3_3_4(tokenMaps, index);
                const expectedPosition =
                    expectedIndex === undefined ? undefined : originalSource.indexToPosition(expectedIndex);
                assert.deepStrictEqual(source.originalPositionFromIndex(index), expectedPosition);
                const generatedPosition = generatedSource.indexToPosition(index);
                assert.deepStrictEqual(source.originalPositionFromPosition(generatedPosition), expectedPosition);
                assert.strictEqual(
                    source.originalIndexFromPosition(generatedPosition),
                    expectedPosition === undefined ? undefined : originalSource.positionToIndex(expectedPosition)
                );
            }
        });
    });
});
