import { Component } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { Coupon } from '../../models/coupon.model';
import { CouponService } from '../../services/coupon.service';

type CouponCategory = 'candies' | 'drinks' | 'meats';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonSegment, IonSegmentButton, IonLabel],
})
export class Tab1Page {
  coupons: Coupon[] = [];
  selectedCategory: CouponCategory = 'candies';

  constructor(private couponService: CouponService) {}

  async ionViewWillEnter(): Promise<void> {
    this.coupons = await this.couponService.getCoupons();
  }

  onCategoryChange(event: CustomEvent<{ value?: string | number }>): void {
    const value = event.detail.value;

    if (value === 'candies' || value === 'drinks' || value === 'meats') {
      this.selectedCategory = value;
    }
  }
}
