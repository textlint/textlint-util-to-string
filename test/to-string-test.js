// LICENSE : MIT
"use strict";
import assert from "power-assert"
import {parse} from "markdown-to-ast";
import Stringify from "../src/to-string";
describe("to-string-test", function () {
    it("should", function () {
        let AST = parse("**str**");
        let st = new Stringify(AST);
        st.toString(AST);
    });
});