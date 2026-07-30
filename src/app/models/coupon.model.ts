export interface ICouponData {
  idProduct: number;
  img: string;
  name: string;
  category: string;
  discount: number;
  active?: boolean;
}

export class Coupon {
  private _idProduct: number;
  private _img: string;
  private _name: string;
  private _category: string;
  private _discount: number;
  private _active: boolean;

  constructor(data: ICouponData) {
    this._idProduct = data.idProduct;
    this._img = data.img;
    this._name = data.name;
    this._category = data.category;
    this._discount = data.discount;
    this._active = data.active ?? false;
  }

  get idProduct(): number {
    return this._idProduct;
  }

  set idProduct(value: number) {
    this._idProduct = value;
  }

  get img(): string {
    return this._img;
  }

  set img(value: string) {
    this._img = value;
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  get category(): string {
    return this._category;
  }

  set category(value: string) {
    this._category = value;
  }

  get discount(): number {
    return this._discount;
  }

  set discount(value: number) {
    this._discount = value;
  }

  get active(): boolean {
    return this._active;
  }

  set active(value: boolean) {
    this._active = value;
  }

  isEqual(coupon: Coupon): boolean {
    return this.idProduct === coupon.idProduct;
  }

  isValid(): boolean {
    return (
      Number.isFinite(this.idProduct) &&
      this.idProduct > 0 &&
      this.hasText(this.name) &&
      this.hasText(this.category) &&
      this.hasText(this.img) &&
      Number.isFinite(this.discount) &&
      this.discount > 0
    );
  }

  toCouponData(): ICouponData {
    return {
      idProduct: this.idProduct,
      img: this.img,
      name: this.name,
      category: this.category,
      discount: this.discount,
      active: this.active,
    };
  }

  private hasText(value: string): boolean {
    return typeof value === 'string' && value.trim().length > 0;
  }
}
