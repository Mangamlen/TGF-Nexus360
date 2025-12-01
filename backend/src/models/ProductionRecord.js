export default (sequelize, DataTypes) => {
  const ProductionRecord = sequelize.define("ProductionRecord", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    beneficiary_id: DataTypes.INTEGER,
    product_type: DataTypes.STRING,
    quantity: DataTypes.DECIMAL(10,2),
    unit: DataTypes.STRING,
    record_month: DataTypes.STRING,
    record_year: DataTypes.INTEGER,
    staff_id: DataTypes.INTEGER
  });
  return ProductionRecord;
};
