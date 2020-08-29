/**
* Copyright (C) 2020 warhog <warhog@gmx.de>
* 
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
* 
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
* 
* You should have received a copy of the GNU General Public License
* along with this program.  If not, see <https://www.gnu.org/licenses/>.
**/
import { Injectable } from '@angular/core';
import { NativeAudio } from '@ionic-native/native-audio/ngx';

interface Sound {
  key: string;
  asset: string;
}

@Injectable({
  providedIn: 'root'
})
export class AudioService {

  private sounds: Sound[] = [];

  constructor(private nativeAudio: NativeAudio) {}

  preload(key: string, asset: string): void {
    this.nativeAudio.preloadSimple(key, asset);
    this.sounds.push({
      key: key,
      asset: asset
    });
  }

  play(key: string): void {
    let soundEntry = this.sounds.find((sound) => {
      return sound.key === key;
    });

    if (soundEntry) {
      this.nativeAudio.play(key).then((res) => {
        console.log('played sound ' + key + ': ', res);
      }, (err) => {
        console.error('cannot play sound ' + key + ': ', err);
      });
    } else {
      console.error('sound not in preloaded list: ' + key);
    }
  }

}
