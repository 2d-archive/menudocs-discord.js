import ms from "ms";
import { Listener } from "@lib";

export default class extends Listener {

  constructor(...args) {
    super(...args);

    this.buckets = new Map();
  }

  async run(message) {
    const aloneRegexp = RegExp(`^<@!?${this.client.user.id}>$`);
    const prefixRegexp = RegExp(`^<@!?${this.client.user.id}>\\s*`);

    if (!message.guild || message.author.bot) return;
    if (message.content.match(aloneRegexp)) {
      message.channel.send(
        `My prefix for ${message.guild.name} is \`${this.client.prefix}\`.`
      );
    }

    const prefix = message.content.match(prefixRegexp) ?
      message.content.match(prefixRegexp)[0] :
      this.client.prefix;
    if (!prefix) return;

    const [cmd, ...args] = message.content
      .slice(prefix.length)
      .trim()
      .split(/ +/g);
    const command =
      this.client.commands.get(cmd.toLowerCase()) ||
      this.client.commands.get(this.client.aliases.get(cmd.toLowerCase()));

    if (command) {
      if (command.ownerOnly && !this.client.utils.checkOwner(message.author.id)) {
        message.reply("Sorry, this command can only be used by the bot owners.");
        return;
      }

      if (command.guildOnly && !message.guild) {
        message.reply("Sorry, this command can only be used in a discord server.");
        return;
      }

      if (command.nsfw && !message.channel.nsfw) {
        message.reply("Sorry, this command can only be ran in a NSFW marked channel.");
        return;
      }

      if (command.args && !args.length) {
        const usage = command.usage ?
          `${this.client.prefix + command.name} ${command.usage}` : "" +
          "This command doesn't have a usage format";
        message.reply(`Sorry, this command requires arguments to function. Usage: ${usage}`);

        return;
      }

      if (message.guild) {
        const userPermCheck = command.userPerms ?
          this.client.defaultPerms.add(command.userPerms) :
          this.client.defaultPerms;

        if (userPermCheck) {
          const missing = message.channel.permissionsFor(message.member).missing(userPermCheck);
          if (missing.length) {
            message.reply(`You are missing ${this.client.utils.formatArray(missing.map(this.client.utils.formatPerms))} permissions, you need them to use this command!`);

            return;
          }
        }

        const botPermCheck = command.botPerms ?
          this.client.defaultPerms.add(command.botPerms) :
          this.client.defaultPerms;

        if (botPermCheck) {
          const missing = message.channel.permissionsFor(this.client.user).missing(botPermCheck);
          if (missing.length) {
            const formatted = this.client.utils.formatArray(missing.map(this.client.utils.formatPerms));
            message.reply(`I am missing ${formatted} permissions, I need them to run this command!`);

            return;
          }
        }
      }

      if (!this.client.owners.includes(message.author.id)) {
        let remaining = await this._runLimits(message, command);
        if (remaining) {
          remaining = ms(remaining - Date.now(), { long: true });
          message.reply(`Sorry you're gonna have to wait **${remaining}** before running this command.`);

          return;
        }
      }

      try {
        await command.run(message, args);

        this.client.logger.info(
          `${message.author.tag} ran {underline}${command.name}{reset} {green}{bold}successfully`
        );
      } catch (err) {
        this.client.logger.error(err, command.name);
      }
    }
  }

  _timeout(userId, commandName) {
    return () => {
      const bucket = this.buckets.get(`${userId}-${commandName}`);
      if (bucket && bucket.timeout) {
        this.client.clearTimeout(bucket.timeout);
      }

      this.buckets.delete(`${userId}-${commandName}`);
    };
  }

  _runLimits(message, command) {
    const tout = this._timeout(message.author.id, command.name);

    let bucket = this.buckets.get(`${message.author.id}-${command.name}`);
    if (!bucket) {
      bucket = {
        reset: command.ratelimit.reset,
        remaining: command.ratelimit.bucket,
        timeout: this.client.setTimeout(tout, command.ratelimit.reset)
      };

      this.buckets.set(`${message.author.id}-${command.name}`, bucket);
    }

    if (bucket.remaining === 0) {
      const now = Date.now();
      if (command.ratelimit.stack) {
        if (bucket.limited) {
          if (bucket.timeout) {
            this.client.clearTimeout(bucket.timeout);
          }

          bucket.reset = bucket.resetsIn - now + command.ratelimit.reset;
          bucket.timeout = this.client.setTimeout(tout, bucket.reset);
          bucket.resetsIn = bucket.reset + now;
        }

        bucket.limited = true;
      }

      if (!bucket.resetsIn) {
        bucket.resetsIn = bucket.reset + now;
      }

      return bucket.resetsIn;
    }

    --bucket.remaining;
    return null;
  }

}
