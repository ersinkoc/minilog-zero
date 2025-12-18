/**
 * Object Logging Example
 * Run: npm run example:objects
 */

import log from '../src/index';

console.log('=== Logging Objects ===\n');

const user = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  roles: ['admin', 'user']
};

log.info('User data:', user);

console.log('\n=== Logging Arrays ===\n');

const items = ['apple', 'banana', 'orange'];
log.debug('Shopping list:', items);

const numbers = [1, 2, 3, 4, 5];
log.info('Numbers:', numbers);

console.log('\n=== Logging Nested Objects ===\n');

const config = {
  server: {
    host: 'localhost',
    port: 3000
  },
  database: {
    url: 'mongodb://localhost:27017',
    name: 'myapp'
  },
  features: {
    cache: true,
    logging: true
  }
};

log.debug('Config:', config);

console.log('\n=== Logging Special Values ===\n');

log.info('Null value:', null);
log.info('Undefined value:', undefined);
log.info('Boolean:', true);
log.info('Number:', 42);

console.log('\n=== Circular Reference Handling ===\n');

const circular: Record<string, unknown> = { name: 'circular' };
circular.self = circular;

log.warn('Circular object:', circular);

console.log('\n=== Error Objects ===\n');

const error = new Error('Something went wrong');
log.error('Error occurred:', error.message);
