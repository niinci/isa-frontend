import { Comment } from "./comment.model";
export class Post {
  id: number;
  description: string;
  imageUrl: string;  
  likes: number;  
  comments: Comment[];  
  deleted: boolean;  
  constructor() {
    this.likes = 0;  
    this.comments = [];  
    this.deleted = false;  
  }
}