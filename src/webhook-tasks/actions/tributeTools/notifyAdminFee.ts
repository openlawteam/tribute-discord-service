import {fromWei, toBN} from 'web3-utils';
import {MessageEmbed} from 'discord.js';

import {APP_ENV} from '../../../config';
import {getDiscordWebhookClient} from '../../../services';
import {TributeToolsFeeWebhookPayload} from '../../../http-api/middleware/tributeTools/tributeToolsFeeWebhook';

// @todo move
const WEBHOOK_ID: string =
  APP_ENV === 'production' ? '956221982540709888' : '886976872611729439';

export async function notifyAdminFee(
  payload: TributeToolsFeeWebhookPayload
): Promise<void> {
  try {
    const {amount, daoName, description, totalContribution} = payload;

    const client = await getDiscordWebhookClient(WEBHOOK_ID);

    const amountETH: string = fromWei(toBN(amount), 'ether');

    const totalContributionETH: string = fromWei(
      toBN(totalContribution),
      'ether'
    );

    const embed = new MessageEmbed()
      .setTitle('💸 Admin Fee Due')
      .setDescription(description)
      .addFields([
        {name: 'DAO', value: daoName},
        {name: 'Amount', value: `${amountETH} ETH`},
        {name: 'Total Contribution', value: `${totalContributionETH} ETH`},
      ]);

    await client.send({
      embeds: [embed],
      username: `Tribute Tools${APP_ENV === 'production' ? '' : ' [dev]'}`,
    });
  } catch (error) {
    throw error;
  }
}
