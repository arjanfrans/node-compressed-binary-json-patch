const assert = require('assert')
const BinaryProtocol = require('../src')
const msgpack = require('msgpack-lite')

describe('interface', function () {
    it('generateMapping with custom character set', () => {
        const mapping = BinaryProtocol.generateMapping([
            'hello',
            'world',
            'good',
            'bye'
        ], {}, 'abc')

        assert.deepStrictEqual(mapping, {
            hello: 'a',
            world: 'b',
            good: 'c',
            bye: 'aa'
        })
    })

    it('generateMapping with default character set', () => {
        const mapping = BinaryProtocol.generateMapping([
            'hello',
            'world'
        ])

        assert.deepStrictEqual(mapping, {
            hello: 'A',
            world: 'B'
        })
    })

    it('generateMapping with existing mapping', () => {
        const existingMapping = {
            good: 'a',
            bye: 'b'
        }

        const mapping = BinaryProtocol.generateMapping([
            'hello',
            'world',
            'mars'
        ], existingMapping, 'ab')

        assert.deepStrictEqual(mapping, {
            good: 'a',
            bye: 'b',
            hello: 'aa',
            world: 'ab',
            mars: 'ba'
        })
    })

    it('pack and unpack', () => {
        const mapping = {
            hello: 'h',
            world: 'w'
        }
        const protocol = BinaryProtocol.create(mapping);

        const data = {
            hello: 1234,
            world: 444
        }
        const packedData = protocol.pack(data)
        const unpackedData = protocol.unpack(packedData)

        assert.deepStrictEqual(unpackedData, data)
    })

    it('pack and unpack with previous', () => {
        const mapping = {
            hello: 'h',
            world: 'w'
        }
        const protocol = BinaryProtocol.create(mapping);

        const previousData = {
            hello: 123,
            world: 444
        }
        const data = {
            hello: [123],
            world: 444,
            unmapped: 'test'
        }
        const packedData = protocol.pack(data, previousData)

        assert.deepStrictEqual(msgpack.decode(packedData), [{
            p: '/h',
            v: [123],
            o: 'p'
        }, {
            o: 'a',
            v: 'test',
            p: '/unmapped'
        }])

        const unpackedData = protocol.unpack(packedData, previousData)

        assert.deepStrictEqual(unpackedData, data)
    })
})
