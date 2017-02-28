const debug = require('debug');
const StringNumeralSystem = require('string-numeral-system')

const jsonpatch = require('fast-json-patch')
const msgpack = require('msgpack-lite')

const PACK_DIFF_KEYS = {
    value: 'v',
    op: 'o',
    path: 'p',
    v: 'value',
    o: 'op',
    p: 'path'
}
const UNPACK_DIFF_KEYS = {
    value: 'value',
    op: 'op',
    path: 'path',
    v: 'v',
    o: 'o',
    p: 'p'
}

function invertObject (obj) {
    return Object.keys(obj).reduce((output, key) => {
        const value = obj[key]

        output[value] = key

        return output
    }, {})
}

const OPERATIONS_KEYS = {
    add: 'a',
    remove: 'r',
    replace: 'p',
    move: 'm',
    copy: 'c',
    test: 't'
}
const INVERTED_OPERATIONS_KEYS = invertObject(OPERATIONS_KEYS);

function BinaryDiffProtocol (compressionMapping, throwOnUnmappedKey) {
    const decompressionMapping = invertObject(compressionMapping)

    function transformDiff (diff, keyMapping, operationsMapping, mapping) {
        const result = []

        for (const patch of diff) {
            const transformedDiff = {
                [keyMapping.path]: ''
            }

            const keys = patch[keyMapping.p].substring(1).split('/')

            for (const key of keys) {
                const mappedKey = mapping[key]

                if (!mappedKey && throwOnUnmappedKey) {
                    throw new Error(`Unmapped key: "${key}".`);
                }

                transformedDiff[keyMapping.path] += `/${mappedKey || key}`
            }

            transformedDiff[keyMapping.value] = patch[keyMapping.v]
            transformedDiff[keyMapping.op] = operationsMapping[patch[keyMapping.o]]

            result.push(transformedDiff)
        }

        return result
    }

    function compress (diff) {
        return transformDiff(diff, PACK_DIFF_KEYS, OPERATIONS_KEYS, compressionMapping)
    }

    function decompress (diff) {
        return transformDiff(diff, UNPACK_DIFF_KEYS, INVERTED_OPERATIONS_KEYS, decompressionMapping)
    }

    function pack (data, previousData) {
        const diff = jsonpatch.compare(previousData || {}, data)
        const compressedDiff = compress(diff)
        const encodedDiff = msgpack.encode(compressedDiff)

        return encodedDiff
    }

    function unpack (binaryData, previousData) {
        const encodedDiff = new Uint8Array(binaryData)
        const compressedDiff = msgpack.decode(encodedDiff)
        const diff = decompress(compressedDiff)
        const data = Object.assign({}, previousData)

        jsonpatch.apply(data, diff)

        return data
    }

    return {
        pack,
        unpack
    }
}

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='

/**
 * Generate a mapping for the compression of pack and unpacking. An existing mapping
 * can be provided to expand on, if it was generated using the same character set.
 *
 * @param {array} originalKeys - Keys to generate a mapping for.
 * @param {object} [existingMapping] - An existing mapping to expand on.
 * @param {string} chars - A custom character set to use for the generated keys.
 *
 * @returns {object} The generated mapping.
 */
function generateMapping (originalKeys, existingMapping, chars) {
    chars = chars || CHARS;

    const sns = StringNumeralSystem(chars)
    const mapping = Object.assign({}, existingMapping);

    let last = chars[0];

    if (existingMapping) {
        for (const existingKey of Object.keys(existingMapping)) {
            const value = existingMapping[existingKey];

            if (sns.max(value, last) === value) {
                last = sns.increment(value);
            }
        }
    }

    for (const originalKey of originalKeys) {
        if (!mapping[originalKey]) {
            mapping[originalKey] = last;

            last = sns.increment(last);
        }
    }

    return mapping;
}

module.exports = { create: BinaryDiffProtocol, generateMapping };
