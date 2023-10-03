const { DataTypes } = require('sequelize');
const sequelize = require('./database'); // Import your Sequelize instance
const Assignment = require('./assignment_model');
const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    readOnly: true,
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    writeOnly: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true, // Ensure that the email is in a valid format
    },
  },
  account_created: {
    type: DataTypes.DATE,
    defaultValue:DataTypes.NOW,
    allowNull: true,
    readOnly: true,
  },
  account_updated: {
    type: DataTypes.DATE,
    defaultValue:DataTypes.NOW,
    allowNull: true,
    readOnly: true,
  }
  
},{
  timestamps: false, // Remove createdAt and updatedAt fields
});
module.exports = User;

// creating pull request check

