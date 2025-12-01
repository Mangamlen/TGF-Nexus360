export default (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { 
      type: DataTypes.ENUM('admin','mis-manager','project-manager','field-staff','data-entry','hr'), 
      defaultValue: 'field-staff' 
    },
    refreshToken: { type: DataTypes.TEXT, allowNull: true }
  });
  return User;
};
