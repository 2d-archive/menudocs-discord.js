import fetch from "node-fetch";
import { Command, MenuDocsEmbed } from "@lib";
import { EXTENSIONS } from "./Cat";

const subreddits = ["dog", "dogs", "dogpics", "puppies"];

export default class DogCommand extends Command {

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
