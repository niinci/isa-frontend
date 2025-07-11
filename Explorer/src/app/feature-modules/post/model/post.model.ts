import { Comment } from "./comment.model";
export class Post {
  id: number;
  description: string;
  imageUrl: string;  
  likesCount: number;  
  comments: Comment[];  
  deleted: boolean;  
  userId: number; 

  constructor() {
    this.likesCount = 0;  
    this.comments = [];  
    this.deleted = false;  
  }
}