import React from 'react';
import {
  Stethoscope,
  Bed,
  AlertCircle,
  Pill,
  CreditCard,
  Settings,
  ListOrdered,
  FileText,
  FileSpreadsheet,
  Share2,
  Users,
  Clipboard,
  Activity,
  CheckSquare,
  ShieldAlert,
  Crosshair,
  Inbox,
  CheckCircle,
  Package,
  Database,
  DollarSign,
  BarChart2,
  UserCheck,
  Home,
  Shield,
  LayoutDashboard,
  MapPin,
  UserPlus,
  Calendar,
  Clock,
  Search,
  Contact,
  LucideProps,
} from 'lucide-react';

interface DynamicIconProps extends LucideProps {
  name?: string;
}

export default function DynamicIcon({ name, ...props }: DynamicIconProps) {
  if (!name) return <LayoutDashboard {...props} />;

  const key = name.toLowerCase().trim();

  switch (key) {
    case 'stethoscope':
      return <Stethoscope {...props} />;
    case 'bed':
      return <Bed {...props} />;
    case 'alert-circle':
      return <AlertCircle {...props} />;
    case 'pill':
    case 'prescription':
      return <Pill {...props} />;
    case 'credit-card':
      return <CreditCard {...props} />;
    case 'settings':
      return <Settings {...props} />;
    case 'list-ordered':
      return <ListOrdered {...props} />;
    case 'file-text':
      return <FileText {...props} />;
    case 'share-2':
      return <Share2 {...props} />;
    case 'users':
      return <Users {...props} />;
    case 'clipboard':
      return <Clipboard {...props} />;
    case 'activity':
      return <Activity {...props} />;
    case 'check-square':
      return <CheckSquare {...props} />;
    case 'shield-alert':
      return <ShieldAlert {...props} />;
    case 'crosshair':
      return <Crosshair {...props} />;
    case 'inbox':
      return <Inbox {...props} />;
    case 'check-circle':
      return <CheckCircle {...props} />;
    case 'package':
      return <Package {...props} />;
    case 'database':
      return <Database {...props} />;
    case 'dollar-sign':
      return <DollarSign {...props} />;
    case 'bar-chart-2':
      return <BarChart2 {...props} />;
    case 'user-check':
      return <UserCheck {...props} />;
    case 'home':
      return <Home {...props} />;
    case 'shield':
      return <Shield {...props} />;
    case 'map-pin':
      return <MapPin {...props} />;
    case 'user-plus':
      return <UserPlus {...props} />;
    case 'calendar':
      return <Calendar {...props} />;
    case 'clock':
      return <Clock {...props} />;
    case 'search':
      return <Search {...props} />;
    case 'contact':
    case 'id-card':
      return <Contact {...props} />;
    default:
      return <FileText {...props} />;
  }
}
