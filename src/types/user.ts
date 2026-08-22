export interface User {
  id: string;
  username: string;
  globalName: string | null;
  avatar: string | null;
  discriminator: string;
  displayName: string;
  avatarUrl: string;
}
