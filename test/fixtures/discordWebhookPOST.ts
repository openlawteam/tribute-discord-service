import {APIMessage} from 'discord-api-types/v10';

export const DISCORD_WEBHOOK_POST_FIXTURE: APIMessage = {
  id: '888087338247405639',
  type: 0,
  content: '*0x92D8982351177eA1f991B66fc99f33DAa7615c4e* is up for vote.',
  channel_id: '886976610018934824',
  author: {
    bot: true,
    id: '886976872611729439',
    username: 'Tribute DAO [Test]',
    avatar: null,
    discriminator: '0000',
  },
  attachments: [],
  embeds: [
    {
      description: 'Membership for 0x92D89...c4e.',
      color: 0,
    },
  ],
  mentions: [],
  mention_roles: [],
  pinned: false,
  mention_everyone: false,
  tts: false,
  timestamp: '2021-09-16T15:42:01.303000+00:00',
  edited_timestamp: null,
  flags: 0,
  components: [],
  webhook_id: '886976872611729439',
};
