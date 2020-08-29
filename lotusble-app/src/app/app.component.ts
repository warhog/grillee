import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AudioService } from './audio.service';
import { UtilService } from './util.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {

  private _languages: Array<string> = ['en', 'de'];
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

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private audioService: AudioService,
    private utilService: UtilService,
    private translateService: TranslateService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.audioService.preload('alarm', 'assets/analog-watch-alarm_daniel-simion.mp3');
      this.audioService.preload('beep', 'assets/Beep-SoundBible.com-923660219.mp3');
      this.statusBar.styleDefault();
      this.utilService.loadTemperatureAsFahrenheitSetting();
      
      this.initializeLanguage();

      this.splashScreen.hide();
    });

  }

  initializeLanguage() {
    this.translateService.addLangs(this.languages);
    this.translateService.setDefaultLang('en');
    this.translateService.use('en');
    this.utilService.loadLanguageSetting().then((language: string) => {
      this.translateService.use(language);
    }).catch((language: string) => {
      console.info('using browser language:', language);
      this.translateService.use(language);
    }).finally(() => {
      this.initializeLanguageMenu();
    });
  }

  initializeLanguageMenu() {
    this.translateService.get(['general.thermometer', 'settings.settings']).subscribe((res: string) => {
      this.appPages[0].title = res['general.thermometer'];
      this.appPages[1].title = res['settings.settings'];
    });
  }

  ngOnInit() {
    const path = window.location.pathname.split('folder/')[1];
    if (path !== undefined) {
      this.selectedIndex = this.appPages.findIndex(page => page.title.toLowerCase() === path.toLowerCase());
    }
  }

  selectLanguage(language: string) {
    if (this.languages.indexOf(language) >= 0) {
      console.log('selected language: ', language);
      this.translateService.use(language);
      this.initializeLanguageMenu();
      this.utilService.storeLanguageSetting(language);
    } else {
      console.error('invalid language selected: ', language);
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
  public get languages(): Array<string> {
    return this._languages;
  }
  public set languages(value: Array<string>) {
    this._languages = value;
  }
}
