import {Client, CommandInteraction} from 'discord.js';
import {RawInteractionData} from 'discord.js/typings/rawDataTypes';

/**
 * We need to extend it as we cannot call `new` to instantiate a `CommandInteraction`,
 * nor is there a static method to do so.
 */
export class FakeDiscordCommandInteraction extends CommandInteraction<any> {
  constructor(client: Client<boolean>, data: RawInteractionData) {
    super(client, data);
  }
}
