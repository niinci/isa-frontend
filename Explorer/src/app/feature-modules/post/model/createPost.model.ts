import { Comment } from './comment.model'; 

export class CreatePost {
  description: string;
  imageUrl: string;
  likes: number;
  comments: Comment[];
  userId: number;
  longitude: number;
  latitude: number;
  createdAt: string;  
  imageBase64: string;

  constructor(
    id: number = 0,
    description: string = '',
    imageUrl: string = '',
    likes: number = 0,
    comments: Comment[] = [],
    userId: number = 0,
    longitude: number = 0.0,
    latitude: number = 0.0,
    createdAt: string = ''
  ) {
    this.description = description;
    this.imageUrl = imageUrl;
    this.likes = likes;
    this.comments = comments;
    this.userId = userId;
    this.longitude = longitude;
    this.latitude = latitude;
    this.createdAt = createdAt;
  }
}
