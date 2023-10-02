const { DataTypes } = require('sequelize');
const sequelize = require('./database');
const User = require('./user_model')

const Assignment = sequelize.define('Assignment', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    num_of_attempts: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    deadline: {
      type: DataTypes.DATE,
    },
    createdByUserId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    assignment_created: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    assignment_updated: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },id: {
      type: DataTypes.UUID,
      primaryKey:true,
      defaultValue: DataTypes.UUIDV4, // Generates a UUID automatically
      allowNull: false,
      readOnly: true
      }
  },{
    timestamps:false
  });

  module.exports = Assignment;