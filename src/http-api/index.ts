import * as middlewareImports from './middleware';
import Application from 'koa';

export * from './httpServer';
export * from './koaInstance';

export const middlewares: (() => Application.Middleware)[] =
  Object.values(middlewareImports);
