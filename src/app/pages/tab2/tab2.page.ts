import { Component } from '@angular/core';
import { App } from '@capacitor/app';
import { Capacitor, PluginListenerHandle } from '@capacitor/core';
import { ScreenBrightness } from '@capacitor-community/screen-brightness';
import { IonContent, IonHeader, IonText, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { QRCodeComponent } from 'angularx-qrcode';
import { CouponService } from '../../services/coupon.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonText, QRCodeComponent],
})
export class Tab2Page {
  QRCode = '';
  private originalBrightness: number | null = null;
  private appStateListener: PluginListenerHandle | null = null;
  private viewActive = false;

  constructor(private couponService: CouponService) {}

  async ionViewWillEnter(): Promise<void> {
    this.viewActive = true;
    await this.loadQRCode();
    await this.setMaxBrightness();
    await this.registerAppStateListener();
  }

  async ionViewDidLeave(): Promise<void> {
    this.viewActive = false;
    await this.removeAppStateListener();
    await this.restoreBrightness();
  }

  private async loadQRCode(): Promise<void> {
    const coupons = await this.couponService.getCoupons();
    const activeCoupons = coupons.filter((coupon) => coupon.active);

    this.QRCode = activeCoupons.length
      ? JSON.stringify(activeCoupons.map((coupon) => coupon.toCouponData()))
      : '';
  }

  private async setMaxBrightness(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    try {
      if (this.originalBrightness === null) {
        const { brightness } = await ScreenBrightness.getBrightness();
        this.originalBrightness = brightness;
      }

      await ScreenBrightness.setBrightness({ brightness: 1 });
    } catch {
      // El QR debe seguir funcionando aunque el plugin nativo falle.
    }
  }

  private async restoreBrightness(): Promise<void> {
    if (!Capacitor.isNativePlatform() || this.originalBrightness === null) {
      return;
    }

    try {
      await ScreenBrightness.setBrightness({ brightness: this.originalBrightness });
    } catch {
      // Sin accion: restaurar brillo solo aplica en dispositivo nativo.
    }
  }

  private async registerAppStateListener(): Promise<void> {
    if (!Capacitor.isNativePlatform() || this.appStateListener) {
      return;
    }

    this.appStateListener = await App.addListener('appStateChange', (state) => {
      if (!this.viewActive) {
        return;
      }

      if (state.isActive) {
        void this.setMaxBrightness();
      } else {
        void this.restoreBrightness();
      }
    });
  }

  private async removeAppStateListener(): Promise<void> {
    if (!this.appStateListener) {
      return;
    }

    await this.appStateListener.remove();
    this.appStateListener = null;
  }
}
