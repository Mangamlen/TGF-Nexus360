export default (sequelize, DataTypes) => {
  const Employee = sequelize.define("Employee", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    empCode: { type: DataTypes.STRING, unique: true },
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: { type: DataTypes.STRING, unique: true },
    phone: DataTypes.STRING,
    department: DataTypes.STRING,
    designation: DataTypes.STRING,
    profilePhoto: DataTypes.STRING,
    documentFile: DataTypes.STRING,
    joinDate: DataTypes.DATEONLY,
    exitDate: DataTypes.DATEONLY,
    baseSalary: DataTypes.DECIMAL(10,2),
    hra: DataTypes.DECIMAL(10,2),
    allowances: DataTypes.DECIMAL(10,2),
    deductions: DataTypes.DECIMAL(10,2),
    status: { type: DataTypes.ENUM('active','resigned'), defaultValue: 'active' }
  });
  return Employee;
};
