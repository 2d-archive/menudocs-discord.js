/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { dirname, join, parse } from "path";
import { promisify } from "util";
import { Command as BaseCommand } from "../Classes/Command";
import { Listener as BaseListener } from "../Classes/Listener";

const glob = promisify(require("glob"));

export class Util {

  constructor(client) {
    this.client = client;
  }

  isClass(input) {
    return (
      typeof input === "function" &&
      typeof input.prototype === "object" &&
      input.toString().substring(0, 5) === "class"
    );
  }

  get directory() {
    return dirname(require.main.filename);
  }

  trimArray(arr, maxLen = 10) {
    if (arr.length > maxLen) {
      const len = arr.length - maxLen;
      arr = arr.slice(0, maxLen);
      arr.push(`${len} more...`);
    }
    return arr;
  }

  formatArray(array, type = "conjunction") {
    return new Intl.ListFormat("en-GB", { style: "short", type: type }).format(array);
  }

  formatPerms(perm) {
    return perm
      .toLowerCase()
      .replace(/(^|"|_)(\S)/g, (str) => str.toUpperCase())
      .replace(/_/g, " ")
      .replace(/Guild/g, "Server")
      .replace(/Use Vad/g, "Use Voice Acitvity");
  }

  formatBytes(bytes) {
    if (bytes === 0) return "0 Bytes";
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
  }

  removeDuplicates(arr) {
    return [...new Set(arr)];
  }

  capitalise(string) {
    return string
      .split(" ")
      .map((str) => str.slice(0, 1).toUpperCase() + str.slice(1))
      .join(" ");
  }

  async loadCommands() {
    return glob(join(this.directory, "Commands", "**", "*.js")).then(
      (commands) => {
        for (const commandFile of commands) {
          delete require.cache[commandFile];

          const { name } = parse(commandFile);
          const imported = require(commandFile);

          const Command = "default" in imported ? imported.default : imported;
          if (!this.isClass(Command)) {
            throw new TypeError(`Command ${name} doesn't export a class.`);
          }

          const command = new Command(this.client, name.toLowerCase());
          if (!(command instanceof BaseCommand)) {
            throw new TypeError(`Comamnd ${name} doesnt belong in Commands.`);
          }

          this.client.commands.set(command.name, command);
          if (command.aliases.length) {
            for (const alias of command.aliases) {
              this.client.aliases.set(alias, command.name);
            }
          }
        }
      }
    );
  }

  async loadEvents() {
    return glob(join(this.directory, "Events", "**", "*.js")).then((events) => {
      for (const eventFile of events) {
        delete require.cache[eventFile];

        const { name } = parse(eventFile);
        const imported = require(eventFile);

        const Listener = "default" in imported ? imported.default : imported;
        if (!this.isClass(Listener)) {
          throw new TypeError(`Event ${name} doesn't export a class!`);
        }

        const listener = new Listener(this.client, name);
        if (!(listener instanceof BaseListener)) {
          throw new TypeError(`Event ${name} doesn't belong in Events`);
        }

        this.client.events.set(listener.name, listener);
        listener.emitter[listener.type](name, (...args) =>
          listener.run(...args)
        );
      }
    });
  }

}
