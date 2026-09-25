import {
  Home,
  Building2,
  TrendingUp,
  Users,
  Inbox,
  KanbanSquare,
  Radar,
  PenLine,
  Globe,
  CalendarClock,
  Mail,
  MessageSquareText,
  MessageCircle,
  Rss,
  ScanSearch,
  AppWindow,
  KeyRound,
  Link2,
  Megaphone,
  Store,
  LineChart,
  FlaskConical,
  Eye,
  Clapperboard,
  ShoppingBag,
  ReceiptText,
  Palette,
  Image as ImageIcon,
  Video,
  Music4,
  Presentation,
  Hexagon,
  Newspaper,
  Bot,
  Workflow,
  PhoneCall,
  Radio,
  LayoutTemplate,
  Server,
  Sparkles,
  CalendarDays,
  GraduationCap,
  Star,
  Code2,
  MessagesSquare,
  BarChart3,
  ShieldCheck,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavChild {
  label: string;
  href: string;
  icon: LucideIcon;
  desc: string;
  badge?: string;
  isNew?: boolean;
}

export interface NavGroup {
  label: string;
  icon: LucideIcon;
  children: NavChild[];
}

/**
 * Unified top-header navigation.
 * DEDUP RULE: if a feature already exists, href points at the existing route
 * (no duplicate pages). Only genuinely missing features get new routes.
 */
export const TOP_NAV: NavGroup[] = [
  {
    label: "Core",
    icon: Home,
    children: [
      { label: "Home", href: "/dashboard", icon: Home, desc: "Command center overview" },
      { label: "Business Profile", href: "/dashboard/business-profile", icon: Building2, desc: "Company, branches & brand voice", isNew: true },
      { label: "Trend Discovery", href: "/dashboard/trends", icon: TrendingUp, desc: "Live marine + tech trends" },
      { label: "Contacts & CRM", href: "/dashboard/crm", icon: Users, desc: "Leads, pipeline & qualification" },
      { label: "Inbox", href: "/dashboard/inbox", icon: Inbox, desc: "WhatsApp, email & DM in one place", isNew: true },
      { label: "Pipelines", href: "/dashboard/crm", icon: KanbanSquare, desc: "Visual sales pipeline", badge: "Improved" },
      { label: "Prospecting", href: "/dashboard/prospecting", icon: Radar, desc: "Find oil, marine & estate leads", isNew: true },
    ],
  },
  {
    label: "Marketing",
    icon: PenLine,
    children: [
      { label: "Content Writer", href: "/dashboard/content", icon: PenLine, desc: "AI content brain box" },
      { label: "SEO Engine", href: "/dashboard/marketing/seo", icon: Globe, desc: "Rank in Port Harcourt search", isNew: true },
      { label: "Social Planner", href: "/dashboard/social", icon: CalendarClock, desc: "Plan, schedule & auto-post" },
      { label: "Email Marketing", href: "/dashboard/marketing/email", icon: Mail, desc: "Campaigns, drips & templates", isNew: true },
      { label: "SMS Marketing", href: "/dashboard/marketing/sms", icon: MessageSquareText, desc: "Bulk SMS via Twilio", isNew: true },
      { label: "WhatsApp", href: "/dashboard/whatsapp", icon: MessageCircle, desc: "Broadcasts & auto-reply" },
      { label: "RSS Feed Manager", href: "/dashboard/marketing/rss", icon: Rss, desc: "Marine & security news feeds", isNew: true },
      { label: "Auto-Indexing", href: "/dashboard/marketing/indexing", icon: ScanSearch, desc: "Google indexing automation", isNew: true },
      { label: "Site Manager", href: "/dashboard/marketing/site", icon: AppWindow, desc: "Pages, menus & GMB posts", isNew: true },
      { label: "Keywords", href: "/dashboard/marketing/keywords", icon: KeyRound, desc: "Track PH keywords", isNew: true },
      { label: "Backlinks", href: "/dashboard/marketing/backlinks", icon: Link2, desc: "Monitor & build links", isNew: true },
    ],
  },
  {
    label: "Ads Manager",
    icon: Megaphone,
    children: [
      { label: "Ads Overview", href: "/dashboard/ads", icon: Megaphone, desc: "Meta, Google & TikTok ads", isNew: true },
      { label: "Ad Intelligence", href: "/dashboard/competitors", icon: Eye, desc: "Steal competitor angles", badge: "Improved" },
      { label: "UGC Ads", href: "/dashboard/creative/ugc", icon: Clapperboard, desc: "Testimonials & unboxings" },
    ],
  },
  {
    label: "Commerce",
    icon: Store,
    children: [
      { label: "Commerce Intelligence", href: "/dashboard/commerce/intelligence", icon: LineChart, desc: "Margins, demand & pricing", isNew: true },
      { label: "Product Research", href: "/dashboard/commerce/research", icon: FlaskConical, desc: "Winning marine & tech products", isNew: true },
      { label: "Ad Intelligence", href: "/dashboard/competitors", icon: Eye, desc: "Competitor ad library" },
      { label: "UGC Ads", href: "/dashboard/creative/ugc", icon: Clapperboard, desc: "Creative that converts" },
      { label: "Online Store", href: "/dashboard/commerce/store", icon: ShoppingBag, desc: "Catalog, cart & checkout", isNew: true },
      { label: "Invoices & Payments", href: "/dashboard/commerce/invoices", icon: ReceiptText, desc: "₦ invoices & receipts", isNew: true },
    ],
  },
  {
    label: "Creative",
    icon: Palette,
    children: [
      { label: "Design Studio", href: "/dashboard/creative", icon: Palette, desc: "Banners & creatives" },
      { label: "Image Studio", href: "/dashboard/creative/images", icon: ImageIcon, desc: "AI product imagery" },
      { label: "Video Editor", href: "/dashboard/creative/video", icon: Video, desc: "Scripts, cuts & captions" },
      { label: "Music Creator", href: "/dashboard/creative/music", icon: Music4, desc: "Jingls & background tracks", isNew: true },
      { label: "Presentations", href: "/dashboard/creative/presentations", icon: Presentation, desc: "Pitch decks for B2B", isNew: true },
      { label: "Logo Creator", href: "/dashboard/creative/logo", icon: Hexagon, desc: "Brand marks & variants", isNew: true },
      { label: "Article → Video", href: "/dashboard/creative/article-video", icon: Newspaper, desc: "Turn posts into reels", isNew: true },
    ],
  },
  {
    label: "Automation",
    icon: Bot,
    children: [
      { label: "Chatbots", href: "/dashboard/automation/chatbots", icon: Bot, desc: "WhatsApp & site assistants", isNew: true },
      { label: "Workflows", href: "/dashboard/campaigns/automation", icon: Workflow, desc: "Drip & follow-up flows", badge: "Improved" },
      { label: "Voice Calls", href: "/dashboard/voice/calls", icon: PhoneCall, desc: "AI voice agents & logs" },
      { label: "Broadcasting", href: "/dashboard/automation/broadcast", icon: Radio, desc: "WhatsApp, SMS & email blasts", isNew: true },
    ],
  },
  {
    label: "Build",
    icon: LayoutTemplate,
    children: [
      { label: "Websites & Funnels", href: "/dashboard/build/websites", icon: LayoutTemplate, desc: "Landing pages that sell", isNew: true },
      { label: "Hosting & Domains", href: "/dashboard/build/hosting", icon: Server, desc: "Vercel, DNS & SSL", isNew: true },
      { label: "Business Name Gen", href: "/dashboard/build/name-generator", icon: Sparkles, desc: "Nigerian-ready brand names", isNew: true },
      { label: "Calendars", href: "/dashboard/build/calendars", icon: CalendarDays, desc: "Bookings & site visits", isNew: true },
      { label: "Courses & Memberships", href: "/dashboard/build/courses", icon: GraduationCap, desc: "Training & access control", isNew: true },
      { label: "Reviews & Reputation", href: "/dashboard/reviews", icon: Star, desc: "Google & social reviews", badge: "Improved" },
      { label: "Code Builder", href: "/dashboard/build/code", icon: Code2, desc: "Snippets & embeds", isNew: true },
      { label: "Chat Hub", href: "/dashboard/build/chat-hub", icon: MessagesSquare, desc: "Live chat command deck", isNew: true },
    ],
  },
  {
    label: "System",
    icon: Settings,
    children: [
      { label: "Reports & Analytics", href: "/dashboard/analytics", icon: BarChart3, desc: "Reach, leads & revenue" },
      { label: "Team & Roles", href: "/dashboard/team", icon: ShieldCheck, desc: "Operators, roles & access", isNew: true },
      { label: "Settings", href: "/dashboard/settings", icon: Settings, desc: "Workspace preferences" },
    ],
  },
];

/** Flat list for search / mobile drawer */
export const ALL_NAV_LINKS: NavChild[] = TOP_NAV.flatMap((g) =>
  g.children.map((c) => ({ ...c }))
);
