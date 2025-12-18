/**
 * Custom Logger Example
 * Run: npm run example:custom
 */

import { create } from '../src/index';

console.log('=== Custom Logger with Prefix ===\n');

const apiLog = create({
  prefix: '[API]',
  icons: true
});

apiLog.info('Server starting...');
apiLog.success('Server running on port 3000');
apiLog.warn('Rate limit approaching');

console.log('\n=== With Timestamp ===\n');

const dbLog = create({
  prefix: '[Database]',
  timestamp: true,
  icons: true
});

dbLog.info('Connecting to database...');
dbLog.success('Connected to MongoDB');
dbLog.debug('Query executed in 45ms');

console.log('\n=== Multiple Loggers ===\n');

const authLog = create({ prefix: '[Auth]' });
const cacheLog = create({ prefix: '[Cache]' });

authLog.info('User authentication started');
cacheLog.debug('Cache miss for key: user_123');
authLog.success('User authenticated successfully');
cacheLog.info('Cache updated');
