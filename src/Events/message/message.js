const Event = require('../../Structures/Event');
const ms = require('ms');

module.exports = class extends Event {

	constructor(...args) {
		super(...args);

		this.limits = new Map();
	}


	async run(message) {
		const mentionRegex = RegExp(`^<@!?${this.client.user.id}>$`);
		const mentionRegexPrefix = RegExp(`^<@!?${this.client.user.id}> `);

		if (!message.guild || message.author.bot) return;
		if (message.content.match(mentionRegex)) message.channel.send(`My prefix for ${message.guild.name} is \`${this.client.prefix}\`.`);

		const prefix = message.content.match(mentionRegexPrefix) ?
			message.content.match(mentionRegexPrefix)[0] :
			this.client.prefix;
		if (!prefix) return;

		const [cmd, ...args] = message.content.slice(prefix.length).trim().split(/ +/g);
		const command = this.client.commands.get(cmd.toLowerCase()) || this.client.commands.get(this.client.aliases.get(cmd.toLowerCase()));

		let remaining = await this._runLimits(message, command);
		if (remaining) {
			remaining = ms(remaining, { long: true });
			message.channel.send(`Sorry **${message.author}**, you have to wait **${remaining}** before running this command.`);
			return;
		}

		if (command) command.run(message, args);
	}

	_timeout(userId, commandName) {
		return () => {
			const bucket = this.limits.get(`${userId}-${commandName}`);
			if (bucket && bucket.timeout) {
				this.client.clearTimeout(bucket.timeout);
			}

			this.limits.delete(`${userId}-${commandName}`);
		};
	}

	_runLimits(message, command) {
		const tout = this._timeout(message.author.id, command.name);

		let bucket = this.limits.get(`${message.author.id}-${command.name}`);
		if (!bucket) {
			bucket = {
				reset: command.ratelimit.reset,
				remaining: command.ratelimit.bucket,
				timeout: this.client.setTimeout(tout, command.ratelimit.reset)
			};

			this.limits.set(`${message.author.id}-${command.name}`, bucket);
		}

		if (bucket.remaining === 0) {
			if (command.ratelimit.stack) {
				if (bucket.limited) {
					if (bucket.timeout) {
						this.client.clearTimeout(bucket.timeout);
					}

					bucket.reset += command.ratelimit.reset;
					bucket.timeout = this.client.setTimeout(tout, bucket.reset);
				}

				bucket.limited = true;
			}

			return bucket.reset;
		}

		--bucket.remaining;
		return null;
	}

};
