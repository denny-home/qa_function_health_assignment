const path = require('path');

const isDebug =
  process.env.PWDEBUG === '1' ||
  process.env.DEBUG === 'true';

function timestamp() {
  return new Date().toISOString();
}

function getCallerInfo() {
  const stack = new Error().stack.split('\n');

  for (let i = 2; i < stack.length; i++) {
    const line = stack[i];

    if (!line.includes('logger.js')) {
      const match = line.match(/\((.*):(\d+):(\d+)\)/);

      if (match) {
        const file = path.basename(match[1]);
        const lineNumber = match[2];
        return `${file}:${lineNumber}`;
      }
    }
  }

  return 'unknown';
}

function format(icon, level, args) {
  const time = timestamp();
  const location = getCallerInfo();
  const message = args.join(' ');

  return `${icon} [${time}] [${level}] [${location}] ${message}`;
}

function log(...args) {
  console.log(format('ℹ️', 'INFO', args));
}

function debug(...args) {
  if (isDebug) {
    console.debug(format('🐞', 'DEBUG', args));
  }
}

function warn(...args) {
  console.warn(format('⚠️', 'WARN', args));
}

function error(...args) {
  console.error(format('❌', 'ERROR', args));
}

function success(...args) {
  console.log(format('✅', 'SUCCESS', args));
}

module.exports = {log, debug, warn, error, success};