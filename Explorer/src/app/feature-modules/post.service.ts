import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Post } from './post/model/post.model';
import { CreatPost } from './post/model/createPost.model';

@Injectable({
  providedIn: 'root'
})
export class PostService {

  private apiUrl = 'http://localhost:8080/api/posts/sorted'; // URL tvoje Spring Boot aplikacije

  constructor(private http: HttpClient) { }

  getAllPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(this.apiUrl);
  }

  createPost(createPost: CreatPost, imageFile: File | null): Observable<Post> {
    const formData: FormData = new FormData();

    formData.append('createPost', JSON.stringify(createPost));

    if (imageFile) {
      formData.append('image', imageFile, imageFile.name);
    }

    return this.http.post<Post>(this.apiUrl, formData);
  }
}
