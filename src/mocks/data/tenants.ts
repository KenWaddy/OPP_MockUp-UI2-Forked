import { faker } from '@faker-js/faker';
import { Tenant } from './types.js';
import { subscriptions } from './subscriptions.js';

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
    
    tenants.push({
      id,
      name: isJapanese ? faker.helpers.arrayElement(japaneseCompanies) : faker.company.name(),
      description: faker.company.catchPhrase(),
      contact_person_first_name: isJapanese ? faker.helpers.arrayElement(japaneseFirstNames) : faker.person.firstName(),
      contact_person_last_name: isJapanese ? faker.helpers.arrayElement(japaneseLastNames) : faker.person.lastName(),
      contact_department: isJapanese ? faker.helpers.arrayElement(japaneseDepartments) : faker.commerce.department(),
      language,
      contact_person_email: faker.internet.email(),
      contact_phone_office: faker.phone.number(),
      contact_phone_mobile: faker.phone.number(),
      contact_company: isJapanese ? faker.helpers.arrayElement(japaneseCompanies) : faker.company.name(),
      contact_address1: faker.location.streetAddress(),
      contact_address2: faker.location.secondaryAddress(),
      contact_city: isJapanese ? faker.helpers.arrayElement(japaneseCities) : faker.location.city(),
      contact_state_prefecture: isJapanese ? faker.helpers.arrayElement(japanesePrefectures) : faker.location.state(),
      contact_country: isJapanese ? '日本' : faker.location.country(),
      contact_postal_code: faker.location.zipCode(),
      subscriptionId: subscription.id
    });
  }
  
  return tenants;
}

export const tenants = generateTenants(100);
