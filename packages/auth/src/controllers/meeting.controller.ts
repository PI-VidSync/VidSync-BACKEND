import { Request, Response } from "express";
import { nanoid } from "nanoid";
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

    const meetingId = nanoid(12);//genera un Id unico de la reunion
     
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
    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
};
