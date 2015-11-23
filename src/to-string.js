// LICENSE : MIT
"use strict";
class Token {
    constructor() {

    }
}
export default class Stringify {
    constructor(node) {
        this.node = node;
        this.nodeMap = {};
        /*
        start: {
        // start with node.range relative
            generated : [start, end]
            original : [start, end]
        }
         */
    }

    revert(position) {

    }

    valueOf(node, parent) {
        if (!node) {
            return;
        }
        // [padding][value][padding]
        // =>
        // [value][value][value]
        var value = (node.value ? node.value :
                     (node.alt ? node.alt : node.title)) || '';
        if (parent == null) {
            return value;
        }
        console.log(node.type + "=>" + value);
        if (value.length === 0) {
            return;
        }
        let rawValue = parent.raw;
        console.log(rawValue);
        let paddingLeft = rawValue.indexOf(value);
        let paddingRight = rawValue.length - (paddingLeft + value.length);

        let originalRange = [
            this.node.range[0] - parent.range[0],
            this.node.range[0] - parent.range[0] + parent.range[1]
        ];
        let generatedRange = [
            originalRange[0] + paddingLeft,
            originalRange[1] - paddingRight
        ];
        console.log("padding", paddingLeft, paddingRight);
        console.log("G", generatedRange, originalRange);
        return value;
    }

    /**
     * Returns the text content of a node.  If the node itself
     * does not expose plain-text fields, `toString` will
     * recursivly try its children.
     *
     * @param {Node} node - Node to transform to a string.
     * @return {string} - Textual representation.
     */
    toString(node, parent) {
        let value = this.valueOf(node, parent);
        if (value) {
            return value;
        }
        return (node.children && node.children.map((childNode) => {
                let parentOfChildNode = node;
                return this.toString(childNode, parentOfChildNode);
            }).join('')) || '';
    }
}