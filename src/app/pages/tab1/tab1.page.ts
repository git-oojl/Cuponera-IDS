import { Component } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import {
  CapacitorBarcodeScanner,
  CapacitorBarcodeScannerTypeHint,
  type CapacitorBarcodeScannerScanResult,
} from '@capacitor/barcode-scanner';
import { Capacitor } from '@capacitor/core';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonImg,
  IonLabel,
  IonRow,
  IonSegment,
  IonSegmentButton,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { AlertController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { cameraOutline } from 'ionicons/icons';
import { Coupon, ICouponData } from '../../models/coupon.model';
import { FilterCouponCategoryPipe } from '../../pipes/filter-coupon-category.pipe';
import { CouponService } from '../../services/coupon.service';
import { ToastService } from '../../services/toast.service';

type CouponCategory = 'candies' | 'drinks' | 'meats';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [
    NgTemplateOutlet,
    FilterCouponCategoryPipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonImg,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonText,
  ],
})
export class Tab1Page {
  coupons: Coupon[] = [];
  selectedCategory: CouponCategory = 'candies';

  constructor(
    private alertController: AlertController,
    private couponService: CouponService,
    private toastService: ToastService,
  ) {
    addIcons({ cameraOutline });
  }

  async ionViewWillEnter(): Promise<void> {
    this.coupons = await this.couponService.getCoupons();
  }

  onCategoryChange(event: CustomEvent<{ value?: string | number }>): void {
    const value = event.detail.value;

    if (value === 'candies' || value === 'drinks' || value === 'meats') {
      this.selectedCategory = value;
    }
  }

  async changeActive(coupon: Coupon): Promise<void> {
    if (coupon.active) {
      await this.updateCouponState(coupon, false);
      return;
    }

    const alert = await this.alertController.create({
      header: 'Canjear cupón',
      message: `¿Quieres activar "${coupon.name}" para canjearlo?`,
      buttons: [
        {
          text: 'No',
          role: 'cancel',
        },
        {
          text: 'Sí, activar',
          handler: async () => {
            await this.updateCouponState(coupon, true);
          },
        },
      ],
    });

    await alert.present();
  }

  private async updateCouponState(coupon: Coupon, active: boolean): Promise<void> {
    const previousState = coupon.active;
    coupon.active = active;

    try {
      await this.couponService.saveCoupons(this.coupons);
    } catch {
      coupon.active = previousState;
    }
  }

  onCardKeydown(event: KeyboardEvent, coupon: Coupon): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      void this.changeActive(coupon);
    }
  }

  async startCamera(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      await this.toastService.showToast('Escáner no disponible en navegador');
      return;
    }

    let scanResult: CapacitorBarcodeScannerScanResult;

    try {
      scanResult = await CapacitorBarcodeScanner.scanBarcode({
        hint: CapacitorBarcodeScannerTypeHint.QR_CODE,
        scanInstructions: 'Escanea el QR de un cupón',
        scanButton: true,
        scanText: 'Escanear',
        cancelButtonAccessibilityLabel: 'Cancelar escaneo',
        torchButtonOnAccessibilityLabel: 'Apagar linterna',
        torchButtonOffAccessibilityLabel: 'Encender linterna',
      });
    } catch (error) {
      console.error('Scanner error', error);
      await this.toastService.showToast('QR inválido');
      return;
    }

    const scanText = scanResult.ScanResult;

    if (!scanText) {
      await this.toastService.showToast('Escaneo cancelado');
      return;
    }

    await this.addCouponFromScanText(scanText);
  }

  private async addCouponFromScanText(scanText: string): Promise<void> {
    let couponData: ICouponData;

    try {
      const parsedValue = JSON.parse(scanText) as unknown;

      if (!this.isPlainObject(parsedValue)) {
        await this.toastService.showToast('QR inválido');
        return;
      }

      couponData = parsedValue as unknown as ICouponData;
    } catch (error) {
      console.error('QR parse error', error);
      await this.toastService.showToast('QR inválido');
      return;
    }

    const coupon = new Coupon({ ...couponData, active: couponData.active ?? false });

    if (!coupon.isValid()) {
      await this.toastService.showToast('El cupón es inválido');
      return;
    }

    if (this.coupons.some((existingCoupon) => existingCoupon.isEqual(coupon))) {
      await this.toastService.showToast('El cupón ya existe');
      return;
    }

    const previousCoupons = this.coupons;
    this.coupons = [...this.coupons, coupon];

    try {
      await this.couponService.saveCoupons(this.coupons);
      await this.toastService.showToast('Cupón agregado');
    } catch (error) {
      console.error('Coupon save error', error);
      this.coupons = previousCoupons;
      await this.toastService.showToast('No se pudo guardar el cupón');
    }
  }

  private isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
}
