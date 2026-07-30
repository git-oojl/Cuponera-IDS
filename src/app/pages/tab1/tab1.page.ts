import { Component } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import {
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonImg,
  IonLabel,
  IonRow,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { Coupon } from '../../models/coupon.model';
import { FilterCouponCategoryPipe } from '../../pipes/filter-coupon-category.pipe';
import { CouponService } from '../../services/coupon.service';

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
  ],
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

  changeActive(coupon: Coupon): void {
    coupon.active = !coupon.active;
  }

  onCardKeydown(event: KeyboardEvent, coupon: Coupon): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.changeActive(coupon);
    }
  }
}
