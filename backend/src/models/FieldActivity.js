export default (sequelize, DataTypes) => {
  const FieldActivity = sequelize.define("FieldActivity", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    activity_type: DataTypes.STRING,
    description: DataTypes.TEXT,
    beneficiary_id: DataTypes.INTEGER,
    staff_id: DataTypes.INTEGER,
    activity_date: DataTypes.DATEONLY,
    latitude: DataTypes.DECIMAL(10,6),
    longitude: DataTypes.DECIMAL(10,6),
    photo_url: DataTypes.TEXT,
    report_pdf: DataTypes.TEXT
  });
  return FieldActivity;
};
