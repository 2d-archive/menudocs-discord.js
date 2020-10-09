import { Command, MenuDocsEmbed } from "@lib";
import fetch from "node-fetch";
import { EXTENSIONS } from "./Cat";

const subreddits = [
  "memes",
  "DeepFriedMemes",
  "bonehurtingjuice",
  "surrealmemes",
  "dankmemes",
  "meirl",
  "me_irl",
  "funny"
];

export default class MemeCommand extends Command {

  async run(message) {
    const data = await fetch(
        `https://imgur.com/r/${
          subreddits[Math.floor(Math.random() * subreddits.length)]
        }/hot.json`
      )
        .then((response) => response.json())
        .then((body) =>
          body.data.filter((post) => EXTENSIONS.includes(post.ext))
        ),
      selected = data[Math.floor(Math.random() * data.length)];

    const embed = new MenuDocsEmbed().setImage(
      `https://imgur.com/${selected.hash}${selected.ext.replace(/\?.*/, "")}`
    );

    return message.channel.send(embed);
  }

}
