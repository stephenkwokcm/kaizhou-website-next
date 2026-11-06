import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

// Resolve the dependency Payload actually loads, including its pnpm patch.
const require = createRequire(import.meta.resolve("payload"));

for (const entry of ["deepmerge", "deepmerge/dist/umd.js"]) {
  const merge = require(entry);

  test(`${entry}: blocks prototype poisoning in both merge inputs`, () => {
    const malicious = JSON.parse('{"__proto__":{"isAdmin":true},"constructor":{"prototype":{"isAdmin":true}},"prototype":{"isAdmin":true}}');
    const results = [
      merge(Object.create(null), malicious),
      merge(malicious, {}),
      merge(malicious, malicious),
      merge({ session: null }, { session: malicious }).session,
      merge({ session: 1 }, { session: malicious }).session,
      merge({}, { session: malicious }).session,
      merge([], [malicious])[0],
    ];
    for (const result of results) {
      assert.equal(Object.getPrototypeOf(result), Object.prototype);
      assert.equal(result.isAdmin, undefined);
      for (const key of ["__proto__", "constructor", "prototype"]) {
        assert.equal(Object.hasOwn(result, key), false);
      }
    }
    assert.equal({}.isAdmin, undefined);
  });

  test(`${entry}: preserves nested merges and Payload's array options`, () => {
    const symbol = Symbol("field");
    const date = new Date(0);
    const target = { nested: { a: 1 }, items: [1], [symbol]: "kept", date };
    const source = { nested: { b: 2 }, items: [2] };
    assert.deepEqual(merge(target, source), {
      nested: { a: 1, b: 2 }, items: [1, 2], [symbol]: "kept", date,
    });
    assert.deepEqual(merge(target, source, { arrayMerge: (_, value) => value }).items, [2]);
    assert.deepEqual(target.items, [1]);
    assert.deepEqual(merge.all([{ a: 1 }, { b: 2 }]), { a: 1, b: 2 });
  });
}
