export interface Photo {
  src: string;
  thumb: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface Series {
  slug: string;
  title: string;
  category: string;
  description: string;
  year: string;
  cover: string;
  photos: Photo[];
  layout: 'grid' | 'masonry' | 'split' | 'film' | 'polaroid';
  videos?: { src: string; poster: string; title: string }[];
}

const beijingPhotos: Photo[] = Array.from({ length: 22 }, (_, i) => {
  const num = String(i + 1).padStart(2, '0');
  const sizes: Record<string, [number, number]> = {
    '01': [800, 533], '02': [800, 269], '03': [800, 533], '04': [537, 800],
    '05': [800, 534], '06': [800, 450], '07': [799, 450], '08': [800, 450],
    '09': [800, 450], '10': [800, 450], '11': [800, 450], '12': [799, 534],
    '13': [800, 450], '14': [533, 800], '15': [800, 534], '16': [800, 449],
    '17': [534, 800], '18': [800, 534], '19': [800, 534], '20': [800, 450],
    '21': [800, 534], '22': [571, 800],
  };
  const [width, height] = sizes[num] || [800, 600];
  return {
    src: `/works/photos/beijing${num}.jpg`,
    thumb: `/works/thumbs/beijing${num}.jpg`,
    alt: `Beijing Cityscape ${i + 1}`,
    width,
    height,
  };
});

const naturePhotos: Photo[] = Array.from({ length: 7 }, (_, i) => {
  const num = String(i + 1).padStart(2, '0');
  const sizes: Record<string, [number, number]> = {
    '01': [534, 800], '02': [800, 450], '03': [800, 534], '04': [800, 533],
    '05': [800, 450], '06': [800, 342], '07': [800, 342],
  };
  const [width, height] = sizes[num] || [800, 600];
  return {
    src: `/works/photos/nature${num}.jpg`,
    thumb: `/works/thumbs/nature${num}.jpg`,
    alt: `Nature & Landscape ${i + 1}`,
    width,
    height,
  };
});

const architecturePhotos: Photo[] = Array.from({ length: 2 }, (_, i) => {
  const num = String(i + 1).padStart(2, '0');
  const sizes: Record<string, [number, number]> = {
    '01': [600, 800], '02': [800, 450],
  };
  const [width, height] = sizes[num] || [800, 600];
  return {
    src: `/works/photos/architecture${num}.jpg`,
    thumb: `/works/thumbs/architecture${num}.jpg`,
    alt: `Architecture ${i + 1}`,
    width,
    height,
  };
});

export const seriesList: Series[] = [
  {
    slug: 'beijing-cityscape',
    title: 'Beijing Cityscape',
    category: 'City',
    description:
      '北京是一座古老与现代交织的城市。从CBD的摩天大楼到胡同里的烟火气，从日出时分的金色天际线到夜幕下的万家灯火，我用镜头记录下这座城市最动人的时刻。',
    year: '2023-2025',
    cover: beijingPhotos[0].thumb,
    layout: 'grid',
    photos: beijingPhotos,
  },
  {
    slug: 'nature-and-landscape',
    title: 'Nature & Landscape',
    category: 'Nature',
    description:
      '大自然是最伟大的艺术家。从雪山的日照金山到草原的璀璨星河，从古建筑上的星轨到广袤大地的壮丽风光，我追寻着天地间的宁静与壮美。',
    year: '2023-2025',
    cover: naturePhotos[0].thumb,
    layout: 'masonry',
    photos: naturePhotos,
  },
  {
    slug: 'architecture',
    title: 'Architecture',
    category: 'Architecture',
    description:
      '建筑是凝固的音乐，是时间的容器。每一根线条、每一个角度都承载着设计师的思考与城市的记忆。',
    year: '2024-2025',
    cover: architecturePhotos[0].thumb,
    layout: 'grid',
    photos: architecturePhotos,
  },
  {
    slug: 'seasons-of-beijing',
    title: 'Seasons of Beijing',
    category: 'Film',
    description:
      '北京四季分明，每个季节都有独特的韵味。春雪覆盖的故宫、秋意浓浓的北海公园、夕阳下的颐和园、金黄的圆明园……这些影像记录了时间在这座古都身上留下的痕迹。',
    year: '2024-2025',
    cover: '/works/videos/gugongchunxue/poster.jpg',
    layout: 'split',
    photos: [
      { src: '/works/photos/beijing03.jpg', thumb: '/works/thumbs/beijing03.jpg', alt: '故宫星轨', width: 800, height: 533 },
      { src: '/works/photos/beijing01.jpg', thumb: '/works/thumbs/beijing01.jpg', alt: '北海公园晚霞', width: 800, height: 533 },
      { src: '/works/photos/beijing02.jpg', thumb: '/works/thumbs/beijing02.jpg', alt: '北海公园全景', width: 800, height: 269 },
      { src: '/works/photos/beijing04.jpg', thumb: '/works/thumbs/beijing04.jpg', alt: '蜿蜒的巨龙', width: 537, height: 800 },
    ],
    videos: [
      { src: '/works/videos/gugongchunxue/故宫春雪.mp4', poster: '/works/videos/gugongchunxue/poster.jpg', title: '故宫春雪' },
      { src: '/works/videos/beihaiqiu/北海公园的秋.mp4', poster: '/works/videos/beihaiqiu/poster.jpg', title: '北海的秋' },
      { src: '/works/videos/yiheyuandexia/颐和园的晚霞.mp4', poster: '/works/videos/yiheyuandexia/poster.jpg', title: '颐和园的晚霞' },
      { src: '/works/videos/yuanmingyuande/圆明园.mp4', poster: '/works/videos/yuanmingyuande/poster.jpg', title: '圆明园的秋' },
      { src: '/works/videos/xinniantiantan/祈年纳福.mp4', poster: '/works/videos/xinniantiantan/poster.jpg', title: '新年天坛' },
    ],
  },
];

// 获取去重后的精选照片（用于首页）
export function getSelectedPhotos(count: number = 15): Photo[] {
  const all = seriesList.flatMap((s) => s.photos);
  // 按 src 去重
  const seen = new Set<string>();
  const unique = all.filter((p) => {
    if (seen.has(p.src)) return false;
    seen.add(p.src);
    return true;
  });
  return unique.slice(0, count);
}
