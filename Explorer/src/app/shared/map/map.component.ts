import { Component, AfterViewInit, OnDestroy, Output, EventEmitter, Input } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})
export class MapComponent implements AfterViewInit, OnDestroy {
  private map: L.Map;
  private marker: L.Marker | null = null;
  private mapInitialized = false;

  @Output() coordinatesChange = new EventEmitter<[number, number]>();

  @Input() initialLatitude: number | undefined;
  @Input() initialLongitude: number | undefined;

  private initMap(): void {
    if (this.mapInitialized) {
      return;
    }

    this.map = L.map('map', {
      center: [45.2396, 19.8227],
      zoom: 13,
    });

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    });

    tiles.addTo(this.map);

    this.map.on('click', this.onMapClick.bind(this));

    this.mapInitialized = true;
    console.log('init');
  }

  ngAfterViewInit(): void {
    let DefaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.6.0/dist/images/marker-icon.png',
    });

    L.Marker.prototype.options.icon = DefaultIcon;

    setTimeout(() => {
      if (!this.map) {
        this.initMap();
      }
    }, 0);
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private onMapClick(e: L.LeafletMouseEvent): void {
    const latlng = e.latlng;

    const redDot = L.icon({
      iconUrl: '../assets/images/red-dot.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    if (this.marker) {
      this.map.removeLayer(this.marker);
    }

    this.marker = L.marker(latlng, { icon: redDot }).addTo(this.map);
    console.log("marker added", this.marker);

    this.coordinatesChange.emit([latlng.lat, latlng.lng]);
  }

  public getMapZoom(): number {
    if (this.map) {
      return this.map.getZoom();
    }
    return 13; 
  }

  public setMarker(lat: number, lng: number): void {
    if (!this.mapInitialized) {
      console.warn('Map not initialized yet. Cannot set marker.');
      return;
    }

    const redDot = L.icon({
      iconUrl: '../assets/images/red-dot.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    if (this.marker) {
      this.map.removeLayer(this.marker);
    }

    this.marker = L.marker([lat, lng], { icon: redDot }).addTo(this.map);
    console.log("Marker set at:", lat, lng);
    this.coordinatesChange.emit([lat, lng]); 
  }

  public centerMap(lat: number, lng: number, zoom: number = 16): void {
    if (this.mapInitialized) {
      this.map.setView([lat, lng], zoom);
      console.log("Map centered at:", lat, lng, "with zoom:", zoom);
    } else {
        console.warn('Map not initialized yet. Cannot center map.');
    }
  }

  public clearMarker(): void {
    if (this.marker) {
      this.map.removeLayer(this.marker);
      this.marker = null;
      console.log("Marker cleared.");
    }
  }
}

