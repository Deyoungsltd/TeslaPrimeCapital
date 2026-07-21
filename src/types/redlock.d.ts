declare module 'redlock' {
  import { Redis } from 'ioredis';

  export interface Lock {
    resource: string[];
    value: string;
    expiration: number;
    release(): Promise<void>;
    extend(ttl: number): Promise<Lock>;
  }

  export interface Options {
    driftFactor?: number;
    retryCount?: number;
    retryDelay?: number;
    retryJitter?: number;
    automaticExtensionThreshold?: number;
  }

  export default class Redlock {
    constructor(clients: Redis[], options?: Options);
    acquire(resources: string[], ttl: number): Promise<Lock>;
    release(lock: Lock): Promise<void>;
  }
}
