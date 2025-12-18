/**
 * Basic Usage Example
 * Run: npm run example:basic
 */

import log from '../src/index';

console.log('=== Basic Usage ===\n');

// All log levels
log.debug('This is a debug message');
log.info('This is an info message');
log.warn('This is a warning message');
log.error('This is an error message');
log.success('This is a success message');

console.log('\n=== With Multiple Arguments ===\n');

log.info('User logged in:', 'john@example.com');
log.debug('Request params:', 'id=123', 'page=1');
log.success('Created', 3, 'new records');
