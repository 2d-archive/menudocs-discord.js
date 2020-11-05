import { dirname, join, parse } from "path";
import { lstatSync, readdirSync } from "fs";

import { Command as BaseCommand } from "../Classes/Command";
import { Listener as BaseListener } from "../Classes/Listener";

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

  checkOwner(id) {
    return this.client.owners.includes(id);
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
    const directory = join(this.directory, "commands"),
      files = this.walk(directory);

    for (const file of files) {
      delete require.cache[file];
      const { name } = parse(file),
        Command = this.findClass(require(file));

      if (!Command) {
        throw new TypeError(`Command ${name} doesn't export a class.`);
      }

      const command = new Command(this.client, name.toLowerCase());
      if (!(command instanceof BaseCommand)) {
        throw new TypeError(`Command ${name} doesnt belong in "commands".`);
      }

      this.client.commands.set(command.name, command);
      if (command.aliases.length) {
        for (const alias of command.aliases) {
          this.client.aliases.set(alias, command.name);
        }
      }
    }
  }

  async loadEvents() {
    const directory = join(this.directory, "events"),
      files = this.walk(directory);

    for (const file of files) {
      delete require.cache[file];
      const { name } = parse(file),
        Event = this.findClass(require(file));

      if (!Event) {
        throw new TypeError(`Event ${name} doesn't export a class!`);
      }

      const event = new Event(this.client, name);
      if (!(event instanceof BaseListener)) {
        throw new TypeError(`Event ${name} doesn't belong in Events`);
      }

      this.client.events.set(event.name, event);
      event.emitter[event.type](name, (...args) => event.run(...args));
    }
  }

  /**
   * @param {Record} module The imported module.
   * @returns {Record | null}
   */
  findClass(module) {
    if (module.__esModule) {
      const def = Reflect.get(module, "default");
      if (this.isClass(def)) {
        return def;
      }

      let _class = null;
      for (const prop of Object.keys(module)) {
        const ref = Reflect.get(module, prop);
        if (this.isClass(ref)) {
          _class = ref;
          break;
        }
      }

      return _class;
    }

    return this.isClass(module) ? module : null;
  }

  /**
   * @param {string} directory The directory to walk.
   * @returns {string[]} The files.
   */
  walk(directory) {
    function read(dir, files = []) {
      for (const file of readdirSync(dir)) {
        const path = join(dir, file), stats = lstatSync(path);
        if (stats.isFile() && path.endsWith(".js")) {
          files.push(file);
        } else if (stats.isDirectory()) {
          files = files.concat(read(path, files));
        }
      }

      return files;
    }

    return read(directory);
  }

}
