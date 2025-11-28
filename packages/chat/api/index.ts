import { Server, type Socket } from "socket.io";
import "dotenv/config";

/**
 * Chat socket server
 * - Uses process.env.PORT (fallback 3001)
 * - Uses process.env.ORIGIN (comma separated) or '*' as fallback
 * - Emits 'usersOnline' and 'chat:message' (matches frontend)
 */

const origins = (process.env.ORIGIN ?? "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

const corsOrigins = origins.length ? origins : ["*"];

const io = new Server({
  cors: {
    origin: corsOrigins
  }
});

const port = Number(process.env.PORT || 3001);

io.listen(port);
console.log(`Chat socket server is running on port ${port}`);
console.log(`Allowed origins: ${corsOrigins.join(", ")}`);

type OnlineUser = { socketId: string; userId: string; name?: string };

type ChatMessagePayload = {
  userId?: string;
  message?: string;
  timestamp?: string;
  clientId?: string;
  // optional display name fields
  name?: string;
  displayName?: string;
};

let onlineUsers: OnlineUser[] = [];

io.on("connection", (socket: Socket) => {
  // register connection with empty userId until client announces
  onlineUsers.push({ socketId: socket.id, userId: "" });
  io.emit("usersOnline", onlineUsers);
  console.log("A user connected with id:", socket.id, "total online:", onlineUsers.length);

  // accept any payload (string or object) from client when announcing user
  socket.on("newUser", (userPayload: any) => {
    if (!userPayload) return;

    // Accept either a string (display name or uid) or an object { uid, name }
    let uid: string;
    let name: string | undefined;

    if (typeof userPayload === "string") {
      uid = userPayload;
      name = userPayload;
    } else if (typeof userPayload === "object" && userPayload !== null) {
      uid = String(userPayload.uid ?? userPayload.userId ?? userPayload.id ?? userPayload.uid ?? "");
      name = (userPayload.name ?? userPayload.displayName ?? userPayload.userName ?? undefined) as string | undefined;
      // fallback: if no uid provided but a name exists, use the name as uid
      if (!uid && name) uid = name;
    } else {
      uid = String(userPayload);
      name = undefined;
    }

    // ensure uid is not empty
    if (!uid) uid = socket.id;

    const existingUserIndex = onlineUsers.findIndex(user => user.socketId === socket.id);
    if (existingUserIndex !== -1) {
      onlineUsers[existingUserIndex] = { socketId: socket.id, userId: uid, name };
    } else if (!onlineUsers.some(user => user.userId === uid)) {
      onlineUsers.push({ socketId: socket.id, userId: uid, name });
    } else {
      onlineUsers = onlineUsers.map(user =>
        user.userId === uid ? { socketId: socket.id, userId: uid, name } : user
      );
    }

    io.emit("usersOnline", onlineUsers);
  });

  socket.on("chat:message", (payload: ChatMessagePayload) => {
    const trimmedMessage = (payload?.message ?? "").toString().trim();
    if (!trimmedMessage) return;

    const sender = onlineUsers.find(user => user.socketId === socket.id) ?? null;

    const outgoingMessage = {
      userId: payload.userId ?? sender?.userId ?? socket.id,
      // include display name if available (prefer sender stored name, then payload)
      name: sender?.name ?? payload?.name ?? payload?.displayName ?? undefined,
      message: trimmedMessage,
      timestamp: payload.timestamp ?? new Date().toISOString(),
      clientId: payload.clientId ?? undefined
    };

    io.emit("chat:message", outgoingMessage);
    console.log("Relayed chat message from:", outgoingMessage.userId, "message:", outgoingMessage.message);
  });

  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter(user => user.socketId !== socket.id);
    io.emit("usersOnline", onlineUsers);
    console.log("A user disconnected with id:", socket.id, "total online:", onlineUsers.length);
  });
});









