import Turn from "node-turn";
import dotenv from "dotenv";

dotenv.config();

const server = new Turn({
  listeningPort: Number(process.env.PORT) || 3478,
  realm: process.env.TURN_REALM || "myrealm",
  authMech: "long-term",
  credentials: {
    [process.env.TURN_USER || "user"]: process.env.TURN_PASS || "pass"
  }
});

server.start();

console.log(`STUN voice server started on port ${process.env.PORT || 3478}`);
