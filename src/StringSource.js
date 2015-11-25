// LICENSE : MIT
"use strict";
import ObjectAssign from "object-assign";
import StructuredSource from "structured-source";
export default class StringSource {
    constructor(node) {
        this.rootNode = node;
        this.tokenMaps = [];
        this.generatedString = "";
        // pre calculate
        this._stringify(this.rootNode);
        this.originalSource = new StructuredSource(this.rootNode.raw);
        this.generatedSource = new StructuredSource(this.generatedString);
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

    /**
     * Pass index value and return original index value.
     * @param {number} targetIndex - position is a index value.
     * @returns {number|undefined} original
     */
    originalIndexFor(targetIndex) {
        let hitTokenMaps = this.tokenMaps.filter(tokenMap => {
            let generated = tokenMap.generated;
            if (generated[0] <= targetIndex && targetIndex < generated[1]) {
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
        // <----------->\[<------------->|text]
        //              ^        ^
        //   position-generated  intermediate-origin
        let outAdjust = targetIndex - hitTokenMap.generated[0];
        let inAdjust = hitTokenMap.intermediate[0] - hitTokenMap.original[0];
        return outAdjust + inAdjust + hitTokenMap.original[0];
    }

    originalPositionFor(position) {
        if (typeof position.line === "undefined" || typeof position.column === "undefined") {
            throw new Error("position.{line, column} should not undefined: " + JSON.stringify(position));
        }
        var generatedIndex = this.generatedSource.positionToIndex(position);
        if (isNaN(generatedIndex)) {
            // Not Found
            return;
        }
        let originalIndex = this.originalIndexFor(generatedIndex);
        return this.originalSource.indexToPosition(originalIndex);
    }


    isParagraphNode(node) {
        return node.type === "Paragraph";
    }

    isStringNode(node) {
        return node.type === "Str";
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

    _nodeRangeAsRelative(node) {
        // relative from root
        return [
            node.range[0] - this.rootNode.range[0],
            node.range[1] - this.rootNode.range[0]
        ]
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
        if (this.isParagraphNode(parent) && this.isStringNode(node)) {
            return {
                original: this._nodeRangeAsRelative(node),
                intermediate: this._nodeRangeAsRelative(node),
                value: value
            };
        }
        // <p><code>code</code></p>
        // => container is <p>
        // <p><strong><Str /></strong></p>
        // => container is <strong>
        let container = this.isParagraphNode(parent) ? node : parent;
        let rawValue = container.raw;
        let paddingLeft = rawValue.indexOf(value, 1); // avoid match ! with ![
        let paddingRight = rawValue.length - (paddingLeft + value.length);
        // original range should be relative value from rootNode
        let originalRange = this._nodeRangeAsRelative(container);
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
     * Compute text content of a node.  If the node itself
     * does not expose plain-text fields, `toString` will
     * recursivly try its children.
     *
     * @param {Node} node - Node to transform to a string.
     * @param {Node} [parent] - Parent Node of the `node`.
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
            if (tokenMap) {
                this._addTokenMap(tokenMap);
            }
        });
    }
}