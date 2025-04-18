const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('visits', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    link_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'links',
        key: 'id'
      }
    },
    visited_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    is_bot: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    screen_resolution: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    city: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    country: {
      type: DataTypes.CHAR(2),
      allowNull: true
    },
    language: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    device_type: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    browser: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    referrer: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    timezone: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    os: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'visits',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "FK_visits_links",
        using: "BTREE",
        fields: [
          { name: "link_id" },
        ]
      },
    ]
  });
};
