import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const contentDirectory = path.join(process.cwd(), 'src/content/notes');

export interface NoteMetadata {
  title: string;
  subtitle?: string;
  excerpt: string;
  cover?: string;
  date: string;
  category: string;
  tags: string[];
  readingTime: string;
  slug: string;
  type?: 'article' | 'glossary' | 'behind-the-shot';
}

export function getNotes(): NoteMetadata[] {
  if (!fs.existsSync(contentDirectory)) return [];
  const fileNames = fs.readdirSync(contentDirectory);
  const allNotesData = fileNames
    .filter((fileName) => fileName.endsWith('.mdx'))
    .map((fileName) => {
      const slug = fileName.replace(/\.mdx$/, '');
      const fullPath = path.join(contentDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const matterResult = matter(fileContents);
      return {
        slug,
        ...(matterResult.data as Omit<NoteMetadata, 'slug'>),
      };
    });
  return allNotesData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getNoteBySlug(slug: string) {
  const fullPath = path.join(contentDirectory, `${slug}.mdx`);
  if (!fs.existsSync(fullPath)) return null;
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);
  return {
    metadata: { slug, ...(data as Omit<NoteMetadata, 'slug'>) },
    content,
  };
}
