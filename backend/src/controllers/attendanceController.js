import { Attendance } from "../models/index.js";

export const checkIn = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const record = await Attendance.create({
      employeeId: req.user.id,
      checkInTime: new Date(),
      latitude,
      longitude
    });
    res.json({ record });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const checkOut = async (req, res) => {
  try {
    const record = await Attendance.findOne({
      where: { employeeId: req.user.id },
      order: [["id", "DESC"]]
    });
    if (!record) return res.status(404).json({ message: "No record" });
    record.checkOutTime = new Date();
    await record.save();
    res.json({ record });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
