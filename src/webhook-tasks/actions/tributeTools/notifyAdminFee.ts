import {fromWei, toBN} from 'web3-utils';
import {MessageEmbed} from 'discord.js';

import {actionErrorHandler} from '../helpers/actionErrorHandler';
import {APP_ENV} from '../../../config';
import {filterDiscordsByActiveAction} from '../../../helpers';
import {getDiscordAction} from '../../../helpers';
import {getDiscordConfigs, getDiscordWebhookClient} from '../../../services';
import {TRIBUTE_TOOLS_ADMIN_FEE_EVENT} from '../../events';
import {TributeToolsFeeWebhookPayload} from '../../../http-api/middleware/tributeTools/tributeToolsFeeWebhook';

export async function notifyAdminFee(
  payload: TributeToolsFeeWebhookPayload
): Promise<void> {
  try {
    const {amount, daoName, description, totalContribution} = payload;

    const discordConfigsFiltered = filterDiscordsByActiveAction(
      await getDiscordConfigs(),
      'TRIBUTE_TOOLS_ADMIN_FEE_WEBHOOK'
    );

    // Run for each discord config for which the action is active for
    Object.entries(discordConfigsFiltered).forEach(async ([_, config]) => {
      try {
        const action = getDiscordAction(
          'TRIBUTE_TOOLS_ADMIN_FEE_WEBHOOK',
          config
        );

        if (!action) return;

        const client = await getDiscordWebhookClient(action.webhookID);

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

        const env = APP_ENV === 'production' ? '' : '[DEV]';

        await client.send({
          embeds: [embed],
          username: `Tribute Tools ${env}`,
        });
      } catch (error) {
        // Do not throw, let the loop continue to run
        console.error(
          `Something went wrong while sending admin fee Discord message to \`${config.friendlyName}\`: ${error}`
        );
      }
    });
  } catch (error) {
    if (error instanceof Error) {
      actionErrorHandler({
        actionName: 'SPONSORED_PROPOSAL_WEBHOOK',
        error,
        event: TRIBUTE_TOOLS_ADMIN_FEE_EVENT,
      });
    }
  }
}
