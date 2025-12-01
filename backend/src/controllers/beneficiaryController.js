import { Beneficiary } from "../models/index.js";

export const createBeneficiary = async (req, res) => {
  try {
    const body = req.body;
    if (req.files?.photo) body.photo_url = req.files.photo[0].path;
    if (req.files?.id_proof) body.id_proof_url = req.files.id_proof[0].path;
    body.created_by = req.user.id;
    const b = await Beneficiary.create(body);
    res.status(201).json({ b });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const listBeneficiaries = async (req, res) => {
  try {
    const all = await Beneficiary.findAll();
    res.json(all);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
