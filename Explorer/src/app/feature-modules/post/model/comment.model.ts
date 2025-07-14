export class Comment {
    id!: number;
    content!: string;
    userId!: number;
    postId!: number;  // Samo ID posta, bez cele Post instance
    username! : string;
    commentedAt: any;  
    formattedCommentedAt?: Date;

    constructor() {
        this.userId = 0;
        this.postId = 0;
        this.content = '';
        this.username = '';
    }

    parseCommentedAt(): void {
        if (Array.isArray(this.commentedAt) && this.commentedAt.length >= 6) {
            const [year, month, day, hour, minute, second, nano] = this.commentedAt;
            this.formattedCommentedAt = new Date(year, month - 1, day, hour, minute, second, Math.floor(nano / 1_000_000));
        } else {
            console.warn('Invalid commentedAt format:', this.commentedAt);
            this.formattedCommentedAt = undefined; 
        }
    }
}

