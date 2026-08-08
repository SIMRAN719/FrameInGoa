export interface Member {
  name: string;
  stack: string[];
  /** Local-only — data URLs are far too large for a URL/QR, so photos never travel in the share link. */
  photo: string | null;
}

export interface BuilderProfile {
  teamName: string;
  members: Member[];
}
