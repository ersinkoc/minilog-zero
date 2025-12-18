/**
 * minilog-zero test suite
 * Using Node.js built-in assert module (zero external dependencies)
 */

import assert from 'assert';
import log, { create, LogLevel } from '../src/index';

// Test counters
let passed = 0;
let failed = 0;

/**
 * Simple test runner
 */
function test(name: string, fn: () => void): void {
  try {
    fn();
    passed++;
    console.log(`✅ ${name}`);
  } catch (error) {
    failed++;
    console.log(`❌ ${name}`);
    if (error instanceof Error) {
      console.log(`   Error: ${error.message}`);
    }
  }
}

console.log('\n🧪 minilog-zero Test Suite\n');
console.log('='.repeat(50) + '\n');

// Test 1: Default logger has all methods
test('Default logger has all methods', () => {
  assert.strictEqual(typeof log.debug, 'function');
  assert.strictEqual(typeof log.info, 'function');
  assert.strictEqual(typeof log.warn, 'function');
  assert.strictEqual(typeof log.error, 'function');
  assert.strictEqual(typeof log.success, 'function');
  assert.strictEqual(typeof log.create, 'function');
  assert.strictEqual(typeof log.setLevel, 'function');
  assert.strictEqual(typeof log.getLevel, 'function');
});

// Test 2: create() returns logger instance
test('create() returns logger instance', () => {
  const customLog = create({ prefix: '[Test]' });
  assert.strictEqual(typeof customLog.debug, 'function');
  assert.strictEqual(typeof customLog.info, 'function');
  assert.strictEqual(typeof customLog.warn, 'function');
  assert.strictEqual(typeof customLog.error, 'function');
  assert.strictEqual(typeof customLog.success, 'function');
});

// Test 3: setLevel changes log level
test('setLevel changes log level', () => {
  const testLog = create({ level: 'debug' });
  assert.strictEqual(testLog.getLevel(), 'debug');

  testLog.setLevel('warn');
  assert.strictEqual(testLog.getLevel(), 'warn');

  testLog.setLevel('error');
  assert.strictEqual(testLog.getLevel(), 'error');
});

// Test 4: Level filtering works
test('Level filtering works', () => {
  // Capture console output (warn uses console.warn)
  const outputs: string[] = [];
  const originalLog = console.log;
  const originalWarn = console.warn;
  console.log = (...args: unknown[]) => {
    outputs.push(args.join(' '));
  };
  console.warn = (...args: unknown[]) => {
    outputs.push(args.join(' '));
  };

  const testLog = create({ level: 'warn', icons: false });
  testLog.debug('should not appear');
  testLog.info('should not appear');
  testLog.warn('should appear');

  // Restore console
  console.log = originalLog;
  console.warn = originalWarn;

  // Debug and info should be filtered out
  assert.strictEqual(outputs.length, 1);
  assert.ok(outputs[0].includes('should appear'));
});

// Test 5: Options are applied correctly
test('Options are applied correctly', () => {
  const outputs: string[] = [];
  const originalLog = console.log;
  console.log = (...args: unknown[]) => {
    outputs.push(args.join(' '));
  };

  const testLog = create({
    prefix: '[MyApp]',
    timestamp: true,
    icons: true,
    level: 'debug'
  });
  testLog.info('test message');

  console.log = originalLog;

  assert.strictEqual(outputs.length, 1);
  assert.ok(outputs[0].includes('[MyApp]'), 'Should include prefix');
  assert.ok(outputs[0].includes('[INFO]'), 'Should include level');
  assert.ok(outputs[0].includes('test message'), 'Should include message');
});

// Test 6: Objects are stringified without error
test('Objects are stringified without error', () => {
  const outputs: string[] = [];
  const originalLog = console.log;
  console.log = (...args: unknown[]) => {
    outputs.push(args.join(' '));
  };

  const testLog = create({ icons: false });

  // Test various object types
  testLog.info({ name: 'test', value: 123 });
  testLog.info([1, 2, 3]);
  testLog.info(null);
  testLog.info(undefined);

  console.log = originalLog;

  assert.strictEqual(outputs.length, 4);
  assert.ok(outputs[0].includes('"name"'));
  assert.ok(outputs[1].includes('['));
  assert.ok(outputs[2].includes('null'));
  assert.ok(outputs[3].includes('undefined'));
});

// Test 7: Multiple arguments work
test('Multiple arguments work', () => {
  const outputs: string[] = [];
  const originalLog = console.log;
  console.log = (...args: unknown[]) => {
    outputs.push(args.join(' '));
  };

  const testLog = create({ icons: false });
  testLog.info('Hello', 'World', 123, { key: 'value' });

  console.log = originalLog;

  assert.strictEqual(outputs.length, 1);
  assert.ok(outputs[0].includes('Hello'));
  assert.ok(outputs[0].includes('World'));
  assert.ok(outputs[0].includes('123'));
  assert.ok(outputs[0].includes('"key"'));
});

// Test 8: Circular reference handling
test('Circular reference handling', () => {
  const outputs: string[] = [];
  const originalLog = console.log;
  console.log = (...args: unknown[]) => {
    outputs.push(args.join(' '));
  };

  const testLog = create({ icons: false });

  // Create circular reference
  const obj: Record<string, unknown> = { name: 'test' };
  obj.self = obj;

  // Should not throw
  testLog.info(obj);

  console.log = originalLog;

  assert.strictEqual(outputs.length, 1);
  assert.ok(outputs[0].includes('[Circular]'));
});

// Test 9: Default level is debug
test('Default level is debug', () => {
  const testLog = create();
  assert.strictEqual(testLog.getLevel(), 'debug');
});

// Test 10: Logger instance create method works
test('Logger instance create method works', () => {
  const logger1 = create({ prefix: '[App1]' });
  const logger2 = logger1.create({ prefix: '[App2]' });

  assert.strictEqual(typeof logger2.info, 'function');
  assert.notStrictEqual(logger1, logger2);
});

// ============================================================
// REGRESSION TESTS FOR BUG FIXES
// ============================================================

// Test 11: BUG-002 - setLevel throws on invalid level
test('BUG-002: setLevel throws TypeError on invalid level', () => {
  const testLog = create({ level: 'debug' });
  let threw = false;
  try {
    testLog.setLevel('invalid' as LogLevel);
  } catch (e) {
    threw = true;
    assert.ok(e instanceof TypeError);
    assert.ok((e as Error).message.includes('Invalid log level'));
  }
  assert.strictEqual(threw, true, 'Should have thrown TypeError');
});

// Test 12: BUG-003 - Child logger inherits parent options
test('BUG-003: Child logger inherits parent level', () => {
  const parent = create({ level: 'warn' });
  const child = parent.create();
  assert.strictEqual(child.getLevel(), 'warn');
});

// Test 13: BUG-003 - Child logger can override parent options
test('BUG-003: Child logger can override parent options', () => {
  const parent = create({ level: 'warn' });
  const child = parent.create({ level: 'debug' });
  assert.strictEqual(parent.getLevel(), 'warn');
  assert.strictEqual(child.getLevel(), 'debug');
});

// Test 14: BUG-004 - Error objects show message and name
test('BUG-004: Error objects are properly serialized', () => {
  const outputs: string[] = [];
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    outputs.push(args.join(' '));
  };

  const testLog = create({ icons: false });
  const err = new Error('Test error message');
  testLog.error(err);

  console.error = originalError;

  assert.strictEqual(outputs.length, 1);
  assert.ok(outputs[0].includes('Test error message'), 'Should include error message');
  assert.ok(outputs[0].includes('"name"'), 'Should include error name');
});

// Test 15: BUG-004 - Error custom properties are included
test('BUG-004: Error custom properties are included', () => {
  const outputs: string[] = [];
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    outputs.push(args.join(' '));
  };

  const testLog = create({ icons: false });
  const err = new Error('Test') as Error & { code: string };
  err.code = 'ERR_CUSTOM';
  testLog.error(err);

  console.error = originalError;

  assert.strictEqual(outputs.length, 1);
  assert.ok(outputs[0].includes('ERR_CUSTOM'), 'Should include custom error property');
});

// Test 16: BUG-005 - Map is properly serialized
test('BUG-005: Map objects are properly serialized', () => {
  const outputs: string[] = [];
  const originalLog = console.log;
  console.log = (...args: unknown[]) => {
    outputs.push(args.join(' '));
  };

  const testLog = create({ icons: false });
  testLog.info(new Map([['key', 'value']]));

  console.log = originalLog;

  assert.strictEqual(outputs.length, 1);
  assert.ok(outputs[0].includes('Map(1)'), 'Should show Map with size');
  assert.ok(outputs[0].includes('key'), 'Should include map key');
  assert.ok(outputs[0].includes('value'), 'Should include map value');
});

// Test 17: BUG-005 - Set is properly serialized
test('BUG-005: Set objects are properly serialized', () => {
  const outputs: string[] = [];
  const originalLog = console.log;
  console.log = (...args: unknown[]) => {
    outputs.push(args.join(' '));
  };

  const testLog = create({ icons: false });
  testLog.info(new Set([1, 2, 3]));

  console.log = originalLog;

  assert.strictEqual(outputs.length, 1);
  assert.ok(outputs[0].includes('Set(3)'), 'Should show Set with size');
  assert.ok(outputs[0].includes('1'), 'Should include set value');
});

// Test 18: BUG-005 - RegExp is properly serialized
test('BUG-005: RegExp objects are properly serialized', () => {
  const outputs: string[] = [];
  const originalLog = console.log;
  console.log = (...args: unknown[]) => {
    outputs.push(args.join(' '));
  };

  const testLog = create({ icons: false });
  testLog.info(/test[a-z]+/gi);

  console.log = originalLog;

  assert.strictEqual(outputs.length, 1);
  assert.ok(outputs[0].includes('/test[a-z]+/gi'), 'Should show RegExp as string');
});

// Test 19: Date objects are properly serialized
test('Date objects are properly serialized', () => {
  const outputs: string[] = [];
  const originalLog = console.log;
  console.log = (...args: unknown[]) => {
    outputs.push(args.join(' '));
  };

  const testLog = create({ icons: false });
  const date = new Date('2024-01-15T10:30:00.000Z');
  testLog.info(date);

  console.log = originalLog;

  assert.strictEqual(outputs.length, 1);
  assert.ok(outputs[0].includes('2024-01-15'), 'Should include date in ISO format');
});

// Test 20: BigInt values are handled
test('BigInt values are properly serialized', () => {
  const outputs: string[] = [];
  const originalLog = console.log;
  console.log = (...args: unknown[]) => {
    outputs.push(args.join(' '));
  };

  const testLog = create({ icons: false });
  testLog.info(123n);

  console.log = originalLog;

  assert.strictEqual(outputs.length, 1);
  assert.ok(outputs[0].includes('123n'), 'Should show BigInt with n suffix');
});

// Summary
console.log('\n' + '='.repeat(50));
console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 All tests passed!\n');
  process.exit(0);
}
