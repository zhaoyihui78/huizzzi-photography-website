import { getVideoUrl } from '@/config/media';
import { getImageUrl } from '@/config/images';

export interface Exif {
  camera?: string;
  lens?: string;
  aperture?: string;
  shutter?: string;
  iso?: string;
}

export interface Photo {
  src: string;
  thumb: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
  exif?: Exif;
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
  videos?: { src: string; poster: string; title: string; season?: string; month?: string; subtitle?: string; quote?: string }[];
}

export const beijingPhotos: Photo[] = Array.from({ length: 22 }, (_, i) => {
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
    src: getImageUrl(`/works/photos/beijing${num}.jpg`),
    thumb: getImageUrl(`/works/thumbs/beijing${num}.jpg`),
    alt: `Beijing Cityscape ${i + 1}`,
    width,
    height,
    exif: {
      camera: 'Sony A7R IV',
      lens: '24-70mm f/2.8 GM',
      aperture: 'f/8',
      shutter: '1/125s',
      iso: 'ISO 100',
    },
  };
});

export const naturePhotos: Photo[] = Array.from({ length: 7 }, (_, i) => {
  const num = String(i + 1).padStart(2, '0');
  const sizes: Record<string, [number, number]> = {
    '01': [534, 800], '02': [800, 450], '03': [800, 534], '04': [800, 533],
    '05': [800, 450], '06': [800, 342], '07': [800, 342],
  };
  const [width, height] = sizes[num] || [800, 600];
  return {
    src: getImageUrl(`/works/photos/nature${num}.jpg`),
    thumb: getImageUrl(`/works/thumbs/nature${num}.jpg`),
    alt: `Nature & Landscape ${i + 1}`,
    width,
    height,
    exif: {
      camera: i < 3 ? 'Sony A7R IV' : 'Canon EOS R5',
      lens: i < 3 ? '16-35mm f/2.8 GM' : '70-200mm f/2.8',
      aperture: i < 3 ? 'f/11' : 'f/2.8',
      shutter: i < 3 ? '1/60s' : '15s',
      iso: i < 3 ? 'ISO 100' : 'ISO 3200',
    },
  };
});

export const architecturePhotos: Photo[] = Array.from({ length: 2 }, (_, i) => {
  const num = String(i + 1).padStart(2, '0');
  const sizes: Record<string, [number, number]> = {
    '01': [600, 800], '02': [800, 450],
  };
  const [width, height] = sizes[num] || [800, 600];
  return {
    src: getImageUrl(`/works/photos/architecture${num}.jpg`),
    thumb: getImageUrl(`/works/thumbs/architecture${num}.jpg`),
    alt: `Architecture ${i + 1}`,
    width,
    height,
    exif: {
      camera: 'Sony A7R IV',
      lens: '24-70mm f/2.8 GM',
      aperture: 'f/5.6',
      shutter: '1/200s',
      iso: 'ISO 200',
    },
  };
});

export const filmLifePhotos: Photo[] = Array.from({ length: 30 }, (_, i) => {
  const num = String(i + 1).padStart(2, '0');
  return {
    src: getImageUrl(`/works/photos/film/film${num}.jpg`),
    thumb: getImageUrl(`/works/photos/film/film${num}.jpg`),
    alt: `Film Life ${i + 1}`,
    width: 3578,
    height: 2397,
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
    layout: 'split',
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
    layout: 'split',
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
    layout: 'split',
    photos: architecturePhotos,
  },
  {
    slug: 'seasons-of-beijing',
    title: 'Seasons of Beijing',
    category: 'Film',
    description:
      '北京四季分明，每个季节都有独特的韵味。春雪覆盖的故宫、秋意浓浓的北海公园、夕阳下的颐和园、金黄的圆明园……这些影像记录了时间在这座古都身上留下的痕迹。',
    year: '2024-2025',
    cover: getImageUrl('/works/videos/gugongchunxue/poster.jpg'),
    layout: 'split',
    photos: [],
    videos: [
      // 按月份排序：正月 → 二月 → 六月 → 七月 → 十月 → 十一月
      { src: getVideoUrl('新年天坛', '/works/videos/xinniantiantan/祈年纳福.mp4'), poster: getImageUrl('/works/videos/xinniantiantan/poster.jpg'), title: '新年天坛', season: '冬', month: '正月', subtitle: '祈年纳福', quote: '愿得长如此，年年物候新。——卢照邻《元日述怀》' },
      { src: getVideoUrl('故宫春雪', '/works/videos/gugongchunxue/故宫春雪.mp4'), poster: getImageUrl('/works/videos/gugongchunxue/poster.jpg'), title: '故宫春雪', season: '冬', month: '二月', subtitle: '雪落紫禁城', quote: '春雪满空来，触处似花开。' },
      { src: getVideoUrl('地坛的夏', '/works/videos/ditandexia/地坛的夏.mp4'), poster: getImageUrl('/works/videos/ditandexia/poster.jpg'), title: '地坛的夏', season: '夏', month: '六月', subtitle: '绿荫覆地坛', quote: '但是太阳，它每时每刻都是夕阳也都是旭日。当它熄灭着走下山去收尽苍凉残照之际，正是它在另一面燃烧着爬上山巅布散烈烈朝辉之时。有一天，我也将沉静着走下山去，扶着我的拐杖。那一天，在某一处山洼里，势必会跑上来一个欢蹦的孩子，抱着他的玩具。当然，那不是我。但是，那不是我吗？宇宙以其不息的欲望将一个歌舞炼为永恒。这欲望有怎样一个人间的姓名，大可忽略不计。——史铁生《我与地坛》' },
      { src: getVideoUrl('颐和园的晚霞', '/works/videos/yiheyuandexia/颐和园的晚霞.mp4'), poster: getImageUrl('/works/videos/yiheyuandexia/poster.jpg'), title: '颐和园的晚霞', season: '夏', month: '七月', subtitle: '晚霞照颐和', quote: '天空被夕阳染成了赭红色，桃红色的云彩倒映在流水上，整个江面变成了紫色，天边仿佛燃起大火。' },
      { src: getVideoUrl('北海的秋', '/works/videos/beihaiqiu/北海公园的秋.mp4'), poster: getImageUrl('/works/videos/beihaiqiu/poster.jpg'), title: '北海的秋', season: '秋', month: '十月', subtitle: '落叶满北海', quote: '我有时看山不是山，看太阳不是太阳。我看天空是大海，我看大海是宇宙。我的脑中可以飞出蝴蝶，再开出繁花。我掌管自己的草木枯荣，我包容万物的悲欢离合。——汪曾祺《人间草木》' },
      { src: getVideoUrl('圆明园的秋', '/works/videos/yuanmingyuande/圆明园的秋.mp4'), poster: getImageUrl('/works/videos/yuanmingyuande/poster.jpg'), title: '圆明园的秋', season: '秋', month: '十一月', subtitle: '金黄圆明园', quote: '圆明园的秋，像莫奈的画布藏在了苹香榭的秋波中，静谧而荡漾。' },
    ],
  },
  {
    slug: 'film-life',
    title: 'Film Photography',
    category: 'Life',
    description:
      '用胶片记录生活的片段。每一帧都是时间的切片，每一卷都是记忆的容器。这些照片没有宏大的叙事，只有日常里最真实的温度。',
    year: '2024-2025',
    cover: filmLifePhotos[0].thumb,
    layout: 'polaroid',
    photos: filmLifePhotos,
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
