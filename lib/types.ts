export type ViewMode = 'landing' | 'dashboard';

export interface AutomationRoutine {
  id: string;
  title: string;
  description: string;
  channel: 'whatsapp' | 'email' | 'meta' | 'crm' | 'sms';
  active: boolean;
  executionsToday: number;
  lastExecution: string;
  successRate: string;
}

export interface BusinessTenant {
  id: string;
  name: string;
  logoEmoji: string;
  industry: string;
  currency: string;
  currencySymbol: string;
  ownerName: string;
  ownerEmail: string;
  phone?: string;
  plan: 'Starter' | 'Professional' | 'Business' | 'Enterprise' | 'Growth';
  monthlyRevenue: number;
  revenueGrowth: number;
  totalLeads: number;
  leadsGrowth: number;
  conversionRate: number;
  conversionGrowth: number;
  avgOrderValue: number;
  activeCampaignsCount: number;
  newCustomersCount: number;
  productsSummary: string;
  automations: AutomationRoutine[];
  revenueHistory?: {
    label: string;
    current: number;
    previous: number;
  }[];
}

export interface BusinessRegistration extends Omit<BusinessTenant, 'id' | 'automations' | 'revenueHistory'> {
  phone?: string;
}

export interface MetricCardData {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  period: string;
  iconName: string;
  iconBgColor: string;
  sparklineData: number[];
}

export interface CampaignData {
  id: string;
  name: string;
  status: 'Published' | 'Draft' | 'Scheduled' | 'Ended';
  timeAgo: string;
  image: string;
  channels: ('instagram' | 'facebook' | 'tiktok' | 'twitter')[];
  reach: string;
  engagement: string;
  conversions: string;
  convChange?: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  subtitle: string;
  time?: string;
  badge: {
    label: string;
    variant: 'new' | 'success' | 'alert' | 'order';
  };
  iconType: 'lead' | 'performance' | 'competitor' | 'order' | 'user';
}

export interface PipelineStage {
  id: string;
  name: string;
  count: number;
  amount: string;
  color: string;
}
