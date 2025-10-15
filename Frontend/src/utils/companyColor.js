// Deterministic color picker for company codes. Returns Tailwind classes for bg and text.
const palette = [
  { bg: 'bg-emerald-500', text: 'text-white' },
  { bg: 'bg-indigo-600', text: 'text-white' },
  { bg: 'bg-fuchsia-600', text: 'text-white' },
  { bg: 'bg-yellow-500', text: 'text-black' },
  { bg: 'bg-sky-500', text: 'text-white' },
  { bg: 'bg-rose-500', text: 'text-white' },
  { bg: 'bg-violet-600', text: 'text-white' },
  { bg: 'bg-amber-500', text: 'text-black' },
  { bg: 'bg-lime-600', text: 'text-white' },
  { bg: 'bg-cyan-600', text: 'text-white' },
];

export function pick(code) {
  const s = String(code || '').trim().toLowerCase();
  if (!s) return { bg: 'bg-gray-200', text: 'text-gray-800' };
  // simple hash
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  const idx = h % palette.length;
  return palette[idx];
}
