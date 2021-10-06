import * as middlewareImports from './middleware';
import Application from 'koa';

export * from './httpServer';

export const middlewares: (() => Application.Middleware)[] =
  Object.values(middlewareImports);
