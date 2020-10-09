import { Command } from "@lib";
import { promisify } from "util";
import _figlet from "figlet";

const figlet = promisify(_figlet);
export default class extends Command {

  async run(msg, ...banner) {
    return msg.channel.send(await figlet(banner), { code: true });
  }

}
