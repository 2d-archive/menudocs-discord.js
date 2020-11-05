import "module-alias/register";
import { Logger, ShiryoClient } from "@lib";

const logger = new Logger("main");

logger.debug("Starting the bot!");
(async () => {
  await new ShiryoClient(require("../config.json"))
    .start();
})().catch((error) => {
  logger.fatal(error);
});
