export interface Address {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string; // City code (e.g., "IST", "LA")
  state: string; // State code (e.g., "CA", "IST")
  postalCode: string;
  country: string; // Country code (e.g., "US", "TR")
}
