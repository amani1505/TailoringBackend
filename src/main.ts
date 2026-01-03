import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Set global prefix
  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT || 3003;
  await app.listen(port);

  console.log(`
  ╔═══════════════════════════════════════════════════════════╗
  ║                                                           ║
  ║   🎯 Tailoring Measurement API Server                    ║
  ║                                                           ║
  ║   🚀 Server is running on: http://localhost:${port}       ║
  ║   📖 API Prefix: /api/v1                                 ║
  ║   🌍 Environment: ${process.env.NODE_ENV || 'development'}                            ║
  ║   🐘 Database: PostgreSQL                                ║
  ║   🤖 AI Engine: MediaPipe                                ║
  ║                                                           ║
  ╚═══════════════════════════════════════════════════════════╝
  `);
}

bootstrap();
