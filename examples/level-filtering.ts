/**
 * Level Filtering Example
 * Run: npm run example:levels
 */

import log, { create } from '../src/index';

console.log('=== Default Level (debug) - All messages shown ===\n');

log.debug('Debug message');
log.info('Info message');
log.warn('Warning message');
log.error('Error message');

console.log('\n=== Level: warn - Only warn, error, success shown ===\n');

const warnLog = create({ level: 'warn' });

warnLog.debug('This will NOT appear');
warnLog.info('This will NOT appear');
warnLog.warn('This WILL appear');
warnLog.error('This WILL appear');
warnLog.success('This WILL appear');

console.log('\n=== Level: error - Only error and success shown ===\n');

const errorLog = create({ level: 'error' });

errorLog.debug('Hidden');
errorLog.info('Hidden');
errorLog.warn('Hidden');
errorLog.error('Visible - Error!');
errorLog.success('Visible - Success!');

console.log('\n=== Runtime Level Change ===\n');

const appLog = create({ prefix: '[App]', level: 'debug' });
console.log(`Current level: ${appLog.getLevel()}`);

appLog.debug('Debug visible');
appLog.info('Info visible');

appLog.setLevel('error');
console.log(`\nLevel changed to: ${appLog.getLevel()}\n`);

appLog.debug('Debug hidden now');
appLog.info('Info hidden now');
appLog.error('Error still visible');
