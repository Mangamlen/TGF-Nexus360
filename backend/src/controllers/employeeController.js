import { Employee } from "../models/index.js";

export const createEmployee = async (req, res) => {
  try {
    const body = req.body;
    if (req.files?.photo) body.profilePhoto = req.files.photo[0].filename;
    if (req.files?.doc) body.documentFile = req.files.doc[0].filename;

    const emp = await Employee.create(body);
    res.status(201).json({ emp });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const listEmployees = async (req, res) => {
  try {
    const list = await Employee.findAll();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
