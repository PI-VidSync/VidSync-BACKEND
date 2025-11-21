import { server } from "./app";

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`Chat service listening on port ${PORT}`);
});
