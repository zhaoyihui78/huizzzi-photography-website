const ENCODED_PASSWORD = 'MTY0MjIw';

export function verifyPassword(input: string): boolean {
  try {
    return btoa(input) === ENCODED_PASSWORD;
  } catch {
    return false;
  }
}
export const START_DATE = new Date('2025-03-14');

export const privateSizes: Record<string, [number, number]> = {
  '01': [600, 800], '02': [600, 800], '03': [600, 800], '04': [800, 600],
  '05': [800, 533], '06': [800, 533], '07': [800, 533], '08': [800, 533],
  '09': [533, 800], '10': [800, 533], '11': [533, 800], '12': [800, 533],
  '13': [800, 533], '14': [800, 533], '15': [533, 800], '16': [533, 800],
  '17': [533, 800], '18': [533, 800], '19': [800, 533], '20': [800, 533],
  '21': [800, 533], '22': [800, 450], '23': [533, 800], '24': [533, 800],
  '25': [533, 800], '26': [600, 800], '27': [600, 800], '28': [600, 800],
  '29': [600, 800], '30': [800, 600], '31': [800, 600], '32': [600, 800],
  '33': [600, 800], '34': [533, 800], '35': [533, 800], '36': [533, 800],
  '37': [533, 800], '38': [533, 800], '39': [800, 533], '40': [800, 533],
  '41': [800, 533], '42': [800, 533], '43': [800, 533], '44': [800, 533],
  '45': [800, 533], '46': [800, 533], '47': [800, 533], '48': [800, 533],
  '49': [630, 800], '50': [533, 800], '51': [800, 533], '52': [800, 533],
  '53': [800, 533], '54': [800, 533], '55': [533, 800], '56': [800, 533],
  '57': [800, 533], '58': [533, 800], '59': [800, 533], '60': [533, 800],
  '61': [800, 533], '62': [800, 533], '63': [800, 533], '64': [533, 800],
  '65': [533, 800], '66': [533, 800], '67': [533, 800],
};

export const photos = Array.from({ length: 67 }, (_, i) => {
  const num = String(i + 1).padStart(2, '0');
  const [width, height] = privateSizes[num] || [800, 600];
  return {
    src: `/works/webp/private/photos/private${num}.webp`,
    thumb: `/works/webp/private/thumbs/private${num}.webp`,
    width,
    height,
    num,
  };
});

export interface MeetingData {
  nth: number;
  daysAgo: number;
  date: string;
  photoNums: string[];
  name?: string;
}

export const meetings: MeetingData[] = [
  { nth: 13, daysAgo: 16, date: '2026.04.30', name: '洛阳&郑州', photoNums: ['34','35','36','37','38','39','40','41','42','43','44','45','46','47','48','49'] },
  { nth: 12, daysAgo: 44, date: '2026.04.02', name: '成都', photoNums: [] },
  { nth: 11, daysAgo: 65, date: '2026.03.12', name: '一周年啦', photoNums: [] },
  { nth: 10, daysAgo: 113, date: '2026.01.23', name: '北京', photoNums: ['05','06','07','50','51','52','53','54','55','56','57','58','59','60','61','62','63','64','65','66','67'] },
  { nth: 9, daysAgo: 140, date: '2025.12.27', name: '跨年啦', photoNums: ['08','09','10','11','12','13','14','15','16','17','18'] },
  { nth: 8, daysAgo: 188, date: '2025.11.09', name: '南昌', photoNums: ['19','20','21','22','23','24','25'] },
  { nth: 7, daysAgo: 224, date: '2025.10.04', name: '徐州&连云港', photoNums: ['01','02','03','04','26'] },
  { nth: 6, daysAgo: 252, date: '2025.09.06', name: '二百天啦', photoNums: [] },
  { nth: 5, daysAgo: 315, date: '2025.07.05', name: '一百天啦', photoNums: [] },
  { nth: 4, daysAgo: 344, date: '2025.06.06', name: '武汉', photoNums: ['27'] },
  { nth: 3, daysAgo: 380, date: '2025.05.01', name: '马鞍山&南京', photoNums: ['28','29','30','31','32','33'] },
  { nth: 2, daysAgo: 405, date: '2025.04.06', name: '长沙', photoNums: [] },
  { nth: 1, daysAgo: 428, date: '2025.03.14', photoNums: [] },
];

export const cnNumerals = ['一','二','三','四','五','六','七','八','九','十','十一','十二','十三'];
