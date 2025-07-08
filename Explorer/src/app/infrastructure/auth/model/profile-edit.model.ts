import { Address } from "src/app/infrastructure/auth/model/Address.model";

export interface ProfileEdit{
    firstName: string;
    lastName: string;
    bio?: string;
    address: Address;
}