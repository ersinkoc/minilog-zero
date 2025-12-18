/**
 * minilog-zero test suite
 * Using Node.js built-in assert module (zero external dependencies)
 */

import assert from 'assert';
import log, { create, Logger, LogLevel } from '../src/index';

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

// Summary
console.log('\n' + '='.repeat(50));
console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 All tests passed!\n');
  process.exit(0);
}
