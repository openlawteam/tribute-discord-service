import {PrismaClient} from '@prisma/client';
import {mockDeep, mockReset} from 'jest-mock-extended';
import {DeepMockProxy} from 'jest-mock-extended/lib/mjs/Mock';

import prisma from '../src/singletons/prismaClientInstance';

/**
 * Mock Prisma client
 *
 * @see https://www.prisma.io/docs/guides/testing/unit-testing#singleton
 */

jest.mock('../src/singletons/prismaClientInstance', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

beforeEach(() => {
  mockReset(prismaMock);
});

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;
