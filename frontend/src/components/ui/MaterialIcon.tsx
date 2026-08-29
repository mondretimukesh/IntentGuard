import React from 'react';
import {
  Shield,
  ShieldCheck,
  Plus,
  User,
  Download,
  Upload,
  X,
  RefreshCw,
  Code,
  Copy,
  Check,
  Timer,
  Cpu,
  Terminal,
  Smartphone,
  ArrowRight,
  ArrowLeft,
  Trash2,
  ChevronRight,
  Scan,
  Webhook,
  AlertTriangle,
  AlertOctagon,
  CheckCircle,
  FileText,
  Activity,
  Lock,
  Sliders,
  Radar,
  Sparkles,
  FlaskConical,
  History,
  Search,
  Accessibility,
  Layers,
  MessageSquare,
  BellRing,
  RotateCcw,
  Server,
  Key,
  Landmark,
  Gavel,
  UserX,
  Ban,
  Info,
  LayoutDashboard,
  Settings as SettingsIcon,
  HelpCircle,
  type LucideIcon,
} from 'lucide-react';

interface MaterialIconProps {
  name: string;
  className?: string;
  filled?: boolean;
  style?: React.CSSProperties;
}

const ICON_MAP: Record<string, LucideIcon> = {
  // Navigation & Core UI
  shield: Shield,
  shield_lock: ShieldCheck,
  add: Plus,
  account_circle: User,
  download: Download,
  upload: Upload,
  upload_file: Upload,
  close: X,
  sync: RefreshCw,
  code: Code,
  content_copy: Copy,
  check: Check,
  timer: Timer,
  memory: Cpu,
  terminal: Terminal,
  android: Smartphone,
  arrow_forward: ArrowRight,
  arrow_back: ArrowLeft,
  delete: Trash2,
  chevron_right: ChevronRight,
  document_scanner: Scan,
  search_check: Scan,
  dashboard: LayoutDashboard,
  settings: SettingsIcon,
  api: Webhook,
  warning: AlertTriangle,
  check_circle: CheckCircle,
  summarize: FileText,
  network_check: Activity,
  lock: Lock,
  tune: Sliders,
  radar: Radar,
  cleaning_services: Sparkles,
  science: FlaskConical,
  history: History,
  find_in_page: Search,

  // Threat, Evidence & Permissions icons
  accessibility_new: Accessibility,
  layers: Layers,
  sms: MessageSquare,
  chat: MessageSquare,
  notifications_active: BellRing,
  restart_alt: RotateCcw,
  dns: Server,
  key: Key,
  account_balance: Landmark,
  gavel: Gavel,
  person_alert: UserX,
  block: Ban,
  monitor_heart: Activity,
  verified_user: ShieldCheck,
  dangerous: AlertOctagon,
  info: Info,
};

export function MaterialIcon({ name, className = '', filled = false, style }: MaterialIconProps) {
  const IconComponent = ICON_MAP[name] || HelpCircle;

  return (
    <IconComponent
      size="1em"
      className={`inline-block align-middle ${className}`}
      style={style}
      fill={filled ? 'currentColor' : 'none'}
    />
  );
}
