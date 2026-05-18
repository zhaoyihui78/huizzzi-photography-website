export type WeLetterParty = 'hui' | 'dudu';

export interface WeLetter {
  id: string;
  from: WeLetterParty;
  to: WeLetterParty;
  title: string;
  content: string;
  createdAt: string;
  readAt: string | null;
  replyToId?: string;
  deliverAt?: string;
  attachment?: {
    type: 'photo';
    url: string;
  };
  paperStyle?: 'default' | 'handwritten';
}

export function isValidParty(val: unknown): val is WeLetterParty {
  return val === 'hui' || val === 'dudu';
}

const DEFAULT_GIST_FILENAME = 'letters.json';
let mockLetters: WeLetter[] = [
  {
    id: 'mock-1',
    from: 'hui',
    to: 'dudu',
    title: '写在开始之前',
    content: '今天把这个信箱做好了，希望能在这里给你留下一些平时来不及说的话。',
    createdAt: new Date().toISOString(),
    readAt: null,
  },
  {
    id: 'mock-2',
    from: 'dudu',
    to: 'hui',
    title: '回信：关于我们的信箱',
    content: '看到了，界面很干净，以后我们就在这里慢慢写信吧。',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    readAt: new Date().toISOString(),
    replyToId: 'mock-1',
  },
];

function getLettersToken() {
  return (
    process.env.WE_LETTERS_GITHUB_TOKEN?.trim() ||
    process.env.GITHUB_TOKEN?.trim() ||
    ''
  );
}

function getLettersGistId() {
  return process.env.WE_LETTERS_GIST_ID?.trim() || '';
}

function getLettersGistFilename() {
  return process.env.WE_LETTERS_GIST_FILENAME?.trim() || DEFAULT_GIST_FILENAME;
}

export function isWeLettersPreviewMode() {
  return process.env.NODE_ENV !== 'production' && !isWeLettersConfigured();
}

function createHeaders() {
  const token = getLettersToken();
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
  };
}

function normalizeLetter(value: unknown): WeLetter | null {
  if (!value || typeof value !== 'object') return null;

  const raw = value as Partial<WeLetter>;
  if (
    (raw.from !== 'hui' && raw.from !== 'dudu') ||
    (raw.to !== 'hui' && raw.to !== 'dudu') ||
    typeof raw.id !== 'string' ||
    typeof raw.title !== 'string' ||
    typeof raw.content !== 'string' ||
    typeof raw.createdAt !== 'string'
  ) {
    return null;
  }

  return {
    id: raw.id,
    from: raw.from,
    to: raw.to,
    title: raw.title,
    content: raw.content,
    createdAt: raw.createdAt,
    readAt: typeof raw.readAt === 'string' ? raw.readAt : null,
    replyToId: typeof raw.replyToId === 'string' ? raw.replyToId : undefined,
    deliverAt: typeof raw.deliverAt === 'string' ? raw.deliverAt : undefined,
    attachment: raw.attachment && raw.attachment.type === 'photo' && typeof raw.attachment.url === 'string' 
      ? { type: raw.attachment.type, url: raw.attachment.url } 
      : undefined,
    paperStyle: raw.paperStyle === 'handwritten' ? 'handwritten' : 'default',
  };
}

function parseLetters(content: string | undefined) {
  if (!content) return [] as WeLetter[];

  try {
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => normalizeLetter(item))
      .filter((item): item is WeLetter => Boolean(item));
  } catch {
    return [];
  }
}

function sortLetters(letters: WeLetter[]) {
  return [...letters].sort((a, b) => {
    if (a.createdAt === b.createdAt) return a.id < b.id ? 1 : -1;
    return a.createdAt < b.createdAt ? 1 : -1;
  });
}

async function fetchLettersFromGist() {
  if (isWeLettersPreviewMode()) {
    return mockLetters;
  }

  if (!isWeLettersConfigured()) {
    throw new Error('WE letters storage is not configured.');
  }

  const response = await fetch(`https://api.github.com/gists/${getLettersGistId()}`, {
    headers: createHeaders(),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to load letters gist: ${response.status}`);
  }

  const data = await response.json();
  const fileName = getLettersGistFilename();
  const content = data.files?.[fileName]?.content as string | undefined;
  return parseLetters(content);
}

async function saveLettersToGist(letters: WeLetter[]) {
  if (isWeLettersPreviewMode()) {
    mockLetters = sortLetters(letters);
    return;
  }

  if (!isWeLettersConfigured()) {
    throw new Error('WE letters storage is not configured.');
  }

  const fileName = getLettersGistFilename();
  const response = await fetch(`https://api.github.com/gists/${getLettersGistId()}`, {
    method: 'PATCH',
    headers: createHeaders(),
    body: JSON.stringify({
      files: {
        [fileName]: {
          content: JSON.stringify(letters, null, 2),
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to save letters gist: ${response.status}`);
  }
}

export function isWeLettersConfigured() {
  return Boolean(getLettersToken() && getLettersGistId());
}

export async function listWeLetters() {
  const letters = await fetchLettersFromGist();
  return sortLetters(letters);
}

export function getWeLetterUnreadCounts(letters: WeLetter[]) {
  return {
    hui: letters.filter((letter) => letter.to === 'hui' && !letter.readAt).length,
    dudu: letters.filter((letter) => letter.to === 'dudu' && !letter.readAt).length,
  };
}

export async function createWeLetter(input: {
  from: WeLetterParty;
  to: WeLetterParty;
  title: string;
  content: string;
  replyToId?: string;
  deliverAt?: string;
  attachment?: { type: 'photo'; url: string };
  paperStyle?: 'default' | 'handwritten';
}) {
  const letters = await fetchLettersFromGist();
  const letter: WeLetter = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    from: input.from,
    to: input.to,
    title: input.title,
    content: input.content,
    createdAt: new Date().toISOString(),
    readAt: null,
    replyToId: input.replyToId,
    deliverAt: input.deliverAt,
    attachment: input.attachment,
    paperStyle: input.paperStyle,
  } as WeLetter;

  letters.push(letter);
  await saveLettersToGist(letters);
  return letter;
}

export async function markWeLetterRead(id: string, viewer: WeLetterParty) {
  const letters = await fetchLettersFromGist();
  const target = letters.find((letter) => letter.id === id);
  if (!target) return null;

  if (target.to === viewer && !target.readAt) {
    target.readAt = new Date().toISOString();
    await saveLettersToGist(letters);
  }

  return target;
}
