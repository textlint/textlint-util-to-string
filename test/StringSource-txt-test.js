// LICENSE : MIT
"use strict";
import assert from "power-assert"
import {parse} from "markdown-to-ast";
import StringSource from "../src/StringSource";
import sentenceSplitter from "sentence-splitter";
describe("StringSource", function () {
    describe("#toString", function () {
        it("should concat string", function () {
            const AST = {
                "type": "Document",
                "raw": "Str",
                "range": [
                    0,
                    3
                ],
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 0
                    },
                    "end": {
                        "line": 1,
                        "column": 3
                    }
                },
                "children": [
                    {
                        "type": "Paragraph",
                        "raw": "Str",
                        "range": [
                            0,
                            3
                        ],
                        "loc": {
                            "start": {
                                "line": 1,
                                "column": 0
                            },
                            "end": {
                                "line": 1,
                                "column": 3
                            }
                        },
                        "children": [
                            {
                                "type": "Str",
                                "raw": "Str",
                                "value": "Str",
                                "range": [
                                    0,
                                    3
                                ],
                                "loc": {
                                    "start": {
                                        "line": 1,
                                        "column": 0
                                    },
                                    "end": {
                                        "line": 1,
                                        "column": 3
                                    }
                                }
                            }
                        ]
                    }
                ]
            };
            let source = new StringSource(AST);
            var text = source.toString();
            assert.equal(text + "!!", "Str!!");
        });
    });
});
