import { Request, Response } from "express";
import { db } from "../firebase/admin";
import { Timestamp } from "firebase-admin/firestore";


export const createMeeting = async (req: Request, res: Response) => {
  try {
    const { title} = req.body;

    if (!title) {
      return res.status(400).json({
        ok: false,
        message: "title y  son requeridos",
      });
    }

    const { nanoid } = require("nanoid");

    const meetingId = nanoid(12); // Genero el ID
      
    const meetingData = {
      title,
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

export const getMeeting = async (req: Request, res: Response) => {
  try {
    const { meetingId } = req.params;
    const meetingSnapshot = await db
      .collection("meetings")
      .where("meetingId", "==", meetingId)
      .get(); 
    if (meetingSnapshot.empty) {
      return res.status(404).json({
        ok: false,
        message: "Meeting not found",
      });
    }
    const meetingData = meetingSnapshot.docs[0].data();
    return res.status(200).json({
      ok: true,
      meeting: meetingData,
    });
  } catch (error: any) {
    console.error("Error getting meeting:", error);
    return res.status(500).json({
      ok: false,
      message: error.message || "Error interno",
    });
  }
};

export const getUserMeetings = async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;
    const meetingsSnapshot = await db
      .collection("meetings")
      .where("", "==", uid)
      .orderBy("createdAt", "desc")
      .get();
    const meetings = meetingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.status(200).json({
      ok: true,
      meetings,
    });
  } catch (error: any) {
    console.error("Error getting user meetings:", error);
    return res.status(500).json({
      ok: false,
      message: error.message || "Error interno",
    });
  }
};

  export const getMeetingByCode = async (req: Request, res: Response) => {  
    try {
      const { code } = req.params;
      const meetingSnapshot = await db
        .collection("meetings")
        .where("meetingId", "==", code)
        .get(); 
      if (meetingSnapshot.empty) {
        return res.status(404).json({
          ok: false,
          message: "Meeting not found",
        });
      }
      const meetingData = meetingSnapshot.docs[0].data();
      return res.status(200).json({
        ok: true,
        meeting: meetingData,
      });
    } catch (error: any) {
      console.error("Error getting meeting by code:", error);
      return res.status(500).json({
        ok: false,
        message: error.message || "Error interno",
      });
    }
  };

  export const updateMeeting = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { title, isActive } = req.body;
      const updateData: any = {};

      if (title !== undefined) updateData.title = title;
      if (isActive !== undefined) updateData.isActive = isActive;
      await db.collection("meetings").doc(id).update(updateData);
      return res.status(200).json({
        ok: true,
        message: "Meeting updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating meeting:", error);
      return res.status(500).json({
        ok: false,
        message: error.message || "Error interno",
      });
    }
  };

  export const deleteMeeting = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await db.collection("meetings").doc(id).delete();
      return res.status(200).json({
        ok: true,
        message: "Meeting deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting meeting:", error);
      return res.status(500).json({
        ok: false,
        message: error.message || "Error interno",
      });
    }
  };