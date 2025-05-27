import { faker } from '@faker-js/faker';
import { Tenant } from '../../commons/models.js';
import { subscriptions } from './subscriptions.js';

/**
 * Generate Japanese addresses
 */
const japaneseAddresses1 = [
  '東京都新宿区西新宿2-8-1', '大阪府大阪市北区梅田3-1-3', '神奈川県横浜市西区みなとみらい2-2-1',
  '愛知県名古屋市中村区名駅1-1-4', '北海道札幌市中央区北5条西2-5', '兵庫県神戸市中央区港島中町6-10-1',
  '京都府京都市下京区烏丸通七条下ル', '福岡県福岡市博多区博多駅前2-1-1', '埼玉県さいたま市大宮区桜木町1-7-5',
  '千葉県千葉市中央区新町1000'
];

const japaneseAddresses2 = [
  '2階', '3階', 'A棟', 'B棟', '東館', '西館', '南館', '北館', '1F', '地下1階'
];

const japaneseDescriptions = [
  '革新的なテクノロジーソリューションを提供', '最先端のIT サービスで企業をサポート',
  'デジタル変革を推進するパートナー', '高品質なソフトウェア開発会社',
  'クラウドサービスのリーディングカンパニー', 'AIとIoTで未来を創造',
  '持続可能な技術革新を追求', 'お客様の成功を第一に考える企業'
];

/**
 * Generate email based on name
 */
function generateEmailFromName(firstName: string, lastName: string, isJapanese: boolean): string {
  const domains = ['example.com', 'company.co.jp', 'corp.com', 'enterprise.jp', 'tech.com'];
  const domain = faker.helpers.arrayElement(domains);
  
  if (isJapanese) {
    const romanizedFirst = faker.helpers.arrayElement(['takeshi', 'hiroshi', 'yuki', 'akira', 'kenji']);
    const romanizedLast = faker.helpers.arrayElement(['tanaka', 'suzuki', 'watanabe', 'sato', 'yamamoto']);
    
    const format = faker.helpers.arrayElement([
      `${romanizedFirst}.${romanizedLast}`,
      `${romanizedFirst}-${romanizedLast[0]}`,
      `${romanizedFirst[0]}.${romanizedLast}`,
      `${romanizedLast}.${romanizedFirst}`
    ]);
    
    return `${format}@${domain}`;
  } else {
    const cleanFirst = firstName.toLowerCase().replace(/[^a-z]/g, '');
    const cleanLast = lastName.toLowerCase().replace(/[^a-z]/g, '');
    
    const format = faker.helpers.arrayElement([
      `${cleanFirst}.${cleanLast}`,
      `${cleanFirst}-${cleanLast[0]}`,
      `${cleanFirst[0]}.${cleanLast}`,
      `${cleanLast}.${cleanFirst}`
    ]);
    
    return `${format}@${domain}`;
  }
}

/**
 * Generate a list of tenant objects
 * @param count Number of tenants to generate
 * @returns Array of tenant objects
 */
export function generateTenants(count: number = 100): Tenant[] {
  const tenants: Tenant[] = [];
  
  const japaneseLastNames = ['佐藤', '鈴木', '高橋', '田中', '伊藤', '渡辺', '山本', '中村', '小林', '加藤', '吉田', '山田', '松本', '井上', '木村'];
  const japaneseFirstNames = ['翔太', '陽子', '健太', '美咲', '大輔', '愛', '拓也', '優子', '直樹', '真由美', '雅人', '恵子', '孝志', '麻衣', '博之'];
  const japaneseCompanies = ['株式会社横河電機', '三菱電機株式会社', '富士通株式会社', '日立製作所', 'ソニー株式会社', 'パナソニック株式会社', '東芝株式会社', 'キヤノン株式会社'];
  const japaneseDepartments = ['技術部', '営業部', '管理部', '開発部', '品質保証部', '製造部', '経理部', '人事部'];
  const japaneseCities = ['東京', '大阪', '横浜', '名古屋', '札幌', '神戸', '京都', '福岡', '川崎', '広島'];
  const japanesePrefectures = ['東京都', '大阪府', '神奈川県', '愛知県', '北海道', '兵庫県', '京都府', '福岡県', '埼玉県', '千葉県'];
  
  for (let i = 0; i < count; i++) {
    const id = `tenant-${i + 1}`;
    const language = faker.helpers.arrayElement(['日本語', 'English']);
    const subscription = faker.helpers.arrayElement(subscriptions);
    
    const isJapanese = language === '日本語';
    const firstName = isJapanese ? faker.helpers.arrayElement(japaneseFirstNames) : faker.person.firstName();
    const lastName = isJapanese ? faker.helpers.arrayElement(japaneseLastNames) : faker.person.lastName();
    
    tenants.push({
      id,
      name: isJapanese ? faker.helpers.arrayElement(japaneseCompanies) : faker.company.name(),
      description: isJapanese ? faker.helpers.arrayElement(japaneseDescriptions) : faker.company.catchPhrase(),
      contact_person_first_name: firstName,
      contact_person_last_name: lastName,
      contact_department: isJapanese ? faker.helpers.arrayElement(japaneseDepartments) : faker.commerce.department(),
      language,
      contact_person_email: generateEmailFromName(firstName, lastName, isJapanese),
      contact_phone_office: faker.phone.number(),
      contact_phone_mobile: faker.phone.number(),
      contact_company: isJapanese ? faker.helpers.arrayElement(japaneseCompanies) : faker.company.name(),
      contact_address1: isJapanese ? faker.helpers.arrayElement(japaneseAddresses1) : faker.location.streetAddress(),
      contact_address2: isJapanese ? faker.helpers.arrayElement(japaneseAddresses2) : faker.location.secondaryAddress(),
      contact_city: isJapanese ? faker.helpers.arrayElement(japaneseCities) : faker.location.city(),
      contact_state_prefecture: isJapanese ? faker.helpers.arrayElement(japanesePrefectures) : faker.location.state(),
      contact_country: isJapanese ? '日本' : faker.location.country(),
      contact_postal_code: faker.location.zipCode(),
      subscriptionId: subscription.id
    });
  }
  
  return tenants;
}

let mutableTenants = generateTenants(100);

export const getTenants = () => mutableTenants;
export const addTenant = (tenant: Tenant) => {
  mutableTenants.push(tenant);
};
export const updateTenant = (updatedTenant: Tenant) => {
  const index = mutableTenants.findIndex(t => t.id === updatedTenant.id);
  if (index !== -1) {
    mutableTenants[index] = updatedTenant;
  }
};
export const deleteTenant = (id: string) => {
  mutableTenants = mutableTenants.filter(t => t.id !== id);
};
export const getNextTenantId = () => `tenant-${mutableTenants.length + 1}`;

export const tenants = mutableTenants;
