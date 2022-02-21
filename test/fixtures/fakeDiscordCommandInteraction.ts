import {CommandInteraction} from 'discord.js';

/**
 * We need to extend it as we cannot call `new` to instantiate a `CommandInteraction`,
 * nor is there a static method to do so.
 */
export class FakeDiscordCommandInteraction extends CommandInteraction {
  constructor(client, data) {
    super(client, data);
  }
}
