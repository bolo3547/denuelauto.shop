export interface Buyer {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  budget?: number | null;
  currency: string;
  preferredMakes?: string[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
