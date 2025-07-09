import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Post } from './post/model/post.model';
import { CreatePost } from './post/model/createPost.model';
import { Comment } from './post/model/comment.model';

@Injectable({
  providedIn: 'root'
})
export class PostService {

  private apiUrl = 'http://localhost:8080/api/posts'; // URL tvoje Spring Boot aplikacije
  private commentsUrl = 'http://localhost:8080/api/comments';

  constructor(private http: HttpClient) { }

  getAllPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(this.apiUrl + '/sorted');
  }

  createPost(postDTO: CreatePost, imageBase64: string): Observable<any> {
    postDTO.imageBase64 = imageBase64;

    return this.http.post<CreatePost>(this.apiUrl, postDTO);
  }

  likePost(postId: number): Observable<{ liked: boolean }> {
    return this.http.post<{ liked: boolean }>(`${this.apiUrl}/${postId}/like`, {});
  }
  getLikedPosts(userId: number): Observable<Post[]> {
    return this.http.get<Post[]>(this.apiUrl + "/liked");
  }
  getCommentsByPost(postId: number): Observable<Comment[]> {
    return this.http.get<any[]>(`${this.commentsUrl}/post/${postId}`).pipe(
      map(comments => comments.map(c => {
        const comment = new Comment();
        comment.id= c.id;
        comment.content = c.content;
        comment.userId = c.userId;
        comment.postId = postId; // ili c.postId ako dolazi iz backend-a
        return comment;
      }))
    );
  }

  addComment(postId: number, comment: Comment): Observable<Comment> {
    return this.http.post<Comment>(`${this.commentsUrl}/post/${postId}`, comment);
  }
}
