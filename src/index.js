import "module-alias/register";
import { Logger, MenuDocsClient } from "@lib";

const logger = new Logger("main");

logger.debug("Starting the bot!");
(async () => {
  await new MenuDocsClient(require("../config.json"))
    .start();
})().catch((error) => {
  logger.fatal(error);
});
