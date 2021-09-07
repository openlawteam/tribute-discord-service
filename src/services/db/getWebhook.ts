import prisma from '../../prismaClientInstance';

export async function getWebhookByWebhookID(webhookID: string) {
  try {
    return await prisma.discordWebhook.findUnique({
      select: {webhookID: true, webhookToken: true, daoId: true},
      where: {webhookID},
    });
  } catch (error) {
    throw error;
  }
}
