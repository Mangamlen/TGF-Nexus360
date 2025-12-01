export default (sequelize, DataTypes) => {
  const Payroll = sequelize.define("Payroll", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    employeeId: DataTypes.INTEGER,
    month: DataTypes.STRING,
    basic: DataTypes.DECIMAL(10,2),
    hra: DataTypes.DECIMAL(10,2),
    allowances: DataTypes.DECIMAL(10,2),
    deductions: DataTypes.DECIMAL(10,2),
    netSalary: DataTypes.DECIMAL(10,2)
  });
  return Payroll;
};
