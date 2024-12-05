export interface Product {
  id: number;
  title: string;
  image: {
    id: string;
    product_id: string;
    src: string;
  };
  variants: Variant[];
  discount?: Discount | null; 
}

export interface Variant {
  id: number;
  title: string;
  price: number;
  product_id: number;
  discount?: Discount | null; 
}

export interface Discount {
  amount: string;
  type: 'percentage' | 'flat';
}
