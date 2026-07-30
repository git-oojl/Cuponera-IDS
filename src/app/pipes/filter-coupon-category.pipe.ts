import { Pipe, PipeTransform } from '@angular/core';
import { Coupon } from '../models/coupon.model';

@Pipe({
  name: 'filterCouponCategory',
  standalone: true,
})
export class FilterCouponCategoryPipe implements PipeTransform {
  transform(coupons: Coupon[] | null | undefined, category: string): Coupon[] {
    if (!coupons) {
      return [];
    }

    return coupons.filter((coupon) => coupon.category === category);
  }
}
