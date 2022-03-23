import {ZodType} from 'zod';

/**
 * Validate `zod` JSON Schema
 *
 * @param data `unknown`
 * @param schema `ZodType<T>`
 * @returns `T`
 *
 * @see https://github.com/colinhacks/zod
 * @see https://2ality.com/2020/06/validating-data-typescript.html#example%3A-validating-data-via-the-library-zod
 */
export function validateZod<T>(data: unknown, schema: ZodType<T>): T {
  // Return data, or throw.
  return schema.parse(data);
}
