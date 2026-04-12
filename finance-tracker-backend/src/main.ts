import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ⭐ SECURITY: Strict CORS - only allow specific origins
  const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map(origin => origin.trim());
  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Total-Count'],
    maxAge: 3600,
  });

  // ⭐ SECURITY: Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      skipMissingProperties: false,
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  const port = parseInt(process.env.APP_PORT || '3000', 10);
  const host = process.env.APP_HOST || '0.0.0.0';

  await app.listen(port, host);

  console.log(`✅ Server running at http://${host}:${port}`);
  global['appStartTime'] = Date.now();
}

bootstrap().catch((error) => {
  console.error('❌ Application failed to start:', error.message);
  process.exit(1);
});