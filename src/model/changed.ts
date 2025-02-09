import { DataTypes, Model } from "sequelize";
import { db } from "../database.js";

export class Timeline extends Model {
    declare id: string;
    declare user: string;
    declare action: string;
    declare isarId: number;
    declare data: string;
    declare clientDate: string;
}

const sequelize = db.sequelize;

Timeline.init({
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
    action: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    isarId: {
        type: DataTypes.NUMBER,
        allowNull: false,
    },
    data: {
        type: "MEDIUMTEXT",
        allowNull: true,
    },
    clientDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
}, {
    tableName: "timelines",
    sequelize,
    paranoid: true,
    createdAt: "dbCreatedAt",
    updatedAt: "dbUpdatedAt",
    deletedAt: "dbDeletedAt",
});
