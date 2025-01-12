import { Module } from "@nestjs/common";
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ConfigurationType } from './env/configuration';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<ConfigurationType, true>) => ({
        transport: {
          // host: configService.get('SMTP_HOST'),
          host: configService.get('mailerSettings', {infer: true}).SMTP_HOST,
          port: Number(configService.get('mailerSettings', {infer: true}).SMTP_PORT),
          auth: {
            // user: configService.get('SMTP_USER'),
            user: configService.get('mailerSettings', {infer: true}).SMTP_USER,
            pass: configService.get('mailerSettings', {infer: true}).SMTP_PASSWORD,
          },
        }
      }),
    }),
  ],
})

export class  MailSendModule{}
