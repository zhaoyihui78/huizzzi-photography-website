import { getImageUrl } from '@/config/images';
import { projectToSvg, MAP_BOUNDS } from '@/utils/geo';

export { MAP_BOUNDS };

export interface Location {
  id: string;
  name: string;
  subtitle?: string;
  x: number;
  y: number;
  bestTime: string;
  transport: string;
  seriesSlug: string;
  photos: string[];
  cover: string;
  quote?: string;
  exif?: { camera?: string; lens?: string; aperture?: string; shutter?: string; iso?: string };
  /** 对应系列页中的具体作品锚点（如视频标题） */
  workAnchor?: string;
  /** 真实经纬度，用于映射到地图底图 */
  lat: number;
  lng: number;
}

export interface Route {
  id: string;
  label: string;
  date: string;
  locationIds: string[];
}

const rawLocations = [
  {
    id: 'gugong',
    name: '故宫',
    subtitle: '雪落紫禁城',
    lat: 39.9163,
    lng: 116.3972,
    bestTime: '冬 · 二月 · 雪后清晨',
    transport: '地铁1号线天安门东站B口',
    seriesSlug: 'seasons-of-beijing',
    photos: [
      getImageUrl('/works/videos/gugongchunxue/poster.jpg'),
      getImageUrl('/works/webp/photos/beijing03.webp'),
      getImageUrl('/works/webp/photos/beijing16.webp'),
      getImageUrl('/works/webp/photos/beijing19.webp'),
    ],
    cover: getImageUrl('/works/videos/gugongchunxue/poster.jpg'),
    quote: '春雪满空来，触处似花开。',
    exif: { camera: 'Nikon Zf', lens: 'TTArtisan 11mm f2.8', aperture: 'F2.8', shutter: '30s', iso: '100' },
    workAnchor: '故宫春雪',
  },
  {
    id: 'tiantan',
    name: '天坛',
    subtitle: '祈年纳福',
    lat: 39.8822,
    lng: 116.4066,
    bestTime: '冬 · 正月 · 晨光初露',
    transport: '地铁5号线天坛东门站A2口',
    seriesSlug: 'seasons-of-beijing',
    photos: [
      getImageUrl('/works/videos/xinniantiantan/poster.jpg'),
    ],
    cover: getImageUrl('/works/videos/xinniantiantan/poster.jpg'),
    quote: '愿得长如此，年年物候新。',
    workAnchor: '新年天坛',
  },
  {
    id: 'ditan',
    name: '地坛',
    subtitle: '绿荫覆地坛',
    lat: 39.9532,
    lng: 116.4172,
    bestTime: '夏 · 六月 · 午后阴凉',
    transport: '地铁2号线雍和宫站A口',
    seriesSlug: 'seasons-of-beijing',
    photos: [
      getImageUrl('/works/videos/ditandexia/poster.jpg'),
    ],
    cover: getImageUrl('/works/videos/ditandexia/poster.jpg'),
    quote: '但是太阳，它每时每刻都是夕阳也都是旭日。',
    workAnchor: '地坛的夏',
  },
  {
    id: 'yiheyuan',
    name: '颐和园',
    subtitle: '晚霞照颐和',
    lat: 39.9999,
    lng: 116.2755,
    bestTime: '夏 · 七月 · 日落前一小时',
    transport: '地铁4号线北宫门站D口',
    seriesSlug: 'seasons-of-beijing',
    photos: [
      getImageUrl('/works/videos/yiheyuandexia/poster.jpg'),
      getImageUrl('/works/webp/photos/beijing08.webp'),
    ],
    cover: getImageUrl('/works/videos/yiheyuandexia/poster.jpg'),
    quote: '天空被夕阳染成了赭红色，桃红色的云彩倒映在流水上。',
    exif: { camera: 'Nikon Z5', lens: 'NIKKOR Z 24-200MM F/4-6.3', aperture: 'F7.1', shutter: '0.2s', iso: '100' },
    workAnchor: '颐和园的晚霞',
  },
  {
    id: 'yuanmingyuan',
    name: '圆明园',
    subtitle: '金黄圆明园',
    lat: 40.0080,
    lng: 116.2980,
    bestTime: '秋 · 十一月 · 午后至黄昏',
    transport: '地铁4号线圆明园站B口',
    seriesSlug: 'seasons-of-beijing',
    photos: [
      getImageUrl('/works/videos/yuanmingyuande/poster.jpg'),
    ],
    cover: getImageUrl('/works/videos/yuanmingyuande/poster.jpg'),
    quote: '圆明园的秋，像莫奈的画布藏在了苹香榭的秋波中。',
    workAnchor: '圆明园的秋',
  },
  {
    id: 'beihai',
    name: '北海公园',
    subtitle: '落叶满北海',
    lat: 39.9244,
    lng: 116.3891,
    bestTime: '秋 · 十月 · 傍晚',
    transport: '地铁6号线北海北站B口',
    seriesSlug: 'seasons-of-beijing',
    photos: [
      getImageUrl('/works/videos/beihaiqiu/poster.jpg'),
      getImageUrl('/works/webp/photos/beijing01.webp'),
      getImageUrl('/works/webp/photos/beijing02.webp'),
    ],
    cover: getImageUrl('/works/videos/beihaiqiu/poster.jpg'),
    quote: '我看天空是大海，我看大海是宇宙。',
    exif: { camera: 'Nikon Zf', lens: 'NIKKOR Z 24-200MM F/4-6.3', aperture: 'F9', shutter: '0.2s', iso: '100' },
    workAnchor: '北海的秋',
  },
  {
    id: 'cbd',
    name: 'CBD',
    subtitle: '清晨 CBD',
    lat: 39.9078,
    lng: 116.4555,
    bestTime: '全年 · 清晨 6:00–7:30',
    transport: '地铁1号线/10号线国贸站',
    seriesSlug: 'beijing-cityscape',
    photos: [
      getImageUrl('/works/webp/photos/beijing13.webp'),
      getImageUrl('/works/webp/photos/beijing10.webp'),
      getImageUrl('/works/webp/photos/beijing12.webp'),
    ],
    cover: getImageUrl('/works/webp/thumbs/beijing13.webp'),
    exif: { camera: 'Nikon Z5', lens: 'NIKKOR Z 24-200MM F/4-6.3', aperture: 'F6.3', shutter: '1/200s', iso: '400' },
    workAnchor: '清晨CBD',
  },
  {
    id: 'yangxiehu',
    name: '雁栖湖',
    subtitle: '雁栖湖夜景',
    lat: 40.4000,
    lng: 116.6500,
    bestTime: '夏 · 蓝调时刻',
    transport: '市郊铁路怀柔线雁栖湖站',
    seriesSlug: 'beijing-cityscape',
    photos: [
      getImageUrl('/works/webp/photos/beijing07.webp'),
    ],
    cover: getImageUrl('/works/webp/thumbs/beijing07.webp'),
    exif: { camera: 'Nikon Z5', lens: 'NIKKOR Z 24-200MM F/4-6.3', aperture: 'F7.1', shutter: '0.5s', iso: '100' },
    workAnchor: '雁栖湖夜景',
  },
  {
    id: 'shougang',
    name: '首钢园',
    subtitle: '工业遗韵与星空',
    lat: 39.9050,
    lng: 116.1600,
    bestTime: '全年 · 夜间',
    transport: '地铁11号线新首钢站',
    seriesSlug: 'beijing-cityscape',
    photos: [
      getImageUrl('/works/webp/photos/beijing09.webp'),
    ],
    cover: getImageUrl('/works/webp/thumbs/beijing09.webp'),
    exif: { camera: 'Nikon Z5', lens: 'TTArtisan 11mm f2.8', aperture: 'F2.8', shutter: '30s', iso: '100' },
    workAnchor: '首钢园星轨',
  },
  {
    id: 'zhonggulou',
    name: '钟鼓楼',
    subtitle: '遥望古今',
    lat: 39.9400,
    lng: 116.3900,
    bestTime: '全年 · 黄昏',
    transport: '地铁8号线什刹海站A2口',
    seriesSlug: 'beijing-cityscape',
    photos: [
      getImageUrl('/works/webp/photos/beijing05.webp'),
    ],
    cover: getImageUrl('/works/webp/thumbs/beijing05.webp'),
    exif: { camera: 'Nikon Z5', lens: 'NIKKOR Z 24-200MM F/4-6.3', aperture: 'F8', shutter: '1s', iso: '200' },
    workAnchor: '遥望古今',
  },
  {
    id: 'mingchengqiang',
    name: '明城墙',
    subtitle: '古城晨曦',
    lat: 39.9000,
    lng: 116.4200,
    bestTime: '全年 · 日出前后',
    transport: '地铁2号线/5号线崇文门站F口',
    seriesSlug: 'beijing-cityscape',
    photos: [
      getImageUrl('/works/webp/photos/beijing06.webp'),
    ],
    cover: getImageUrl('/works/webp/thumbs/beijing06.webp'),
    exif: { camera: 'Nikon Z5', lens: 'NIKKOR Z 24-200MM F/4-6.3', aperture: 'F7.1', shutter: '1/200s', iso: '100' },
    workAnchor: '明城墙日出',
  },
  {
    id: 'dianshiteta',
    name: '中央电视塔',
    subtitle: '悬日金塔',
    lat: 39.9180,
    lng: 116.3000,
    bestTime: '春秋分前后 · 日落',
    transport: '地铁10号线西钓鱼台站C口',
    seriesSlug: 'beijing-cityscape',
    photos: [
      getImageUrl('/works/webp/photos/beijing10.webp'),
      getImageUrl('/works/webp/photos/beijing15.webp'),
    ],
    cover: getImageUrl('/works/webp/thumbs/beijing10.webp'),
    exif: { camera: 'Nikon Z5', lens: 'NIKKOR Z 24-200MM F/4-6.3', aperture: 'F11', shutter: '1/1000s', iso: '100' },
    workAnchor: '中央电视塔悬日',
  },
  {
    id: 'yangshanzhen',
    name: '央视总部',
    subtitle: '大裤衩悬日',
    lat: 39.9150,
    lng: 116.4600,
    bestTime: '春秋分前后 · 日落',
    transport: '地铁10号线金台夕照站D口',
    seriesSlug: 'beijing-cityscape',
    photos: [
      getImageUrl('/works/webp/photos/beijing22.webp'),
    ],
    cover: getImageUrl('/works/webp/thumbs/beijing22.webp'),
    exif: { camera: 'Nikon Z5', lens: 'NIKKOR Z 24-200MM F/4-6.3', aperture: 'F9', shutter: '1/8000s', iso: '100' },
    workAnchor: '央视总部大楼悬日',
  },
  {
    id: 'gongti',
    name: '工人体育场',
    subtitle: '绿茵狂想',
    lat: 39.9300,
    lng: 116.4400,
    bestTime: '比赛日 · 傍晚',
    transport: '地铁2号线/6号线朝阳门站',
    seriesSlug: 'beijing-cityscape',
    photos: [
      getImageUrl('/works/webp/photos/beijing21.webp'),
    ],
    cover: getImageUrl('/works/webp/thumbs/beijing21.webp'),
    exif: { camera: 'Nikon Z5', lens: 'TTArtisan 11mm f2.8', aperture: 'F2.8', shutter: '1/50s', iso: '100' },
    workAnchor: '新工体的首场大胜',
  },
];

export const beijingLocations: Location[] = rawLocations.map((loc) => {
  let { x, y } = projectToSvg(loc.lat, loc.lng);
  // Clamp so edge locations (e.g. Yanxihu) remain visible near the boundary
  x = Math.max(-30, Math.min(1030, x));
  y = Math.max(-30, Math.min(1030, y));
  return { ...loc, x, y };
});

export const routes: Route[] = [
  {
    id: 'winter-line',
    label: '冬雪线',
    date: '2024.02',
    locationIds: ['gugong', 'tiantan'],
  },
  {
    id: 'autumn-line',
    label: '秋日线',
    date: '2024.10–11',
    locationIds: ['yuanmingyuan', 'yiheyuan', 'beihai', 'gugong'],
  },
  {
    id: 'city-skyline',
    label: '天际线',
    date: '2024.03–09',
    locationIds: ['cbd', 'yangshanzhen', 'dianshiteta'],
  },
];
