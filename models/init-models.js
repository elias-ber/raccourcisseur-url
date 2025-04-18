var DataTypes = require("sequelize").DataTypes;
var _links = require("./links");
var _users = require("./users");
var _visits = require("./visits");

function initModels(sequelize) {
  var links = _links(sequelize, DataTypes);
  var users = _users(sequelize, DataTypes);
  var visits = _visits(sequelize, DataTypes);

  visits.belongsTo(links, { as: "link", foreignKey: "link_id"});
  links.hasMany(visits, { as: "visits", foreignKey: "link_id"});
  links.belongsTo(users, { as: "created_by_user", foreignKey: "created_by"});
  users.hasMany(links, { as: "links", foreignKey: "created_by"});

  return {
    links,
    users,
    visits,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
