import prisma from '../../client';

export async function getWebhookByWebhookID(webhookID: string) {
  try {
    return await prisma.discordWebhook.findUnique({
      select: {webhookID: true},
      where: {webhookID},
    });
  } catch (error) {
    throw error;
  }
}
