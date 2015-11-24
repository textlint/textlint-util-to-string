# textlint-util-to-string

Convert `Paragraph` Node to plain text with SourceMap.

This library is for [textlint](https://github.com/textlint/textlint "textlint") and [textstat](https://github.com/azu/textstat "textstat").

## Installation

    npm install textlint-util-to-string

## Usage

```js
import assert from "power-assert"
import {parse} from "markdown-to-ast";
import StringSource from "textlint-util-to-string";

var originalText = "This is [Example！？](http://example.com/)";
let AST = parse(originalText);
let source = new StringSource(AST);
let result = source.toString();
assert.equal(result, "This is Example！？");
var index1 = result.indexOf("Example");
assert.equal(index1, 8);
// 8 -> 9
// originalText[9];// "E"
assert.equal(source.originalPositionFor(index1), 9);
var index2 = result.indexOf("！？");
assert.equal(index2, 15);
// 15 -> 16
// originalText[16];// "！"
assert.equal(source.originalPositionFor(index2), 16);
```

## Tests

    npm test

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License

MIT