import { Component, OnInit } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AudioService } from './audio.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private audioService: AudioService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
        this.audioService.preload('alarm', 'assets/analog-watch-alarm_daniel-simion.mp3');
        this.audioService.preload('beep', 'assets/Beep-SoundBible.com-923660219.mp3');
        this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  private _selectedIndex = 0;
  private _appPages = [
    {
      title: 'Thermometer',
      url: '/thermometer',
      icon: 'thermometer'
    },
    {
      title: 'Settings',
      url: '/settings',
      icon: 'settings'
    }
  ];

  ngOnInit() {
    const path = window.location.pathname.split('folder/')[1];
    if (path !== undefined) {
      this.selectedIndex = this.appPages.findIndex(page => page.title.toLowerCase() === path.toLowerCase());
    }
  }

  public get appPages() {
    return this._appPages;
  }
  public get selectedIndex() {
    return this._selectedIndex;
  }
  public set selectedIndex(value) {
    this._selectedIndex = value;
  }
}
