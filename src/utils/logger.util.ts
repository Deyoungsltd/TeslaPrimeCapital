/**
 * TeslaPrimeCapital — Universal Structured JSON Logger Utility (`logger.util.ts`)
 * Browser-safe and server-safe structured logging across edge, client, and Node container environments.
 */

export interface ILoggerMeta {
  [key: string]: any;
}

class UniversalLogger {
  private formatMessage(level: string, message: string, meta?: ILoggerMeta): string {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const metaString = meta && Object.keys(meta).length ? ` | Meta: ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] [teslaprime-enterprise]: ${message}${metaString}`;
  }

  public info(message: string, meta?: ILoggerMeta): void {
    if (typeof window === 'undefined') {
      console.log(this.formatMessage('info', message, meta));
    } else {
      console.info(`[INFO] ${message}`, meta || '');
    }
  }

  public warn(message: string, meta?: ILoggerMeta): void {
    if (typeof window === 'undefined') {
      console.warn(this.formatMessage('warn', message, meta));
    } else {
      console.warn(`[WARN] ${message}`, meta || '');
    }
  }

  public error(message: string, meta?: ILoggerMeta): void {
    if (typeof window === 'undefined') {
      console.error(this.formatMessage('error', message, meta));
    } else {
      console.error(`[ERROR] ${message}`, meta || '');
    }
  }

  public debug(message: string, meta?: ILoggerMeta): void {
    if (process.env.NODE_ENV !== 'production') {
      if (typeof window === 'undefined') {
        console.debug(this.formatMessage('debug', message, meta));
      } else {
        console.debug(`[DEBUG] ${message}`, meta || '');
      }
    }
  }
}

export const logger = new UniversalLogger();
