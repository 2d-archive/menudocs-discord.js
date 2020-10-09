import { Command } from "@lib";
import ms from "ms";

export default class extends Command {

  constructor(...args) {
    super(...args, {
      aliases: ["ut"],
      description: "This provides the current uptime of the bot.",
      category: "Utilities"
    });
  }

  async run(message) {
    message.channel.send(
      `My uptime is \`${ms(this.client.uptime, { long: true })}\``
    );
  }

}
