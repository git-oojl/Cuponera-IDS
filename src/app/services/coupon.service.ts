import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { Coupon, ICouponData } from '../models/coupon.model';

@Injectable({
  providedIn: 'root',
})
export class CouponService {
  private readonly DDR_KEY = 'ddr_key_coupons';

  processCoupons(couponsData: ICouponData[]): Coupon[] {
    return couponsData
      .map((couponData) => new Coupon({ ...couponData, active: couponData.active ?? false }))
      .filter((coupon) => coupon.isValid());
  }

  async saveCoupons(coupons: Coupon[]): Promise<void> {
    const couponsData = coupons.map((coupon) => coupon.toCouponData());

    await Preferences.set({
      key: this.DDR_KEY,
      value: JSON.stringify(couponsData),
    });
  }

  async recoverCoupons(): Promise<ICouponData[] | null> {
    try {
      const { value } = await Preferences.get({ key: this.DDR_KEY });

      if (!value) {
        return null;
      }

      const couponsData = JSON.parse(value) as unknown;

      if (!Array.isArray(couponsData)) {
        return null;
      }

      return couponsData as ICouponData[];
    } catch {
      return null;
    }
  }

  async getCoupons(): Promise<Coupon[]> {
    try {
      const recoveredCoupons = await this.recoverCoupons();

      if (recoveredCoupons) {
        return this.processCoupons(recoveredCoupons);
      }

      const response = await fetch('./assets/data/coupons.json');

      if (!response.ok) {
        return [];
      }

      const couponsData = (await response.json()) as ICouponData[];
      const coupons = this.processCoupons(couponsData);

      await this.saveCoupons(coupons);

      return coupons;
    } catch {
      return [];
    }
  }
}
