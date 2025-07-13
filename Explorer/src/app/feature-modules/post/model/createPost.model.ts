import { Comment } from './comment.model'; 
import { LocationAddress } from './location-address.model'; 

export class CreatePost {
  description: string;
  imageUrl: string;
  likesCount: number;
  comments: Comment[];
  userId: number;
  longitude: number;
  latitude: number;
  createdAt: string;  
  imageBase64: string;
  locationAddress?: string;

  constructor(
    id: number = 0,
    description: string = '',
    imageUrl: string = '',
    likesCount: number = 0,
    comments: Comment[] = [],
    userId: number = 0,
    longitude: number = 0.0,
    latitude: number = 0.0,
    createdAt: string = '',
    locationAddress?: string
  ) {
    this.description = description;
    this.imageUrl = imageUrl;
    this.likesCount = likesCount;
    this.comments = comments;
    this.userId = userId;
    this.longitude = longitude;
    this.latitude = latitude;
    this.createdAt = createdAt;
    this.locationAddress = locationAddress;
  }
}
