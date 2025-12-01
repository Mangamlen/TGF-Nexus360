import { Leave } from "../models/index.js";
import { sendEmail } from "../services/notificationService.js";

export const applyLeave = async (req, res) => {
  try {
    const body = req.body;
    body.employeeId = req.user.id;
    const l = await Leave.create(body);

    sendEmail(process.env.EMAIL_USER, "New Leave", `User ${req.user.id} applied for leave`);
    res.status(201).json({ l });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const listLeaves = async (req, res) => {
  try {
    const list = await Leave.findAll();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
