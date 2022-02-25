import * as middlewareImports from './middleware';
import Application from 'koa';
import Router from '@koa/router';

export * from './httpServer';

export const middlewares: (Application.Middleware | Router.Middleware)[] =
  Object.values(middlewareImports);
