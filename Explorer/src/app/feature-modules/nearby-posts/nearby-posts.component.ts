import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { HttpClient, HttpHeaders } from '@angular/common/http';

const DEFAULT_LATITUDE = 44.7866;
const DEFAULT_LONGITUDE = 20.4489;

interface CareLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

@Component({
  selector: 'app-nearby-posts',
  templateUrl: './nearby-posts.component.html',
  styleUrls: ['./nearby-posts.component.css']
})
export class NearbyPostsComponent implements AfterViewInit {
  private map!: L.Map;

  private bunnyIcon = L.icon({
    iconUrl: 'assets/images/bunny1.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });

  constructor(private http: HttpClient) {}

  ngAfterViewInit(): void {
    const token = localStorage.getItem('jwtToken') ?? '';
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<any>('http://localhost:8080/api/userAccount/location', { headers })
      .subscribe({
        next: loc => {
          const lat = loc?.latitude ?? DEFAULT_LATITUDE;
          const lon = loc?.longitude ?? DEFAULT_LONGITUDE;

          this.initMap(lat, lon);
          this.loadNearbyPosts(lat, lon, headers);   // већ постојеће
          this.loadCareLocations(headers);           // 🐰 НОВО
        },
        error: () => {
          this.initMap(DEFAULT_LATITUDE, DEFAULT_LONGITUDE);
          this.loadNearbyPosts(DEFAULT_LATITUDE, DEFAULT_LONGITUDE, headers);
          this.loadCareLocations(headers);
        }
      });
  }

  /* ========== Постојеће методе ========== */
  private initMap(lat: number, lon: number): void {
    if (this.map) this.map.remove();
    this.map = L.map('map').setView([lat, lon], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);
  }

  private loadNearbyPosts(lat: number, lon: number, headers: HttpHeaders): void {
    this.http.get<any[]>('http://localhost:8080/api/posts/nearby', {
      headers,
      params: { latitude: lat, longitude: lon, radiusKm: '50' }
    }).subscribe({
      next: posts => {
        posts.forEach(p =>
          L.marker([p.latitude, p.longitude], { icon: this.bunnyIcon })
            .addTo(this.map)
            .bindPopup(p.title)
        );
      },
      error: err => console.error('Greška pri dohvatanju obliznjih objava:', err)
    });
  }

  /* ==========  НОВО: учитавање зечјих локација ========== */
  private loadCareLocations(headers: HttpHeaders): void {
    this.http.get<CareLocation[]>('http://localhost:8080/api/care-locations', { headers })
      .subscribe({
        next: locs => {
          locs.forEach(loc =>
            L.marker([loc.lat, loc.lng], { icon: this.bunnyIcon })
              .addTo(this.map)
              .bindPopup(`<b>${loc.name}</b><br/>Briga o zečevima 🐰`)
          );
        },
        error: err => console.error('Greška pri dohvatanju care-locations:', err)
      });
  }
  posaljiTestZeca(): void {
  const token = localStorage.getItem('jwtToken') ?? '';
  const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
  
  const body = {
    id: Math.floor(Math.random() * 1000).toString(),
    name: 'Test lokacija Zeka 🐰',
    lat: 44.8,
    lng: 20.45
  };

  this.http.post('http://localhost:8080/mq/rabbit-care', body, { headers })
    .subscribe({
      next: () => console.log('Test lokacija poslata!'),
      error: err => console.error('Greška pri slanju:', err)
    });
}

}
