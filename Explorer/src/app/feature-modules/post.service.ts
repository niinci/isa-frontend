import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Post } from './post/model/post.model';
import { CreatePost } from './post/model/createPost.model';

@Injectable({
  providedIn: 'root'
})
export class PostService {

  private apiUrl = 'http://localhost:8080/api/posts'; // URL tvoje Spring Boot aplikacije

  constructor(private http: HttpClient) { }

  getAllPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(this.apiUrl + '/sorted');
  }

  createPost(postDTO: CreatePost, imageBase64: string): Observable<any> {
    postDTO.imageBase64 = imageBase64;

    return this.http.post<CreatePost>(this.apiUrl, postDTO);
  }
}
