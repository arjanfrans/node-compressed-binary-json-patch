# compressed-binary-json-patch 
[![npm version](https://img.shields.io/npm/v/@arjanfrans/compressed-binary-json-patch.svg)](https://www.npmjs.com/package/@arjanfrans/compressed-binary-json-patch)
[![Build Status](https://travis-ci.org/arjanfrans/@arjanfrans/compressed-binary-json-patch.svg?branch=master)](https://travis-ci.org/arjanfrans/@arjanfrans/compressed-binary-json-patch)
[![Coverage Status](https://coveralls.io/repos/arjanfrans/@arjanfrans/compressed-binary-json-patch/badge.svg)](https://coveralls.io/r/arjanfrans/@arjanfrans/compressed-binary-json-patch)
[![devDependency Status](https://david-dm.org/arjanfrans/@arjanfrans/compressed-binary-json-patch/status.svg)](https://david-dm.org/arjanfrans/@arjanfrans/compressed-binary-json-patch#info=dependencies)
[![devDependency Status](https://david-dm.org/arjanfrans/@arjanfrans/compressed-binary-json-patch/dev-status.svg)](https://david-dm.org/arjanfrans/@arjanfrans/compressed-binary-json-patch#info=devDependencies)

Pack and unpack objects and compress them by substituting known keys in the object.
When packing a json patch is generated, a previous state of the object can be provided,
and it is converted to binary using [msgpack](https://github.com/msgpack). Unpacking applies
this process in reverse.

## Installation

```
npm install --save @arjanfrans/compressed-binary-json-patch
```

## Usage

See [tests](./test/index.js).
