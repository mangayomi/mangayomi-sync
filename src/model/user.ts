import { DataTypes, Model } from "sequelize";
import { db } from "../database.js";

export class User extends Model {
    declare id: string;
    declare email: string;
    declare passwordHash: string;
    declare backupData: string | null;
}

const sequelize = db.sequelize;

User.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    passwordHash: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            is: /^\$2[ayb]\$.{56}$/i,
        },
    },
    backupData: {
        type: "MEDIUMTEXT",
        allowNull: true,
    },
}, {
    tableName: "users",
    sequelize,
    paranoid: true,
    createdAt: "dbCreatedAt",
    updatedAt: "dbUpdatedAt",
    deletedAt: "dbDeletedAt",
});
