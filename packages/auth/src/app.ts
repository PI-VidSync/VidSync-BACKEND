import express from "express";
import routes from "./routes/auth.routes";
import dotenv from "dotenv";
import cors from "cors";
import meetingRoutes from "./routes/meeting.routes";



dotenv.config();

const whitelist = ['http://localhost:5173', 'https://vid-sync-frontend-nu.vercel.app'];

const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    if (origin && whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      console.log(origin)
      console.error('Not allowed by CORS')
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}

const app = express();
app.use(express.json());

app.use(cors(corsOptions));

app.use("/api/auth", routes);

app.use("/api/meetings", meetingRoutes);

export default app;
