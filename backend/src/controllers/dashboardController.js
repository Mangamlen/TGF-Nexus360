import { Employee, Beneficiary, FieldActivity, ProductionRecord } from "../models/index.js";
import { fn, col } from "sequelize";

export const getSummary = async (req, res) => {
  try {
    const employees = await Employee.count();
    const beneficiaries = await Beneficiary.count();
    const activities = await FieldActivity.count();
    const productionSum = await ProductionRecord.sum("quantity") || 0;

    res.json({ employees, beneficiaries, activities, production: productionSum });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMonthlyActivities = async (req, res) => {
  try {
    const rows = await FieldActivity.findAll({
      attributes: [
        [fn("DATE_FORMAT", col("activity_date"), "%Y-%m"), "month"],
        [fn("COUNT", col("id")), "total_activities"]
      ],
      group: [fn("DATE_FORMAT", col("activity_date"), "%Y-%m")],
      order: [[fn("DATE_FORMAT", col("activity_date"), "%Y-%m"), "ASC"]]
    });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
