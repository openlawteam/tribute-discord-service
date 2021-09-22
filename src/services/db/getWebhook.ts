import {prisma} from '../../singletons';

export async function getWebhookByWebhookID(webhookID: string) {
  try {
    return await prisma.discordWebhook.findUnique({
      select: {webhookID: true, webhookToken: true, name: true},
      where: {webhookID},
    });
  } catch (error) {
    throw error;
  }
}
