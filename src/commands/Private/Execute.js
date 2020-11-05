import { Command } from "@lib";
import { exec } from "child_process";

export class Execute extends Command {

  constructor(...args) {
    super(...args, {
      aliases: ["exec"],
      description: "Executes commands in the console",
      category: "Developer",
      usage: "<query>",
      ownerOnly: true,
      args: true
    });
  }

  async run(message, args) {
    exec(args.join(" "), (error, stdout) => {
      const response = error || stdout;
      message.channel.send(response, { code: true, split: true });
    });
  }

}
