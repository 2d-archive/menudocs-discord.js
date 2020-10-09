import { Command, MenuDocsEmbed } from "@lib";
import fetch from "node-fetch";
import { IMG_EXT } from "./Cat";

const subreddit = () => {
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
  return subreddits[Math.floor(Math.random() * subreddits.length)];
};


export default class MemeCommand extends Command {

  async run(message) {
    const data = await fetch(`https://imgur.com/r/${subreddit()}/hot.json`)
        .then((res) => res.json())
        .then((res) => res.data.filter((post) => IMG_EXT.includes(post.ext))),
      selected = data[Math.floor(Math.random() * data.length)];

    const embed = new MenuDocsEmbed().setImage(
      `https://imgur.com/${selected.hash}${selected.ext.replace(/\?.*/, "")}`
    );

    return message.channel.send(embed);
  }

}
