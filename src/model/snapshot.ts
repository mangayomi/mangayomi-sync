import { DataTypes, Model } from "sequelize";
import { db } from "../database.js";

export class Snapshot extends Model {
    declare id: string;
    declare user: string;
    declare data: string;
}

const sequelize = db.sequelize;

Snapshot.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
    },
    user: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    data: {
        type: "MEDIUMTEXT",
        allowNull: true,
    },
}, {
    tableName: "snapshots",
    sequelize,
    paranoid: true,
    createdAt: "dbCreatedAt",
    updatedAt: "dbUpdatedAt",
    deletedAt: "dbDeletedAt",
});
