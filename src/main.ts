  import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from './core/settings/env/configuration';
  import { applyAppSettings } from './core/settings/apply-app.settings';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: true
  });

  applyAppSettings(app)

  const configService = app.get(ConfigService<ConfigurationType, true>);
  const apiSettings = configService.get('apiSettings', { infer: true });
  const environmentSettings = configService.get('environmentSettings', {
    infer: true,
  });
  await app.listen(
    apiSettings.PORT,
    () => {
      console.log('DB connect');
      console.log('Port: ', apiSettings.PORT);
      console.log('ENV: ', environmentSettings.currentEnv);
    }
  );
}
bootstrap();
