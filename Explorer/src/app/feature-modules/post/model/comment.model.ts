import { Post } from "./post.model";

export class Comment {
    id: number;
    content: string;
    userId: number;
    post: Post;

    constructor() {
        this.userId = 0;
    }
}
