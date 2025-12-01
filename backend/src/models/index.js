import { sequelize } from "../config/database.js";
import { DataTypes } from "sequelize";
import UserModel from "./User.js";
import EmployeeModel from "./Employee.js";
import BeneficiaryModel from "./Beneficiary.js";
import AttendanceModel from "./Attendance.js";
import LeaveModel from "./Leave.js";
import PayrollModel from "./Payroll.js";
import FieldActivityModel from "./FieldActivity.js";
import ProductionRecordModel from "./ProductionRecord.js";

export const User = UserModel(sequelize, DataTypes);
export const Employee = EmployeeModel(sequelize, DataTypes);
export const Beneficiary = BeneficiaryModel(sequelize, DataTypes);
export const Attendance = AttendanceModel(sequelize, DataTypes);
export const Leave = LeaveModel(sequelize, DataTypes);
export const Payroll = PayrollModel(sequelize, DataTypes);
export const FieldActivity = FieldActivityModel(sequelize, DataTypes);
export const ProductionRecord = ProductionRecordModel(sequelize, DataTypes);

export const db = { sequelize, User, Employee, Beneficiary, Attendance, Leave, Payroll, FieldActivity, ProductionRecord };
