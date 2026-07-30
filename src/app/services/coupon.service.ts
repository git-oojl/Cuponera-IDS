import { Injectable } from '@angular/core';
import { Coupon, ICouponData } from '../models/coupon.model';

@Injectable({
  providedIn: 'root',
})
export class CouponService {
  processCoupons(couponsData: ICouponData[]): Coupon[] {
    return couponsData
      .map((couponData) => new Coupon({ ...couponData, active: couponData.active ?? false }))
      .filter((coupon) => coupon.isValid());
  }

  async getCoupons(): Promise<Coupon[]> {
    try {
      const response = await fetch('./assets/data/coupons.json');

      if (!response.ok) {
        return [];
      }

      const couponsData = (await response.json()) as ICouponData[];
      return this.processCoupons(couponsData);
    } catch {
      return [];
    }
  }
}
