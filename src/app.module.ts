import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DatabaseConfig } from "./config/database.config";
import { UsersModule } from "./users/users.module";
import { TailorsModule } from "./tailors/tailors.module";
import { MeasurementModule } from "./measurements/measurement.module";
import { HealthController } from "./health.controller";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfig,
    }),
    UsersModule,
    TailorsModule,
    MeasurementModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
