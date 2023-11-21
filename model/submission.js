// submission_model.js

const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Submission = sequelize.define('Submission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  assignment_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  submission_url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  submission_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  submission_updated: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

module.exports = Submission;
