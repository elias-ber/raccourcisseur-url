const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('links', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    short_id: {
      type: DataTypes.CHAR(32),
      allowNull: true,
      unique: "short_id"
    },
    redirection: {
      type: DataTypes.STRING(4080),
      allowNull: true
    },
    password_hash: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    expirated_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    is_active: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'links',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
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
        name: "short_id",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "short_id" },
        ]
      },
      {
        name: "FK_links_users",
        using: "BTREE",
        fields: [
          { name: "created_by" },
        ]
      },
    ]
  });
};
