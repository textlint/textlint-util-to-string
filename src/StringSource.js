// LICENSE : MIT
"use strict";
import ObjectAssign from "object-assign";
export default class StringSource {
    constructor(node) {
        this.node = node;
        this.tokenMaps = [];
        this.generatedString = "";
        // pre calculate
        this._stringify(this.node);
        /*
        [
        // e.g.) **Str**
        {
            // original range
            // e.g.) [0, 7] = `**Str**`
            original : [start, end]
            // trim value from Original = intermediate
            // e.g.) [2, 5]
            intermediate: [start, end]
            // actual value = Str
            // e.g.) [0, 3]
            generated : [start, end]
        }]
         */
    }

    toString() {
        return this.generatedString;
    }

    originalPositionFor(position) {
        let hitTokenMaps = this.tokenMaps.filter(tokenMap => {
            let generated = tokenMap.generated;
            if (generated[0] <= position && position <= generated[1]) {
                return true;
            }
        });
        if (hitTokenMaps.length === 0) {
            return;
        }
        // a bcd
        // b = index 1
        // original `a` bcd
        // originalRange [3, 7]
        // adjustedStart = 1
        // b's index = 3 + 1
        let hitTokenMap = hitTokenMaps[0];
        let adjustedStart = position - hitTokenMap.generated[0];
        return hitTokenMap.original[0] + adjustedStart;
    }

    _getValue(node) {
        if (node.value) {
            return node.value;
        } else if (node.alt) {
            return node.alt;
        } else if (node.title) {
            return node.title;
        }
    }

    _valueOf(node, parent) {
        if (!node) {
            return;
        }


        // [padding][value][padding]
        // =>
        // [value][value][value]
        let value = this._getValue(node);
        if (!value) {
            return;
        }
        if (parent == null) {
            return;
        }
        // <p><Str /></p>
        if (parent.type === "Paragraph" && node.type === "Str") {
            return {
                original: node.range,
                intermediate: node.range,
                value: value
            };
        }
        // <p><code>code</code></p>
        // => container is <p>
        // <p><strong><Str /></strong></p>
        // => container is <strong>
        let container = (parent.type === "Paragraph") ? node : parent;
        let rawValue = container.raw;
        let paddingLeft = rawValue.indexOf(value, 1); // avoid match ! with ![
        let paddingRight = rawValue.length - (paddingLeft + value.length);
        let originalRange = container.range;
        let intermediateRange = [
            originalRange[0] + paddingLeft,
            originalRange[1] - paddingRight
        ];
        return {
            original: originalRange,
            intermediate: intermediateRange,
            value: value
        };

    }

    _addTokenMap(tokenMap) {
        if (tokenMap == null) {
            return;
        }
        let addedTokenMap = ObjectAssign({}, tokenMap);
        if (this.tokenMaps.length === 0) {
            let textLength = addedTokenMap.intermediate[1] - addedTokenMap.intermediate[0];
            addedTokenMap["generated"] = [0, textLength];
        } else {
            let textLength = addedTokenMap.intermediate[1] - addedTokenMap.intermediate[0];
            addedTokenMap["generated"] = [this.generatedString.length, this.generatedString.length + textLength];
        }
        this.generatedString += tokenMap.value;
        this.tokenMaps.push(addedTokenMap);
    }

    /**
     * Returns the text content of a node.  If the node itself
     * does not expose plain-text fields, `toString` will
     * recursivly try its children.
     *
     * @param {Node} node - Node to transform to a string.
     * @param {Node} parent - Parent Node of the `node`.
     * @return {string} - Textual representation.
     */
    _stringify(node, parent) {
        let value = this._valueOf(node, parent);
        if (value) {
            return value;
        }
        if (!node.children) {
            return;
        }
        node.children.forEach((childNode) => {
            let tokenMap = this._stringify(childNode, node);
            this._addTokenMap(tokenMap);
        });
    }
}