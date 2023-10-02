const User = require('./user_model');
const Assignment = require('./assignment_model');

// Define associations
User.hasMany(Assignment, { foreignKey: 'createdByUserId' });
Assignment.belongsTo(User, { foreignKey: 'createdByUserId' });

// Export the models
module.exports = {
  User,
  Assignment,
};