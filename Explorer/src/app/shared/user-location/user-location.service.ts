import { Injectable } from '@angular/core';
import { UserPosition } from '../model/userPosition.model';
import { USER } from '../constants';

@Injectable({
  providedIn: 'root'
})
export class UserLocationService {

  constructor() { }

  setCurrentUserPosition(userCoordinates: [number, number]): void {

    try {
      const userId = parseInt(localStorage.getItem(USER)!);

      let userPosition: UserPosition = {
        userId,
        latitude: userCoordinates[0],
        longitude: userCoordinates[1],
        timestamp: new Date()
      }

      localStorage.setItem('userPosition', JSON.stringify(userPosition));
    }
    catch (err) {
      console.log(err);
    }
  }

  getUserPosition(): UserPosition | null {
    const userPositionString = localStorage.getItem('userPosition');
    if (!userPositionString)
      return null;

    const userPosition: UserPosition = JSON.parse(userPositionString);
    return userPosition;
  }
}
