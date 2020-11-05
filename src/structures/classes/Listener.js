export class Listener {


  constructor(client, name, options = {}) {
    /**
     * The client instance.
     * @type {import("../ShiryoClient").ShiryoClient}
     */
    this.client = client;

    /**
     * The name of this listener.
     * @type {string}
     */
    this.name = name;

    /**
     * The type of listener to attach.
     * @type {string}
     */
    this.type = options.once ? "once" : "on";

    /**
     * The emitter instance.
     * @type {*|ShiryoClient}
     */
    this.emitter =
      (typeof options.emitter === "string" ?
        this.client[options.emitter] :
        options.emitter) || this.client;
  }

  // eslint-disable-next-line no-unused-vars
  async run(...args) {
    throw new Error(`The run method has not been implemented in ${this.name}`);
  }

}
