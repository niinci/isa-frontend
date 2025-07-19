import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { HttpClient, HttpHeaders } from '@angular/common/http';

const DEFAULT_LATITUDE = 44.7866;  // Beograd latitude
const DEFAULT_LONGITUDE = 20.4489; // Beograd longitude

interface CareLocationDTO {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

@Component({
  selector: 'app-nearby-posts',
  templateUrl: './nearby-posts.component.html',
  styleUrls: ['./nearby-posts.component.css']
})
export class NearbyPostsComponent implements AfterViewInit {
  private map!: L.Map;

  private bunnyIcon = L.icon({
  iconUrl: 'assets/images/bunnybunny.png', 
  iconSize: [60, 60],         
  iconAnchor: [20, 40],        
  popupAnchor: [0, -40]        
});

 private bunnyIcon2 = L.icon({
  iconUrl: 'assets/images/bunnyvet.png', 
  iconSize: [70, 70],         
  iconAnchor: [20, 40],        
  popupAnchor: [0, -40]        
});


  constructor(private http: HttpClient) {}

  ngAfterViewInit(): void {
  const token = localStorage.getItem('jwtToken') ?? '';
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  this.http.get<any>('http://localhost:8080/api/userAccount/location', { headers })
    .subscribe({
      next: loc => {
        const lat = loc?.latitude ?? DEFAULT_LATITUDE;
        const lon = loc?.longitude ?? DEFAULT_LONGITUDE;

        this.initMap(lat, lon);

        // Prikaz obližnjih objava
        this.http.get<any[]>('http://localhost:8080/api/posts/nearby', {
          headers,
          params: {
            latitude: lat.toString(),
            longitude: lon.toString(),
            radiusKm: '50'
          }
        }).subscribe({
          next: posts => {
            posts.forEach(post => {
              L.marker([post.latitude, post.longitude], { icon: this.bunnyIcon })
                .addTo(this.map)
                .bindPopup(post.title);
            });
          },
          error: err => {
            console.error("Greška pri dohvatanju obližnjih objava:", err);
          }
        });

        // Prikaz lokacija za brigu o zečevima
        this.http.get<CareLocationDTO[]>('http://localhost:8080/api/care-locations', { headers })
          .subscribe({
            next: locations => {
              locations.forEach(loc => {
                L.marker([loc.latitude, loc.longitude], { icon: this.bunnyIcon2 })
                  .addTo(this.map)
                  .bindPopup(`<b>${loc.name}</b><br>${loc.address}`);
              });
            },
            error: err => {
              console.error("Greška pri dohvatanju lokacija za brigu o zečevima:", err);
            }
          });

      },
      error: err => {
        console.error("Greška:", err);
        this.initMap(DEFAULT_LATITUDE, DEFAULT_LONGITUDE);
      }
    });
  }

  private initMap(lat: number, lon: number): void {
    if (this.map) this.map.remove(); 
    this.map = L.map('map').setView([lat, lon], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);
  }
}
