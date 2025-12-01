export default (sequelize, DataTypes) => {
  const Attendance = sequelize.define("Attendance", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    employeeId: DataTypes.INTEGER,
    date: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
    checkInTime: DataTypes.DATE,
    checkOutTime: DataTypes.DATE,
    latitude: DataTypes.STRING,
    longitude: DataTypes.STRING
  });
  return Attendance;
};
