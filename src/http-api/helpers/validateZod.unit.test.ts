import {z, ZodError, ZodIssue} from 'zod';

import {validateZod} from './validateZod';

const TestSchema = z.object({
  amount: z.number(),
  name: z.string(),
});

type Data = z.infer<typeof TestSchema>;

describe('validateZod unit tests', () => {
  test('should validate schema and return data', () => {
    const data = {amount: 100, name: 'test'};

    expect(validateZod<Data>(data, TestSchema)).toEqual(data);
  });

  test('should throw error when schema invalid', () => {
    let e: ZodError | undefined = undefined;

    try {
      validateZod({}, TestSchema);
    } catch (error) {
      e = error as ZodError;
    }

    const zodError: ZodIssue[] = [
      {
        code: 'invalid_type',
        expected: 'number',
        received: 'undefined',
        path: ['amount'],
        message: 'Required',
      },
      {
        code: 'invalid_type',
        expected: 'string',
        received: 'undefined',
        path: ['name'],
        message: 'Required',
      },
    ];

    expect(e).toEqual(new ZodError(zodError));
  });
});
