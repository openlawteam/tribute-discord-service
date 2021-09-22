/**
 * Prisma client singleton
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/instantiate-prisma-client
 */

import {PrismaClient} from '@prisma/client';

export const prisma = new PrismaClient();
