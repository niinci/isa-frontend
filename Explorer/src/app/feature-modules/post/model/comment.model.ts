export class Comment {
    id!: number;
    content!: string;
    userId!: number;
    postId!: number;  // Samo ID posta, bez cele Post instance
    username! : string;


    constructor() {
        this.userId = 0;
        this.postId = 0;
        this.content = '';
        this.username = '';
    }
}

