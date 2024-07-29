export interface Credentials {
  id?: string;
  email?: string;
  is_admin?: boolean;
  is_public?: boolean;
  authentication_step?: string;
  lng?: number;
  lat?: number;
  full_name?: string;
}
