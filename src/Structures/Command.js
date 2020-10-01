const { Util } = require('discord.js');

const DEFAULT_RATELIMIT = {
	reset: 5000,
	bucket: 1,
	stack: true
};

module.exports = class Command {

	constructor(client, name, options = {}) {
		this.client = client;
		this.name = options.name || name;
		this.aliases = options.aliases || [];
		this.description = options.description || 'No description provided.';
		this.category = options.category || 'Miscellaneous';
		this.usage = options.usage || 'No usage provided.';
		this.ratelimit = Util.mergeDefault(DEFAULT_RATELIMIT, options.ratelimit || DEFAULT_RATELIMIT);
	}

	// eslint-disable-next-line no-unused-vars
	async run(message, args) {
		throw new Error(`Command ${this.name} doesn't provide a run method!`);
	}

};
