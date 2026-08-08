import type { BuilderProfile, Member } from './types';

export const MAX_MEMBERS = 6;

// Delimiters used inside the compact "m" param: name:stack;stack|name:stack
const FIELD_SEP = ':';
const STACK_SEP = ';';
const MEMBER_SEP = '|';

/** Strip our delimiter characters out of free-typed text so encode/decode round-trips cleanly. */
function sanitizeToken(raw: string): string {
  return raw.replace(/[:;|]/g, ' ').trim();
}

/**
 * Builds the querystring the QR/link carries. Deliberately tiny: just names
 * and stack tags — no photos — so it fits comfortably in a QR and stays a
 * small, chunky (nicer-looking) matrix.
 */
export function encodeProfileToSearch(profile: BuilderProfile): string {
  const params = new URLSearchParams();
  params.set('t', sanitizeToken(profile.teamName));
  const m = profile.members
    .map((member) => {
      const name = sanitizeToken(member.name);
      const stack = member.stack.map(sanitizeToken).filter(Boolean).join(STACK_SEP);
      return `${name}${FIELD_SEP}${stack}`;
    })
    .join(MEMBER_SEP);
  params.set('m', m);
  return params.toString();
}

export function buildShareUrl(profile: BuilderProfile): string {
  const search = encodeProfileToSearch(profile);
  return `${window.location.origin}${window.location.pathname}?${search}`;
}

export function decodeProfileFromSearch(search: string): BuilderProfile | null {
  const params = new URLSearchParams(search);
  const t = params.get('t');
  const m = params.get('m');
  if (!t || !m) return null;

  const members: Member[] = m
    .split(MEMBER_SEP)
    .filter(Boolean)
    .map((chunk) => {
      const [name, stackStr = ''] = chunk.split(FIELD_SEP);
      return {
        name: name?.trim() || 'Builder',
        stack: stackStr.split(STACK_SEP).filter(Boolean),
        photo: null,
      };
    });

  if (members.length === 0) return null;
  return { teamName: t.trim() || 'Team', members };
}
