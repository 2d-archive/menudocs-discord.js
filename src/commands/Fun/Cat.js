import { Command, ShiryoEmbed } from "@lib";
import fetch from "node-fetch";


const subreddit = () => {
  const subreddits = ["cat", "cats", "catpics", "kittens"];
  return subreddits[Math.floor(Math.random() * subreddits.length)];
};

export const IMG_EXT = [".jpeg", ".jpg", ".png", ".gif", "webp"];

export default class extends Command {

  async run(message) {
    const data = await fetch(`https://imgur.com/r/${subreddit()}/hot.json`)
        .then((response) => response.json())
        .then((body) => body.data.filter((post) => IMG_EXT.includes(post.ext))),
      selected = data[Math.floor(Math.random() * data.length)];

    const embed = new ShiryoEmbed().setImage(
      `https://imgur.com/${selected.hash}${selected.ext.replace(/\?.*/, "")}`
    );

    return message.channel.send(embed);
  }

}
