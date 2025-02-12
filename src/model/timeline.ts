import { DataTypes, Model } from "sequelize";
import { db } from "../database.js";

export class Timeline extends Model {
    declare id: string;
    declare user: string;
    declare actionType: string;
    declare isarId: number;
    declare backupData: string;
    declare clientDate: number;
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
    actionType: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    isarId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    backupData: {
        type: "MEDIUMTEXT",
        allowNull: true,
    },
    clientDate: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
}, {
    tableName: "timelines",
    sequelize,
    paranoid: false,
    timestamps: true,
    createdAt: "dbCreatedAt",
    updatedAt: "dbUpdatedAt",
});
