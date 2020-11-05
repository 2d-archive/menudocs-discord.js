import { Listener } from "@lib";

export default class ReadyEvent extends Listener {

  constructor(...args) {
    super(...args, {
      once: true
    });
  }

  async run() {
    this.client.logger.success([
      `Logged in as ${this.client.user.tag}`,
      `Loaded ${this.client.commands.size} commands!`,
      `Loaded ${this.client.events.size} events!`
    ]);

    const activities = () => [
      `${this.client.guilds.cache.size} servers!`,
      `${this.client.channels.cache.size} channels!`,
      `${this.client.guilds.cache.reduce(
        (a, b) => a + b.memberCount,
        0
      )} users!`
    ];

    await this.client.user.setActivity(activities()[0]);

    let i = 0;
    this.client.setInterval(() => {
      const __activities = activities(),
        activity = __activities[i++ % __activities.length];

      return this.client.user.setActivity(
        `${this.client.prefix}help | ${activity}`,
        { type: "WATCHING" }
      );
    }, 15000);
  }

}
