import { Logger } from "./Util/Logger";
import { Util } from "./Util/Util";
import { Client, Collection, Permissions } from "discord.js";

export class ShiryoClient extends Client {

  constructor(options = {}) {
    super({
      disableMentions: "everyone"
    });

    this.validate(options);
    this.owners = options.owners;

    this.commands = new Collection();
    this.aliases = new Collection();
    this.events = new Collection();

    this.logger = new Logger("client");
    this.utils = new Util(this);
  }

  validate(options) {
    if (typeof options !== "object") {
      throw new TypeError("Options should be a type of Object.");
    }

    if (!Reflect.has(options, "token")) {
      throw new Error("You must pass the token for the client.");
    }

    this.token = options.token;

    if (!Reflect.has(options, "prefix")) {
      throw new Error("You must pass a prefix for the client.");
    }

    if (typeof options.prefix !== "string") {
      throw new TypeError("Prefix should be a type of String.");
    }

    this.prefix = options.prefix;

    if (!Reflect.has(options, "defaultPerms")) {
      throw new Error("You must pass default perm(s) for the Client.");
    }

    this.defaultPerms = new Permissions(options.defaultPerms)
      .freeze();
  }

  async start(token = this.token) {
    /* (0) Load our commands and events. */
    await this.utils.loadCommands();
    await this.utils.loadEvents();

    /* (1) Connect to Discord */
    await super.login(token);
  }

}
