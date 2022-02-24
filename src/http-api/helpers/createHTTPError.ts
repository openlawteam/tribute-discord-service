import Application from 'koa';

export function createHTTPError({
  ctx,
  message,
  status,
}: {
  ctx: Application.ParameterizedContext<
    Application.DefaultState,
    Application.DefaultContext,
    any
  >;
  message: string;
  status: number;
}) {
  // Set `ctx.status`
  ctx.status = status;

  // Set `ctx.body`
  ctx.body = {
    error: {
      message,
      status,
    },
  };
}
