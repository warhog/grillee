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
        console.log('cannot play sound ' + key + ': ', err);
      });
    } else {
      console.log('sound not in preloaded list: ' + key);
    }
  }

}
