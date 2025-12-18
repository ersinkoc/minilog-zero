# minilog-zero

[![npm version](https://img.shields.io/npm/v/minilog-zero.svg)](https://www.npmjs.com/package/minilog-zero)
[![license](https://img.shields.io/npm/l/minilog-zero.svg)](https://github.com/ersinkoc/minilog-zero/blob/main/LICENSE)
[![node](https://img.shields.io/node/v/minilog-zero.svg)](https://nodejs.org)

Zero-dependency colorful console logger with levels, timestamps and prefixes.

## Features

- 🎨 **Colorful output** - ANSI colors for each log level
- 📊 **Log levels** - debug, info, warn, error, success
- ⏰ **Timestamps** - Optional ISO format timestamps
- 🏷️ **Prefixes** - Custom prefix for each logger instance
- 🎚️ **Level filtering** - Filter logs by minimum level
- 🔄 **Runtime control** - Change log level at runtime
- 🏭 **Factory pattern** - Create multiple logger instances
- 📦 **Zero dependencies** - No external runtime dependencies
- 💪 **TypeScript** - Full type definitions included

## Installation

```bash
npm install minilog-zero
```

## Quick Start

```javascript
const log = require('minilog-zero');

log.debug('Debug message');
log.info('Info message');
log.warn('Warning message');
log.error('Error message');
log.success('Success message');
```

## API Reference

| Method | Description |
|--------|-------------|
| `debug(...args)` | Log debug message (gray, level 0) |
| `info(...args)` | Log info message (cyan, level 1) |
| `warn(...args)` | Log warning message (yellow, level 2) |
| `error(...args)` | Log error message (red, level 3) |
| `success(...args)` | Log success message (green, level 3) |
| `create(options)` | Create new logger instance |
| `setLevel(level)` | Set minimum log level |
| `getLevel()` | Get current log level |

## Log Levels

| Level | Priority | Color | Icon |
|-------|----------|-------|------|
| debug | 0 | Gray | 🔍 |
| info | 1 | Cyan | ℹ️ |
| warn | 2 | Yellow | ⚠️ |
| error | 3 | Red | ❌ |
| success | 3 | Green | ✅ |

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `prefix` | `string` | `''` | Prefix to prepend to all messages |
| `timestamp` | `boolean` | `false` | Include ISO timestamp |
| `level` | `LogLevel` | `'debug'` | Minimum log level to display |
| `icons` | `boolean` | `true` | Show emoji icons |

## Usage Examples

### Basic Usage

```javascript
const log = require('minilog-zero');

log.info('Application started');
log.debug('Config loaded:', { port: 3000 });
log.warn('Deprecated API used');
log.error('Connection failed');
log.success('Data saved successfully');
```

### With Timestamp

```javascript
const { create } = require('minilog-zero');

const log = create({ timestamp: true });
log.info('Server started');
// Output: ℹ️ [2024-01-15T10:30:00.000Z] [INFO] Server started
```

### With Prefix

```javascript
const { create } = require('minilog-zero');

const log = create({ prefix: '[MyApp]' });
log.info('Initializing...');
// Output: ℹ️ [MyApp] [INFO] Initializing...
```

### Level Filtering

```javascript
const { create } = require('minilog-zero');

const log = create({ level: 'warn' });
log.debug('Not shown');  // Filtered out
log.info('Not shown');   // Filtered out
log.warn('Shown');       // Displayed
log.error('Shown');      // Displayed
```

### Runtime Level Change

```javascript
const log = require('minilog-zero');

log.setLevel('error');
console.log(log.getLevel()); // 'error'

log.info('Not shown');  // Filtered out
log.error('Shown');     // Displayed
```

### Multiple Logger Instances

```javascript
const { create } = require('minilog-zero');

const apiLog = create({ prefix: '[API]', level: 'info' });
const dbLog = create({ prefix: '[DB]', level: 'warn' });

apiLog.info('Request received');
dbLog.warn('Slow query detected');
```

### Logging Objects

```javascript
const log = require('minilog-zero');

log.info('User data:', { name: 'John', age: 30 });
log.debug('Array:', [1, 2, 3]);
log.error('Error details:', new Error('Something went wrong'));
```

## TypeScript Usage

```typescript
import log, { create, Logger, LogLevel, LoggerOptions } from 'minilog-zero';

// Using default logger
log.info('Hello, TypeScript!');

// Creating typed logger
const options: LoggerOptions = {
  prefix: '[App]',
  timestamp: true,
  level: 'info',
  icons: true
};

const appLog: Logger = create(options);
appLog.success('TypeScript is awesome!');

// Type-safe level setting
const level: LogLevel = 'warn';
appLog.setLevel(level);
```

## License

MIT
