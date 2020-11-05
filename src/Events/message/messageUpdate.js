import { Listener, ShiryoEmbed } from "@lib";
import { diffWordsWithSpace } from "diff";
import { Util } from "discord.js";

export default class extends Listener {

  async run(old, message) {
    if (
      !message.guild ||
      old.content === message.content ||
      message.author.bot
    ) {
      return;
    }

    const embed = new ShiryoEmbed()
      .setColor("BLUE")
      .setAuthor(
        old.author.tag,
        this.client.user.displayAvatarURL({ dynamic: true })
      )
      .setTitle("Message Updated")
      .setDescription([
        `**❯ Message ID:** ${old.id}`,
        `**❯ Channel:** ${old.channel}`,
        `**❯ Author:** ${old.author.tag} (${old.author.id})`
      ])
      .setURL(old.url)
      .splitFields(
        diffWordsWithSpace(
          Util.escapeMarkdown(old.content),
          Util.escapeMarkdown(message.content)
        )
          .map((result) =>
            result.added ?
              `**${result.value}**` :
              result.removed ?
                `~~${result.value}~~` :
                result.value
          )
          .join(" ")
      );

    const channel = message.guild.channels.cache.find(
      (ch) => ch.name === "testing"
    );
    if (channel) channel.send(embed);
  }

}
