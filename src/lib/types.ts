import type { Category, Condition, Gender, Status } from "./constants";

/** A product (pair of shoes) as stored in the database. */
export interface Product {
  id: string;
  name: string;
  brand: string;
  category: Category;
  gender: Gender;
  size: string;
  price: number; // whole PKR, e.g. 4500
  condition: Condition;
  description: string;
  images: string[]; // public URLs, first is the primary/cover image
  status: Status;
  created_at: string;
  updated_at: string;
}

/** Shape used when creating/editing a product from the admin form. */
export interface ProductInput {
  name: string;
  brand: string;
  category: Category;
  gender: Gender;
  size: string;
  price: number;
  condition: Condition;
  description: string;
  images: string[];
  status: Status;
}

/** Filters applied on the shop page (all optional). */
export interface ProductFilters {
  gender?: Gender;
  brand?: string;
  size?: string;
  category?: Category;
  condition?: Condition;
  minPrice?: number;
  maxPrice?: number;
  availability?: Status | "all";
  search?: string;
}
