import {
  ILifeCycle,
  IMidwayApplication,
  IMidwayContainer,
  MidwayDecoratorService,
} from '@midwayjs/core';
import { App, Configuration, Init, Inject } from '@midwayjs/decorator';
import { ENTITY_MODEL_KEY } from './decorator';
import { MikroDataSourceManager } from './dataSourceManager';

@Configuration({
  importConfigs: [
    {
      default: {
        mikro: {},
      },
    },
  ],
  namespace: 'mikro',
})
export class MikroConfiguration implements ILifeCycle {
  @App()
  app: IMidwayApplication;

  @Inject()
  decoratorService: MidwayDecoratorService;

  dataSourceManager: MikroDataSourceManager;

  @Init()
  async init() {
    this.decoratorService.registerPropertyHandler(
      ENTITY_MODEL_KEY,
      (
        propertyName,
        meta: {
          modelKey: string;
          connectionName: string;
        }
      ) => {
        return this.dataSourceManager
          .getDataSource(meta.connectionName)
          .em.getRepository(meta.modelKey);
      }
    );
  }

  async onReady(container: IMidwayContainer) {
    this.dataSourceManager = await container.getAsync(MikroDataSourceManager);
  }

  async onStop(container: IMidwayContainer) {
    if (this.dataSourceManager) {
      await this.dataSourceManager.stop();
    }
  }
}