export default (sequelize, DataTypes) => {
  const Leave = sequelize.define("Leave", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    employeeId: DataTypes.INTEGER,
    type: DataTypes.STRING,
    fromDate: DataTypes.DATEONLY,
    toDate: DataTypes.DATEONLY,
    status: { type: DataTypes.ENUM('pending','approved','rejected'), defaultValue: 'pending' },
    reason: DataTypes.TEXT
  });
  return Leave;
};
