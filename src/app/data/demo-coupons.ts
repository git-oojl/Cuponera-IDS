import { ICouponData } from '../models/coupon.model';

export const DEMO_COUPONS: ICouponData[] = [
  {
    idProduct: 101,
    img: 'assets/img/galletas.svg',
    name: 'Pan dulce',
    category: 'candies',
    discount: 25,
  },
  {
    idProduct: 102,
    img: 'assets/img/chocolate-leche.svg',
    name: 'Alfajores',
    category: 'candies',
    discount: 18,
  },
  {
    idProduct: 103,
    img: 'assets/img/te-verde.svg',
    name: 'Jugo natural',
    category: 'drinks',
    discount: 20,
  },
  {
    idProduct: 104,
    img: 'assets/img/cerveza-artesanal.svg',
    name: 'Limonada',
    category: 'drinks',
    discount: 15,
  },
  {
    idProduct: 105,
    img: 'assets/img/pollo.svg',
    name: 'Pavo fresco',
    category: 'meats',
    discount: 22,
  },
  {
    idProduct: 106,
    img: 'assets/img/carne.svg',
    name: 'Costillas',
    category: 'meats',
    discount: 19,
  },
];
