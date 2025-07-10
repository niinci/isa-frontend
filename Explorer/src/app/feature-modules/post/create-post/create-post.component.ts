import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PostService } from '../../post.service';
import { Router } from '@angular/router';
import { CreatePost } from '../model/createPost.model';
import { MapComponent } from 'src/app/shared/map/map.component';
import { Position } from '../model/position.model';
import { UserLocationService } from 'src/app/shared/user-location/user-location.service';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';

@Component({
  selector: 'xp-create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.css']
})
export class CreatePostComponent implements OnInit {

  postForm: FormGroup;
  marker: any;
  imageBase64: string | null = null;
  imageUploaded: boolean = false;
  userId: number | null = null;


  @ViewChild(MapComponent) map: MapComponent;

  constructor(
    private fb: FormBuilder,
    private postService: PostService,
    private router: Router,
    private userLocationService: UserLocationService,
    private dialogRef: MatDialogRef<CreatePostComponent>,
    private authService: AuthService 
 
  ) {
    this.postForm = this.fb.group({
      description: ['', Validators.required],
      latitude: [null],
      longitude: [null]
    });
  }

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      if (user && user.id) {
        this.userId = user.id;
      } else {
        this.userId = null;
      }
    });  
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imageBase64 = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
    const localImageUrl = URL.createObjectURL(file); 
    this.postForm.patchValue({ imageUrl: localImageUrl });
    this.imageUploaded = true;
  }

  getPosition(): Position | null{
    const userPosition: Position | null = this.userLocationService.getUserPosition();

    if(!userPosition)
      return null;

    return {
      latitude: userPosition.latitude,
      longitude: userPosition.longitude
    }
  }


  onSubmit(): void {
    if (this.postForm.invalid || !this.imageBase64 || this.userId === null) {
      return;
    }

    const createPost: CreatePost = {
      description: this.postForm.value.description,
      imageUrl: this.postForm.value.imageUrl,   
      likes: 0,   
      comments: [],   
      userId: this.userId, 
      longitude: this.postForm.value.longitude,
      latitude: this.postForm.value.latitude,
      createdAt: new Date() as any,   
      imageBase64: this.imageBase64
    };

    this.postService.createPost(createPost, this.imageBase64).subscribe({
      next: (createdPost) => {
        console.log('Post created successfully:', createdPost);
        this.dialogRef.close(); 
        window.location.reload(); 
      },
      error: (error) => {
        console.error('Error creating post:', error);
      }
    });
  }

  onCoordinatesChange(coordinates: [number, number]): void {
    this.postForm.patchValue({
      latitude: coordinates[0],
      longitude: coordinates[1],
    });
  }
}
