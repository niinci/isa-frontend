import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PostService } from '../post.service';
import { Router } from '@angular/router';
import { CreatPost } from '../post/model/createPost.model';
import * as L from 'leaflet';

@Component({
  selector: 'xp-create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.css']
})
export class CreatePostComponent implements OnInit, AfterViewInit {

  postForm: FormGroup;
  imageFile: File | null = null;
  map: any;
  marker: any;

  constructor(
    private fb: FormBuilder,
    private postService: PostService,
    private router: Router
  ) {
    this.postForm = this.fb.group({
      description: ['', Validators.required],
      image: [null],
      address: ['', Validators.required],
      latitude: [null],
      longitude: [null]
    });
  }

  ngOnInit(): void {
    // Init form, no map here
  }

  ngAfterViewInit(): void {
    this.initMap();  // Poziva se kada je DOM spreman
  }

  initMap(): void {
    const initialLocation = { lat: 40.7128, lng: -74.0060 };

    this.map = L.map('map').setView([initialLocation.lat, initialLocation.lng], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    this.marker = L.marker([initialLocation.lat, initialLocation.lng], { draggable: true }).addTo(this.map);

    this.marker.on('dragend', (event: L.LeafletMouseEvent) => {
      const latLng = event.target.getLatLng();
      this.updateCoordinates(latLng.lat, latLng.lng);
    });

    this.map.on('click', (event: L.LeafletMouseEvent) => {
      this.marker.setLatLng(event.latlng);
      this.updateCoordinates(event.latlng.lat, event.latlng.lng);
    });
  }

  updateCoordinates(lat: number, lng: number): void {
    this.postForm.patchValue({
      latitude: lat,
      longitude: lng
    });
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.imageFile = file;
    }
  }

  onSubmit(): void {
    if (this.postForm.invalid) {
      return;
    }

    const createPost = new CreatPost(
      0,
      this.postForm.get('description')?.value,
      '',
      0,
      [],
      1,
      this.postForm.get('longitude')?.value,
      this.postForm.get('latitude')?.value,
      ''
    );

    this.postService.createPost(createPost, this.imageFile).subscribe(
      (response) => {
        this.router.navigate(['/posts']);
      },
      (error) => {
        console.error('Error creating post', error);
      }
    );
  }
}
