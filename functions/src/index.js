const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");

const axios = require("axios");

const dayjs = require("dayjs");

const { sendCorona } = require("./corona");

// Initialize web server
const app = express();
app.use(cors({ origin: true }));

// Handle post events (messages, etc.)
app.post(
  `/${functions.config().telegram.token.split(":")[1]}`,
  async (req, res) => {
    const isCallBackQuery = req.body && req.body.callback_query;
    const isMessage = req.body && req.body.message;

    if (isMessage) {
      const message = isMessage;
      if (message.from.is_bot) {
        res.status(200).send("No bots allowed");
        return;
      }
      const commands =
        message.entities &&
        message.entities.map((entity) => {
          if (entity.type === "bot_command") {
            return message.text.substring(entity.offset, entity.length);
          }
          return "";
        });

      if (commands) {
        commands.forEach((command) => {
          switch (command) {
            case "/corona":
            case "/corona@korona_chan_bot":
              sendCorona(message.chat.id);
              break;

            default:
              break;
          }
        });
      }
    }

    res.status(200).send({ status: "not a telegram message" });
  }
);

// Send the http request forward to the express server
exports.apiEndPoint = functions.https.onRequest(app);
