import { ArrayMinSize, IsArray, IsDate, IsEmail, IsNumber, Length, ValidateNested, validateOrReject } from "class-validator";
import { Type } from 'class-transformer';

export class UserDTO {
    @IsEmail()
    email!: string;
    @Length(8, 512)
    password!: string;
};

export class TimelineDTO {
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => TimelinePart)
  timelines!: TimelinePart[];
};

export class TimelinePart {
  @IsNumber()
  action!: number;
  @Length(0, 2048)
  data!: string;
  @IsDate()
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
