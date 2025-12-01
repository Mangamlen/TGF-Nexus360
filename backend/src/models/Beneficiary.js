export default (sequelize, DataTypes) => {
  const Beneficiary = sequelize.define("Beneficiary", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    full_name: DataTypes.STRING,
    gender: DataTypes.STRING,
    age: DataTypes.INTEGER,
    village: DataTypes.STRING,
    district: DataTypes.STRING,
    phone: DataTypes.STRING,
    photo_url: DataTypes.TEXT,
    id_proof_url: DataTypes.TEXT,
    latitude: DataTypes.DECIMAL(10,6),
    longitude: DataTypes.DECIMAL(10,6),
    created_by: DataTypes.INTEGER
  });
  return Beneficiary;
};
