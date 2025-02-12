import { ArrayMinSize, IsArray, IsDate, IsEmail, IsNumber, IsOptional, Length, ValidateNested, validateOrReject } from "class-validator";
import { Type } from 'class-transformer';

export enum ActionType {
  ADD_ITEM = "ADD_ITEM",
  REMOVE_ITEM = "REMOVE_ITEM",
  UPDATE_ITEM = "UPDATE_ITEM",
  ADD_CATEGORY = "ADD_CATEGORY",
  REMOVE_CATEGORY = "REMOVE_CATEGORY",
  RENAME_CATEGORY = "RENAME_CATEGORY",
  ADD_CHAPTER = "ADD_CHAPTER",
  REMOVE_CHAPTER = "REMOVE_CHAPTER",
  UPDATE_CHAPTER = "UPDATE_CHAPTER",
  CLEAR_HISTORY = "CLEAR_HISTORY",
  ADD_HISTORY = "ADD_HISTORY",
  REMOVE_HISTORY = "REMOVE_HISTORY",
  UPDATE_HISTORY = "UPDATE_HISTORY",
  CLEAR_UPDATES = "CLEAR_UPDATES",
  ADD_UPDATE = "ADD_UPDATE",
  CLEAR_EXTENSION = "CLEAR_EXTENSION",
  ADD_EXTENSION = "ADD_EXTENSION",
  REMOVE_EXTENSION = "REMOVE_EXTENSION",
  UPDATE_EXTENSION = "UPDATE_EXTENSION",
  ADD_TRACK = "ADD_TRACK",
  REMOVE_TRACK = "REMOVE_TRACK",
  UPDATE_TRACK = "UPDATE_TRACK",
}

export class UserDTO {
    @IsEmail()
    email!: string;
    @Length(8, 512)
    password!: string;
};

export class ChangedDTO {
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => ChangedPart)
  changedParts!: ChangedPart[];
};

export class ChangedPart {
  @Length(0, 128)
  action!: string;
  @IsNumber()
  @IsOptional()
  isarId?: number;
  data!: string;
  @IsNumber()
  clientDate!: number;
};

export async function validateDto(dto: Object): Promise<boolean> {
    try {
        await validateOrReject(dto);
        return true;
      } catch (errors) {
        console.log('Caught promise rejection (validation failed). Errors: ', errors);
        return false;
      }
}
