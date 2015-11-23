// LICENSE : MIT
"use strict";
export default class Stringify {
    constructor(node) {
        this.node = node;
        this.nodeMap = {};
    }

    revert(position) {

    }

    valueOf(node) {
        var value = (node.value ? node.value :
                     (node.alt ? node.alt : node.title)) || '';
        var paddingLeft = node.raw.indexOf(value);
        return {
            paddingLeft,
            value
        }
    }

    /**
     * Returns the text content of a node.  If the node itself
     * does not expose plain-text fields, `toString` will
     * recursivly try its children.
     *
     * @param {Node} node - Node to transform to a string.
     * @return {string} - Textual representation.
     */
    toString() {
        var theNode = this.node;
        return this.valueOf(theNode) ||
            (theNode.children && theNode.children.map(toString).join('')) ||
            '';
    }
}