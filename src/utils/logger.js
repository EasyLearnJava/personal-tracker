const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log file paths
const errorLogFile = path.join(logsDir, 'error.log');
const infoLogFile = path.join(logsDir, 'info.log');
const debugLogFile = path.join(logsDir, 'debug.log');
const allLogsFile = path.join(logsDir, 'all.log');

// Get current timestamp
const getTimestamp = () => {
  return new Date().toISOString();
};

// Format log message
const formatLogMessage = (level, message, data = null) => {
  const timestamp = getTimestamp();
  let logMessage = `[${timestamp}] [${level}] ${message}`;
  
  if (data) {
    if (typeof data === 'object') {
      logMessage += `\n${JSON.stringify(data, null, 2)}`;
    } else {
      logMessage += `\n${data}`;
    }
  }
  
  return logMessage;
};

// Write to file
const writeToFile = (filePath, message) => {
  try {
    fs.appendFileSync(filePath, message + '\n' + '='.repeat(80) + '\n\n', 'utf8');
  } catch (error) {
    console.error(`Failed to write to log file ${filePath}:`, error);
  }
};

// Logger class
class Logger {
  static error(message, data = null) {
    const logMessage = formatLogMessage('ERROR', message, data);
    console.error(logMessage);
    writeToFile(errorLogFile, logMessage);
    writeToFile(allLogsFile, logMessage);
  }

  static info(message, data = null) {
    const logMessage = formatLogMessage('INFO', message, data);
    console.log(logMessage);
    writeToFile(infoLogFile, logMessage);
    writeToFile(allLogsFile, logMessage);
  }

  static debug(message, data = null) {
    if (process.env.NODE_ENV === 'development') {
      const logMessage = formatLogMessage('DEBUG', message, data);
      console.log(logMessage);
      writeToFile(debugLogFile, logMessage);
      writeToFile(allLogsFile, logMessage);
    }
  }

  static warn(message, data = null) {
    const logMessage = formatLogMessage('WARN', message, data);
    console.warn(logMessage);
    writeToFile(allLogsFile, logMessage);
  }

  static logRequest(method, path, statusCode, duration) {
    const logMessage = formatLogMessage('REQUEST', `${method} ${path} - ${statusCode}`, { duration: `${duration}ms` });
    writeToFile(infoLogFile, logMessage);
    writeToFile(allLogsFile, logMessage);
  }

  static logAuthEvent(event, email, success, details = null) {
    const logMessage = formatLogMessage('AUTH', `${event} - ${email} - ${success ? 'SUCCESS' : 'FAILED'}`, details);
    writeToFile(infoLogFile, logMessage);
    writeToFile(allLogsFile, logMessage);
    if (!success) {
      writeToFile(errorLogFile, logMessage);
    }
  }

  static logDatabaseOperation(operation, table, success, details = null) {
    const logMessage = formatLogMessage('DATABASE', `${operation} on ${table} - ${success ? 'SUCCESS' : 'FAILED'}`, details);
    writeToFile(infoLogFile, logMessage);
    writeToFile(allLogsFile, logMessage);
    if (!success) {
      writeToFile(errorLogFile, logMessage);
    }
  }

  static logException(error, context = null) {
    const errorData = {
      message: error.message,
      stack: error.stack,
      code: error.code,
      context: context
    };
    const logMessage = formatLogMessage('EXCEPTION', 'Unhandled Exception', errorData);
    console.error(logMessage);
    writeToFile(errorLogFile, logMessage);
    writeToFile(allLogsFile, logMessage);
  }

  static getLogFiles() {
    return {
      errorLog: errorLogFile,
      infoLog: infoLogFile,
      debugLog: debugLogFile,
      allLog: allLogsFile,
      logsDir: logsDir
    };
  }

  static clearLogs() {
    try {
      fs.writeFileSync(errorLogFile, '', 'utf8');
      fs.writeFileSync(infoLogFile, '', 'utf8');
      fs.writeFileSync(debugLogFile, '', 'utf8');
      fs.writeFileSync(allLogsFile, '', 'utf8');
      console.log('All logs cleared');
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
  }

  static readLogs(logType = 'all') {
    try {
      let filePath;
      switch (logType) {
        case 'error':
          filePath = errorLogFile;
          break;
        case 'info':
          filePath = infoLogFile;
          break;
        case 'debug':
          filePath = debugLogFile;
          break;
        case 'all':
        default:
          filePath = allLogsFile;
          break;
      }

      if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, 'utf8');
      }
      return 'No logs found';
    } catch (error) {
      return `Error reading logs: ${error.message}`;
    }
  }
}

module.exports = Logger;

