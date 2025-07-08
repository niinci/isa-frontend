import { Address } from "./Address.model";

export interface UserInfo {
    id: number;
    username: string;
    email: string;
    address: Address;
    firstName: string;
    lastName: string;
    followersCount: number;
    followingCount: number;
    postsCount: number;
    profilePictureUrl?: string;
    bio: string;
    joinDate?: Date;
    

}