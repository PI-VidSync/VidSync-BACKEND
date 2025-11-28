import { Request, Response } from "express";
import { db } from "../firebase/admin";
import { Timestamp } from "firebase-admin/firestore";


export const createMeeting = async (req: Request, res: Response) => {
  try {
    const { title, hostId } = req.body;

    if (!title || !hostId) {
      return res.status(400).json({
        ok: false,
        message: "title y hostId son requeridos",
      });
    }

    const { nanoid } = require("nanoid");

    const meetingId = nanoid(12); // Genero el ID
      
    const meetingData = {
      title,
      hostId,
      meetingId,
      createdAt: Timestamp.now(),
    };

    const docRef = await db.collection("meetings").add(meetingData);

    return res.status(201).json({
      ok: true,
      meeting: {
        id: docRef.id,
        ...meetingData,
      },
    });
  } catch (error: any) {
    console.error("Error creating meeting:", error);
    return res.status(500).json({
      ok: false,
      message: error.message || "Error interno",
    });
  }
};