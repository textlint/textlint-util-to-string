// LICENSE : MIT
"use strict";
import assert from "power-assert"
import {parse} from "markdown-to-ast";
import StringSource from "../src/StringSource";
describe("StringSource", function () {
    context("Each Pattern", function () {
        it("Str", function () {
            let AST = parse("**str**");
            let source = new StringSource(AST);
            let result = source.toString();
            assert.equal(result, "str");
            assert.equal(source.tokenMaps.length, 1);
            let token = source.tokenMaps[0];
            assert.deepEqual(token, {
                generated: [0, 3],
                intermediate: [2, 5],
                original: [0, 7],
                value: "str"
            });
        });
        it("Str that contain break line", function () {
            let AST = parse("**st\nr**");
            let source = new StringSource(AST);
            let result = source.toString();
            assert.equal(result, "st\nr");
            assert.equal(source.tokenMaps.length, 1);
            let token = source.tokenMaps[0];
            assert.deepEqual(token, {
                generated: [0, 4],
                intermediate: [2, 6],
                original: [0, 8],
                value: "st\nr"
            });
        });
        it("Link", function () {
            let AST = parse("_[link](http://example)");
            let source = new StringSource(AST);
            let result = source.toString();
            assert.equal(result, "_link");
            assert.equal(source.tokenMaps.length, 2);
            let tokenStr = source.tokenMaps[0];
            assert.deepEqual(tokenStr, {
                generated: [0, 1],
                intermediate: [0, 1],
                original: [0, 1],
                value: "_"
            });
            let tokenLink = source.tokenMaps[1];
            assert.deepEqual(tokenLink, {
                generated: [1, 5],
                intermediate: [2, 6],
                original: [1, 23],
                value: "link"
            });
        });
        it("Str + `Code` + Str", function () {
            let AST = parse("text`code`text");
            let source = new StringSource(AST);
            let result = source.toString();
            assert.equal(result, "textcodetext");
            assert.equal(source.tokenMaps.length, 3);
            assert.deepEqual(source.tokenMaps[0], {
                generated: [0, 4],
                intermediate: [0, 4],
                original: [0, 4],
                value: "text"
            });
            assert.deepEqual(source.tokenMaps[1], {
                generated: [4, 8],
                intermediate: [5, 9],
                original: [4, 10],
                value: "code"
            });
            assert.deepEqual(source.tokenMaps[2], {
                generated: [8, 12],
                intermediate: [10, 14],
                original: [10, 14],
                value: "text"
            });
        });
        it("Header", function () {
            let AST = parse("# Header");
            let source = new StringSource(AST);
            let result = source.toString();
            assert.equal(result, "Header");
            assert.equal(source.tokenMaps.length, 1);
            assert.deepEqual(source.tokenMaps[0], {
                generated: [0, 6],
                intermediate: [2, 8],
                original: [0, 8],
                value: "Header"
            });
        });
        it("Image + Str", function () {
            let AST = parse("![alt](http://example.png) text");
            let source = new StringSource(AST);
            let result = source.toString();
            assert.equal(result, "alt text");
            assert.equal(source.tokenMaps.length, 2);
            assert.deepEqual(source.tokenMaps[0], {
                generated: [0, 3],
                intermediate: [2, 5],
                original: [0, 26],
                value: "alt"
            });
            assert.deepEqual(source.tokenMaps[1], {
                generated: [3, 8],
                intermediate: [26, 31],
                original: [26, 31],
                value: " text"
            });
        });
        it("confuse pattern", function () {
            let AST = parse("![!](http://example.com)");
            let source = new StringSource(AST);
            let result = source.toString();
            assert.equal(result, "!");
            assert.equal(source.tokenMaps.length, 1);
            assert.deepEqual(source.tokenMaps[0], {
                generated: [0, 1],
                intermediate: [2, 3],
                original: [0, 24],
                value: "!"
            });
        });
        it("Empty", function () {
            let AST = parse("");
            let source = new StringSource(AST);
            let result = source.toString();
            assert.equal(result, "");
            assert.equal(source.tokenMaps.length, 0);
        });
    });

    describe("#originalPositionFor", function () {
        it("should return original position for index", function () {
            var originalText = "![alt](http://example.png) text";
            let AST = parse(originalText);
            let source = new StringSource(AST);
            let result = source.toString();
            assert.equal(result, "alt text");
            var indexOf = result.indexOf("text");
            assert.equal(indexOf, 4);
            assert.deepEqual(source.originalPositionFor(indexOf), 27);
            assert.equal(originalText.slice(27), "text");
        });
        it("should return null when not found position for index", function () {
            var originalText = "![alt](http://example.png) text";
            let AST = parse(originalText);
            let source = new StringSource(AST);
            let result = source.toString();
            assert.equal(result, "alt text");
            assert.equal(source.originalPositionFor(1000), null);
        });
    })
});
