import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as os from 'os';

@Injectable()
export class SystemService {
  constructor(private readonly dataSource: DataSource) {}

  getHealth() {
    const uptimeMs = Date.now() - global['appStartTime'];
    const uptimeSeconds = Math.floor(uptimeMs / 1000);

    return {
      status: 'ok',

      uptime: uptimeSeconds + 's',

      memory: {
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + ' MB',
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      },

      cpu: os.loadavg()[0].toFixed(2),

      database: this.dataSource.isInitialized ? 'connected' : 'disconnected',

      timestamp: new Date(),
    };
  }
}