// Fun, deterministic "builder title" generator — pure client-side text
// mashup, no backend involved.

const STACK_TITLES: Record<string, string[]> = {
  react: ['Component Whisperer', 'Hooks Sorcerer', 'JSX Alchemist'],
  vue: ['Reactivity Ranger', 'Template Tamer'],
  angular: ['Dependency Injector-in-Chief', 'RxJS Ringmaster'],
  node: ['Backend Baker', 'Event-Loop Captain'],
  python: ['Snake Charmer', 'Notebook Nomad', 'Indentation Enforcer'],
  django: ['ORM Overlord'],
  java: ['Bytecode Bard'],
  kotlin: ['Null-Safety Ninja'],
  swift: ['Optional Unwrapper'],
  flutter: ['Widget Tree Gardener', 'Pixel-Perfect Piper'],
  android: ['APK Artisan'],
  ios: ['App Store Sherpa'],
  ai: ['Neural Alchemist', 'Prompt Whisperer'],
  ml: ['Neural Alchemist', 'Gradient Descent Guide'],
  llm: ['Prompt Whisperer', 'Token Tamer'],
  data: ['Dataframe Druid', 'Pipeline Plumber'],
  sql: ['Query Sculptor'],
  design: ['Pixel Perfectionist', 'Vibe Curator', 'Figma Fanatic'],
  ux: ['Vibe Curator', 'Empathy Engineer'],
  figma: ['Figma Fanatic'],
  go: ['Goroutine Wrangler'],
  rust: ['Borrow Checker Whisperer', 'Memory-Safety Monk'],
  blockchain: ['Ledger Legend', 'Smart-Contract Sorcerer'],
  web3: ['Smart-Contract Sorcerer'],
  solidity: ['Gas Fee Negotiator'],
  cloud: ['Uptime Guardian'],
  aws: ['Uptime Guardian'],
  devops: ['Pipeline Plumber', 'YAML Yogi'],
  docker: ['Container Captain'],
  three: ['Shader Shaman', 'Vertex Voyager'],
  unity: ['Shader Shaman'],
  game: ['Frame-Rate Fanatic'],
  security: ['Firewall Whisperer'],
  product: ['Roadmap Wrangler'],
  marketing: ['Growth Hacker Extraordinaire'],
};

const GENERIC_TITLES = [
  'Susegad Full-Stack Sailor',
  'Beach Shack Backend Baker',
  'Scooter-Speed Ship Captain',
  'Latitude Goa Debug Diver',
  'Feni-Fueled Code Wrangler',
  'Sunset Deploy Specialist',
  'Palm-Tree Pipeline Pilot',
  'Monsoon Merge Master',
  'Chief Vibe Officer',
  'Mandovi River Refactorer',
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function generateBuilderTitle(teamName: string, stack: string[]): string {
  const pool: string[] = [];
  for (const tech of stack) {
    const key = tech.toLowerCase().trim();
    for (const [k, titles] of Object.entries(STACK_TITLES)) {
      if (key.includes(k)) pool.push(...titles);
    }
  }
  if (pool.length === 0) pool.push(...GENERIC_TITLES);

  const seed = hashString(teamName + '|' + stack.join(','));
  return pool[seed % pool.length];
}
