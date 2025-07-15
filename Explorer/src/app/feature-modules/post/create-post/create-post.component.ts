import { Component, OnInit, AfterViewInit, ViewChild, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { PostService } from '../../post.service';
import { Router } from '@angular/router';
import { CreatePost } from '../model/createPost.model';
import { MapComponent } from 'src/app/shared/map/map.component';
import { Position } from '../model/position.model';
import { UserLocationService } from 'src/app/shared/user-location/user-location.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { LocationAddress } from '../model/location-address.model';
import * as L from 'leaflet';
import 'leaflet-control-geocoder';

export const atLeastOneLocationRequired: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const formGroup = control as FormGroup;
  const latitude = formGroup.get('latitude')?.value;
  const longitude = formGroup.get('longitude')?.value;

  if (latitude !== null && longitude !== null) {
    return null;  
  }

  return { atLeastOneLocationRequired: true };
};

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
  selectedLocationAddress: LocationAddress | undefined;
  selectedFileName: string | null = null;
  existingImageUrl: string | null = null;

  @ViewChild(MapComponent) mapComponent!: MapComponent;

  constructor(
    private fb: FormBuilder,
    private postService: PostService,
    private router: Router,
    private userLocationService: UserLocationService,
    private dialogRef: MatDialogRef<CreatePostComponent>,
    private authService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any // <- DODAJ OVO

 
  ) {
    this.postForm = this.fb.group({
      description: ['', Validators.required],
      latitude: [null],
      longitude: [null],
      addressInput: ['']
    }, { validators: atLeastOneLocationRequired });
  }

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      if (user && user.id) {
        this.userId = user.id;
      } else {
        this.userId = null;
      }
    }); 
    
    if (this.data?.post) {
      const post = this.data.post;
  
      this.selectedLocationAddress = typeof post.locationAddress === 'string' 
      ? JSON.parse(post.locationAddress) 
      : post.locationAddress;

    const formattedAddress = this.formatLocationAddress(this.selectedLocationAddress);

      this.postForm.patchValue({
        description: post.description,
        latitude: post.latitude,
        longitude: post.longitude,
        addressInput: formattedAddress
      });
  
      // Ako želiš da prikažeš postojeću sliku (ne menja je)
      this.imageBase64 = null;
      this.imageUploaded = true; // već postoji slika, ako korisnik ne menja
      this.existingImageUrl = post.imageUrl ? this.getFullImageUrl(post.imageUrl) : null;

    }
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imageBase64 = reader.result as string;
      };
      reader.readAsDataURL(file);
      this.selectedFileName = file.name;

      this.existingImageUrl = null;  // korisnik menja sliku, brišemo preview stare
    }else {
      this.selectedFileName = null;
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
    if (this.postForm.invalid || this.userId === null || !this.selectedLocationAddress) return;
  
    const postPayload: CreatePost = {
      description: this.postForm.value.description,
      imageUrl: this.postForm.value.imageUrl,
      likesCount: 0,
      comments: [],
      userId: this.userId,
      longitude: this.postForm.value.longitude,
      latitude: this.postForm.value.latitude,
      createdAt: new Date() as any,
      imageBase64: this.imageBase64 ?? '',
      locationAddress: JSON.stringify(this.selectedLocationAddress)
    };
  
    // EDIT POST
    if (this.data?.post) {
      const postId = this.data.post.id;
      this.postService.updatePost(postId, postPayload).subscribe({
        next: () => {
          console.log('Post updated!');
          this.dialogRef.close(true);
          window.location.reload();
        },
        error: err => {
          console.error('Error updating post:', err);
        }
      });
      return;
    }
  
    // CREATE POST
    if (!this.imageBase64) return;
  
    this.postService.createPost(postPayload, this.imageBase64).subscribe({
      next: (createdPost) => {
        console.log('Post created successfully:', createdPost);
        this.dialogRef.close(true);
        window.location.reload();
      },
      error: (error) => {
        console.error('Error creating post:', error);
      }
    });
  }
  

  onCoordinatesChange(coordinates: [number, number]): void {
    const [latitude, longitude] = coordinates;
  
    this.postForm.patchValue({
      latitude: latitude,
      longitude: longitude,
      addressInput: '' 
    });
  
    console.log('--- onCoordinatesChange: Koordinate primljene:', { latitude, longitude });
  
    this.reverseGeocode(latitude, longitude);
  }

  onClose(): void {
    this.dialogRef.close();  
  }

  onAddressSubmit(): void {
    const address = this.postForm.get('addressInput')?.value;
    if (address && address.trim()) {
      console.log('--- onAddressSubmit: Pokrećem geokodiranje za adresu:', address);
      this.geocodeAddress(address.trim());
    } else {
      alert('Please enter an address to search.');
    }
  }

  private geocodeAddress(address: string): void {
    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('--- Geokodiranje uspešno, rezultat:', data);
        if (data && data.length > 0) {
          const result = data[0];
          const lat = parseFloat(result.lat);
          const lon = parseFloat(result.lon);

          this.postForm.patchValue({
            latitude: lat,
            longitude: lon
          });

          if (this.mapComponent) {
            this.mapComponent.setMarker(lat, lon);
            this.mapComponent.centerMap(lat, lon);
          }

          this.reverseGeocode(lat, lon); 

          console.log('--- Adresa uspešno geokodirana i postavljena na mapi:', { lat, lon });
        } else {
          alert('Adresa nije pronađena. Pokušajte ponovo sa preciznijim unosom.');
          this.postForm.patchValue({ latitude: null, longitude: null }); 
          this.selectedLocationAddress = undefined;
          if (this.mapComponent) {
            this.mapComponent.clearMarker(); 
          }
        }
      })
      .catch(err => {
        console.error('--- Greška pri geokodiranju adrese:', err);
        alert('Došlo je do greške prilikom pretrage adrese. Molimo pokušajte kasnije.');
        this.postForm.patchValue({ latitude: null, longitude: null });
        this.selectedLocationAddress = undefined;
        if (this.mapComponent) {
          this.mapComponent.clearMarker();
        }
      });
  }

  // Metoda za reverzno geokodiranje (koordinate -> adresa)
  private reverseGeocode(latitude: number, longitude: number): void {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log('--- Reverzno geokodiranje uspešno, rezultat:', data);
        const address = data.address || {};
        this.selectedLocationAddress = {
          street: address.road || '',
          city: address.city || address.town || address.village || '',
          country: address.country || '',
          number: address.house_number || ''
        };
        const formattedAddress = `${this.selectedLocationAddress.street} ${this.selectedLocationAddress.number}, ${this.selectedLocationAddress.city}, ${this.selectedLocationAddress.country}`.trim();
        this.postForm.patchValue({ addressInput: formattedAddress });

        console.log('--- Adresa uspešno parsirana:', this.selectedLocationAddress);
      })
      .catch((err) => {
        console.error('--- Greška pri fetchu reverznog geokodiranja:', err);
        this.selectedLocationAddress = undefined;
        this.postForm.patchValue({ addressInput: '' }); 
      });
  }

  formatLocationAddress(addr: any): string {
    if (!addr) return '';
    return `${addr.street} ${addr.number}, ${addr.city}, ${addr.country}`.trim();
  }

  getFullImageUrl(imageName: string): string {
    return `http://localhost:8080/${imageName}`;
  }
  

  
  
}
