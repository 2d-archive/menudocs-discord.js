/* eslint-disable no-void */

/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { EOL } from "os";
import { inspect } from "util";
import { format } from "ansikit";
import { stderr, stdout } from "supports-color";

const ERROR_STACK_LINE_COLOR_REGEX = /^ {4}at (?:(.*?) (\(.*\))|(.*?))$/gm;
const ERROR_HEADER_COLOR_REGEX = /^(?:(Caused By: ) )?(\w+):* *(.*)$/gm;
const NODEJS_SOURCE_MAPPED_LINE_COLOR_REGEX = /^ {8}-> (.*?)$/gm;
const _scopes = [];

export class Logger {

  constructor(scope, scopeColor = "magenta") {
    _scopes.push(scope);

    this.scope = scope;
    this.scopeColor = scopeColor;

    this.levels = ["info", "error", "warn", "fatal", "debug", "success"];
    this._errLevels = ["error", "warn", "fatal"];
  }

  get _levelPadding() {
    return this.levels.reduce((len, lev) => Math.max(len, lev.length), 0);
  }

  get _scopePadding() {
    return _scopes.reduce((len, scope) => Math.max(len, scope.length), 0);
  }

  info(message, scope) {
    const formatted = this._format("info", message, scope);
    return this._write("info", formatted);
  }

  error(message, scope) {
    const formatted = this._format("error", message, scope);
    return this._write("error", formatted);
  }

  warn(message, scope) {
    const formatted = this._format("warn", message, scope);
    return this._write("warn", formatted);
  }

  fatal(message, scope) {
    const formatted = this._format("fatal", message, scope);
    return this._write("fatal", formatted);
  }

  debug(message, scope) {
    const formatted = this._format("debug", message, scope);
    return this._write("debug", formatted);
  }

  success(message, scope) {
    const formatted = this._format("success", message, scope);
    return this._write("success", formatted);
  }

  _write(level, message) {
    const cons = console;
    if (this._errLevels.includes(level)) {
      return cons._stderr ?
        process.stderr.write(`${message}${EOL}`) :
        console.error(message);
    } else {
      return cons._stderr ?
        process.stdout.write(`${message}${EOL}`) :
        console.log(message);
    }
  }

  _getColor(level) {
    return {
      info: "blue",
      error: "red",
      fatal: "red",
      warn: "yellow",
      debug: "cyan",
      success: "green"
    }[level];
  }

  _getFigure(level) {
    return {
      info: "📌",
      error: "🚨",
      fatal: "🔥",
      debug: "👷",
      success: "🎉"
    }[level];
  }

  _format(level, message) {
    // Stuff
    const timestamp = new Date().toLocaleString(),
      levelColor = this._getColor(level),
      figure = this._getFigure(level);

    // Formatted
    const _level = `${figure} {${levelColor}}${level
        .toLowerCase()
        .padEnd(this._levelPadding)}{reset}`,
      _scope = `{${this.scopeColor}}${this.scope
        .toLowerCase()
        .padEnd(this._scopePadding)}{reset}`;

    let colon = false;
    if (Array.isArray(message)) {
      colon = true;
      message = `\n${message
        .map((msg) => `   {${levelColor}}-{reset} ${msg}`)
        .join("\n")}`;
    } else if (message instanceof Error) {
      message = this._formatError(message);
    }

    let formatted = `{gray}${timestamp} ${_level}{gray} (${_scope}{gray}){reset}${
      colon ? "" : ":"
    } ${message}`;
    if (!stdout || !stderr) {
      formatted = formatted.replace(/{[a-z-]}/i, "");
    } else {
      formatted = format(formatted);
    }

    return formatted;
  }

  _formatError(error) {
    const anyError = error;
    const stack =
      typeof anyError[inspect.custom] === "function" ?
        inspect(error, false, 0, false) :
        error.stack;

    return stack
      .replace(
        ERROR_STACK_LINE_COLOR_REGEX,
        (__, tfn, l1, l2) =>
          `    {yellow}{bold}at{reset} ${
            tfn ? `{cyan}${tfn}` : ""
          }{reset}{dim}${l2 || ""} ${l1 || ""}{reset}`
      )
      .replace(
        NODEJS_SOURCE_MAPPED_LINE_COLOR_REGEX,
        (__, location) => `        {green}->{reset} {dim}${location}{reset}`
      )
      .replace(ERROR_HEADER_COLOR_REGEX, (__, cb, en, msg) => {
        let code = "";
        if (msg.startsWith("(")) {
          const lastIndex = msg.indexOf(")");
          code = msg.substr(1, lastIndex - 1);
          msg = msg.substr(lastIndex + 1);
        }

        return `{underline}${en}{reset}: ${
          code ? "(" : ""
        }{magenta}${code}{reset}${code ? ")" : ""}${msg}`;
      });
  }

}
