import { Controller, Get } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Controller('health')
export class HealthController {
  @Get()
  async check() {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: 'ok',
        python: await this.checkPython(),
        mediapipe: await this.checkMediaPipe(),
      },
    };

    return health;
  }

  private async checkPython(): Promise<string> {
    try {
      const pythonPath = process.env.PYTHON_PATH || 'python3';
      const { stdout } = await execAsync(`${pythonPath} --version`);
      return stdout.trim();
    } catch {
      return 'unavailable';
    }
  }

  private async checkMediaPipe(): Promise<string> {
    try {
      const pythonPath = process.env.PYTHON_PATH || 'python3';
      const { stdout } = await execAsync(
        `${pythonPath} -c "import mediapipe; print(mediapipe.__version__)"`,
      );
      return `v${stdout.trim()}`;
    } catch {
      return 'unavailable';
    }
  }
}
