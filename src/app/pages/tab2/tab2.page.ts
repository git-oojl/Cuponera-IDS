import { Component } from '@angular/core';
import { App } from '@capacitor/app';
import { Capacitor, PluginListenerHandle } from '@capacitor/core';
import { ScreenBrightness } from '@capacitor-community/screen-brightness';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { QRCodeComponent } from 'angularx-qrcode';
import { DEFAULT_COUPONS } from '../../data/default-coupons';
import { DEMO_COUPONS } from '../../data/demo-coupons';
import { Coupon, ICouponData } from '../../models/coupon.model';
import { CouponService } from '../../services/coupon.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonText,
    IonModal,
    IonList,
    IonItem,
    IonLabel,
    QRCodeComponent,
  ],
})
export class Tab2Page {
  QRCode = '';
  defaultCoupons = DEFAULT_COUPONS;
  demoCoupons = DEMO_COUPONS;
  qrCoupons = [...DEFAULT_COUPONS, ...DEMO_COUPONS];
  inventoryCoupons: Coupon[] = [];
  demoModalOpen = false;
  selectedDemoCoupon: ICouponData = this.qrCoupons[0];
  demoQRCode = JSON.stringify(this.qrCoupons[0]);
  private originalBrightness: number | null = null;
  private appStateListener: PluginListenerHandle | null = null;
  private viewActive = false;

  constructor(
    private couponService: CouponService,
    private toastService: ToastService,
  ) {}

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
    this.inventoryCoupons = coupons;
    const activeCoupons = coupons.filter((coupon) => coupon.active);

    this.QRCode = activeCoupons.length
      ? JSON.stringify(activeCoupons.map((coupon) => coupon.toCouponData()))
      : '';
  }

  async openDemoCoupons(): Promise<void> {
    this.inventoryCoupons = await this.couponService.getCoupons();
    this.demoModalOpen = true;
  }

  closeDemoCoupons(): void {
    this.demoModalOpen = false;
  }

  selectDemoCoupon(coupon: ICouponData): void {
    this.selectedDemoCoupon = coupon;
    this.demoQRCode = JSON.stringify(coupon);
  }

  hasInventoryCoupon(couponData: ICouponData): boolean {
    return this.inventoryCoupons.some((coupon) => coupon.idProduct === couponData.idProduct);
  }

  async toggleInventoryCoupon(couponData: ICouponData): Promise<void> {
    if (this.hasInventoryCoupon(couponData)) {
      this.inventoryCoupons = this.inventoryCoupons.filter(
        (coupon) => coupon.idProduct !== couponData.idProduct,
      );
    } else {
      this.inventoryCoupons = [
        ...this.inventoryCoupons,
        new Coupon({ ...couponData, active: couponData.active ?? false }),
      ];
    }

    await this.saveDemoInventory('Inventario actualizado');
  }

  async restoreDefaultInventory(): Promise<void> {
    this.inventoryCoupons = this.couponService.processCoupons(DEFAULT_COUPONS);
    await this.saveDemoInventory('Inventario base restaurado');
  }

  async clearInventory(): Promise<void> {
    this.inventoryCoupons = [];
    await this.saveDemoInventory('Inventario vacío');
  }

  async loadAllDemoInventory(): Promise<void> {
    this.inventoryCoupons = this.couponService.processCoupons(this.qrCoupons);
    await this.saveDemoInventory('Inventario demo cargado');
  }

  private async saveDemoInventory(message: string): Promise<void> {
    try {
      await this.couponService.saveCoupons(this.inventoryCoupons);
      await this.loadQRCode();
      await this.toastService.showToast(message);
    } catch (error) {
      console.error('No se pudo guardar el inventario demo', error);
      await this.toastService.showToast('No se pudo guardar el inventario');
    }
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
