import { Module } from "@nestjs/common";
import { WinstonModule } from "nest-winston";
import * as winston from "winston";

@Module({
    imports: [
        WinstonModule.forRoot({
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.timestamp({
                            format: "YYYY-MM-DD HH:mm:ss",
                        }),
                        winston.format.errors({ stack: true }),
                        winston.format.colorize(),
                        winston.format.printf(
                            ({ timestamp, level, message, stack }: Record<string, string>) => {
                                return `${timestamp} ${level}: ${stack ?? message ?? ""}`;
                            },
                        ),
                    ),
                }),
            ],
        }),
    ],
    exports: [WinstonModule],
})
export class LoggerModule {}
