import { faker } from '@faker-js/faker';
import { Subscription } from '../../commons/models.js';

const japaneseSubscriptionDescriptions = [
  'エンタープライズ向け総合管理プラットフォーム',
  '中小企業に最適な標準プラン',
  'スタートアップ企業向けベーシックプラン',
  '大企業向けプレミアムサービス',
  '高度なセキュリティと管理機能を提供',
  'クラウドベースの統合ソリューション'
];

/**
 * Generate a list of subscriptions
 * @param count Number of subscriptions to generate
 * @returns Array of subscription objects
 */
export function generateSubscriptions(count: number = 100): Subscription[] {
  const subscriptions: Subscription[] = [];
  
  for (let i = 0; i < count; i++) {
    const type = faker.helpers.arrayElement(['Evergreen', 'Termed']);
    const status = faker.helpers.arrayElement(['Active', 'Cancelled']);
    const startDate = faker.date.past({ years: 2 });
    const endDate = type === 'Termed' ? faker.date.future({ years: 1, refDate: startDate }) : null;
    const isJapanese = faker.datatype.boolean(0.4); // 40% chance of Japanese descriptions
    
    subscriptions.push({
      id: faker.string.uuid(),
      name: faker.helpers.arrayElement(['Enterprise Plan', 'Standard Plan', 'Basic Plan', 'Premium Plan']),
      description: isJapanese ? faker.helpers.arrayElement(japaneseSubscriptionDescriptions) : faker.lorem.sentence(),
      type,
      status,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate ? endDate.toISOString().split('T')[0] : '',
      enabled_app_DMS: faker.datatype.boolean(),
      enabled_app_eVMS: faker.datatype.boolean(),
      enabled_app_CVR: faker.datatype.boolean(),
      enabled_app_AIAMS: faker.datatype.boolean(),
      config_SSH_terminal: faker.datatype.boolean(),
      config_AIAPP_installer: faker.datatype.boolean(),
    });
  }
  
  return subscriptions;
}

let mutableSubscriptions = generateSubscriptions(100);

export const getSubscriptions = () => mutableSubscriptions;
export const addSubscription = (subscription: Subscription) => {
  mutableSubscriptions.push(subscription);
};
export const updateSubscription = (updatedSubscription: Subscription) => {
  const index = mutableSubscriptions.findIndex(s => s.id === updatedSubscription.id);
  if (index !== -1) {
    mutableSubscriptions[index] = updatedSubscription;
  }
};
export const deleteSubscription = (id: string) => {
  mutableSubscriptions = mutableSubscriptions.filter(s => s.id !== id);
};
export const getNextSubscriptionId = () => faker.string.uuid();

export const subscriptions = mutableSubscriptions;
