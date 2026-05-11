import { notFound } from 'next/navigation';
import { seriesList } from '@/data/series';
import SeriesDetail from './SeriesDetail';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return seriesList.map((series) => ({
    slug: series.slug,
  }));
}

export default async function SeriesDetailPage({ params }: Props) {
  const { slug } = await params;
  const series = seriesList.find((s) => s.slug === slug);
  if (!series) return notFound();

  return <SeriesDetail series={series} />;
}
