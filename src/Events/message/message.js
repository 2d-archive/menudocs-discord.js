const Event = require('../../Structures/Event');
const ms = require('ms');

module.exports = class extends Event {

	constructor(...args) {
		super(...args);

		this.buckets = new Map();
	}

	async run(message) {
		const aloneRegexp = RegExp(`^<@!?${this.client.user.id}>$`);
		const prefixRegexp = RegExp(`^<@!?${this.client.user.id}> `);

		if (!message.guild || message.author.bot) return;
		if (message.content.match(aloneRegexp)) message.channel.send(`My prefix for ${message.guild.name} is \`${this.client.prefix}\`.`);

		const prefix = message.content.match(prefixRegexp) ?
			message.content.match(prefixRegexp)[0] :
			this.client.prefix;
		if (!prefix) return;

		const [cmd, ...args] = message.content.slice(prefix.length).trim().split(/ +/g);
		const command = this.client.commands.get(cmd.toLowerCase()) || this.client.commands.get(this.client.aliases.get(cmd.toLowerCase()));

		if (!this.client.owners.includes(message.author.id)) {
			let remaining = await this._runLimits(message, command);
			if (remaining) {
				remaining = ms(remaining - Date.now(), { long: true });
				message.channel.send(`Sorry **${message.author}**, you have to wait **${remaining}** before running this command.`);
				return;
			}
		}

		if (command) command.run(message, args);
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

					bucket.reset = (bucket.resetsIn - now) + command.ratelimit.reset;
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

};
