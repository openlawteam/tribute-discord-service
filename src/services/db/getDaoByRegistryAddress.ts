import prisma from '../../prismaClientInstance';

export async function getDaoByRegistryAddress(registryAddress: string) {
  try {
    return await prisma.dao.findUnique({
      select: {name: true, fullURL: true, registryAddress: true},
      /**
       * We only trim the value for whitespace as Prisma search is case insensitive.
       *
       * @see https://www.prisma.io/docs/concepts/components/prisma-client/case-sensitivity
       */
      where: {registryAddress: registryAddress.trim()},
    });
  } catch (error) {
    throw error;
  }
}
