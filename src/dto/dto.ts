import { IsEmail, Length, validateOrReject } from "class-validator";

export class UserDTO {
    @IsEmail()
    email!: string;
    @Length(8, 512)
    password!: string;
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
