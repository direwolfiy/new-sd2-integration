import {
  Search,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  Play,
  Pause,
  SkipForward,
  Upload,
  Download,
  Trash2,
  Edit3,
  Copy,
  MoreHorizontal,
  X,
  Check,
  AlertCircle,
  Info,
  Loader2,
  GripVertical,
  FolderOpen,
  FileText,
  Image,
  Video,
  Music,
  Layers,
  LayoutGrid,
  List,
  Filter,
  ExternalLink,
  RefreshCw,
  Maximize2,
  Minimize2,
  PanelLeftClose,
  PanelLeftOpen,
  User,
  LogOut,
  MessageSquare,
  HelpCircle,
  Package,
  Home,
} from "lucide-react";

const iconGroups = [
  {
    title: "全局导航",
    icons: [
      { Icon: Home, name: "Home", use: "项目列表/首页" },
      { Icon: Package, name: "Package", use: "资产管理" },
      { Icon: HelpCircle, name: "HelpCircle", use: "帮助中心" },
      { Icon: MessageSquare, name: "MessageSquare", use: "意见反馈" },
      { Icon: Settings, name: "Settings", use: "个人设置" },
      { Icon: User, name: "User", use: "用户头像" },
    ],
  },
  {
    title: "操作",
    icons: [
      { Icon: Plus, name: "Plus", use: "新建/添加" },
      { Icon: Edit3, name: "Edit3", use: "编辑" },
      { Icon: Trash2, name: "Trash2", use: "删除" },
      { Icon: Copy, name: "Copy", use: "复制" },
      { Icon: Download, name: "Download", use: "导出/下载" },
      { Icon: Upload, name: "Upload", use: "上传" },
      { Icon: RefreshCw, name: "RefreshCw", use: "刷新/重新生成" },
      { Icon: ExternalLink, name: "ExternalLink", use: "外部链接" },
    ],
  },
  {
    title: "导航/方向",
    icons: [
      { Icon: ChevronLeft, name: "ChevronLeft", use: "返回/上一级" },
      { Icon: ChevronRight, name: "ChevronRight", use: "进入/下一步" },
      { Icon: PanelLeftOpen, name: "PanelLeftOpen", use: "展开侧栏" },
      { Icon: PanelLeftClose, name: "PanelLeftClose", use: "收起侧栏" },
      { Icon: Maximize2, name: "Maximize2", use: "全屏" },
      { Icon: Minimize2, name: "Minimize2", use: "退出全屏" },
    ],
  },
  {
    title: "媒体/内容",
    icons: [
      { Icon: FileText, name: "FileText", use: "剧本/文档" },
      { Icon: Image, name: "Image", use: "图片/分镜图" },
      { Icon: Video, name: "Video", use: "视频" },
      { Icon: Music, name: "Music", use: "音效/BGM" },
      { Icon: Layers, name: "Layers", use: "分镜/图层" },
      { Icon: FolderOpen, name: "FolderOpen", use: "文件夹/项目" },
    ],
  },
  {
    title: "播放控制",
    icons: [
      { Icon: Play, name: "Play", use: "播放/生成" },
      { Icon: Pause, name: "Pause", use: "暂停" },
      { Icon: SkipForward, name: "SkipForward", use: "跳过/下一镜头" },
    ],
  },
  {
    title: "视图/筛选",
    icons: [
      { Icon: LayoutGrid, name: "LayoutGrid", use: "网格视图" },
      { Icon: List, name: "List", use: "列表视图" },
      { Icon: Filter, name: "Filter", use: "筛选" },
      { Icon: Search, name: "Search", use: "搜索" },
      { Icon: MoreHorizontal, name: "MoreHorizontal", use: "更多操作" },
    ],
  },
  {
    title: "状态/反馈",
    icons: [
      { Icon: Check, name: "Check", use: "完成/成功" },
      { Icon: X, name: "X", use: "关闭/取消" },
      { Icon: AlertCircle, name: "AlertCircle", use: "警告/错误" },
      { Icon: Info, name: "Info", use: "信息提示" },
      { Icon: Bell, name: "Bell", use: "通知" },
      { Icon: Loader2, name: "Loader2", use: "加载中（animate-spin）" },
    ],
  },
  {
    title: "拖拽",
    icons: [
      { Icon: GripVertical, name: "GripVertical", use: "拖拽手柄" },
    ],
  },
];

const sizeDemo = [
  { size: 14, label: "14px", use: "按钮内图标、行内标注" },
  { size: 16, label: "16px", use: "导航、标签、侧栏" },
  { size: 20, label: "20px", use: "独立按钮图标、工具栏" },
  { size: 24, label: "24px", use: "空状态、大按钮、展示区" },
];

export default function IconsShowcase() {
  return (
    <div className="px-6 py-16 max-w-6xl mx-auto space-y-20">
      <div>
        <p className="text-[13px] text-[#00CAE0] font-medium mb-2">Icon System</p>
        <h1 className="font-heading text-4xl font-medium tracking-[-0.02em] mb-3">图标系统</h1>
        <p className="text-[15px] text-[#999999] leading-[1.8] max-w-2xl">
          使用 Lucide React 图标库，stroke-based 线性风格。图标不承载色彩，通过 currentColor 继承父元素颜色。
        </p>
      </div>

      {/* Usage Rules */}
      <section className="space-y-4">
        <h2 className="font-heading text-xl font-medium tracking-[-0.01em]">使用规范</h2>
        <div className="rounded-xl border border-white/5 bg-[#141414] p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-[13px]">
            <div>
              <p className="text-white font-medium mb-1">尺寸</p>
              <p className="text-[#999]">14px（按钮内）、16px（导航/标签，默认）、20px（独立按钮）、24px（空状态）</p>
            </div>
            <div>
              <p className="text-white font-medium mb-1">线宽</p>
              <p className="text-[#999]">strokeWidth=1.5（默认）或 2（需更强存在感时）。不使用 filled 变体</p>
            </div>
            <div>
              <p className="text-white font-medium mb-1">颜色</p>
              <p className="text-[#999]">永远用 currentColor，不单独设色。跟随父元素文字颜色自动切换</p>
            </div>
            <div>
              <p className="text-white font-medium mb-1">对齐</p>
              <p className="text-[#999]">配合 flex items-center gap-2 与文字对齐，不单独使用 margin/padding 微调</p>
            </div>
            <div>
              <p className="text-white font-medium mb-1">引入</p>
              <p className="text-[#999] text-[12px] font-mono">{"import { IconName } from 'lucide-react'"}</p>
            </div>
            <div>
              <p className="text-white font-medium mb-1">调用</p>
              <p className="text-[#999] text-[12px] font-mono">{"<IconName size={16} strokeWidth={1.5} />"}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Size Demo */}
      <section className="space-y-4">
        <h2 className="font-heading text-xl font-medium tracking-[-0.01em]">尺寸对比</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 rounded-xl border border-white/5 bg-[#141414] p-6">
          {sizeDemo.map((s) => (
            <div key={s.size} className="flex flex-col items-center gap-3">
              <div className="h-7 flex items-center justify-center">
                <Search size={s.size} strokeWidth={1.5} className="text-white" />
              </div>
              <span className="text-[12px] text-white font-mono">{s.label}</span>
              <span className="text-[11px] text-[#666] text-center leading-[1.4]">{s.use}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Color Inheritance */}
      <section className="space-y-4">
        <h2 className="font-heading text-xl font-medium tracking-[-0.01em]">颜色继承</h2>
        <p className="text-[14px] text-[#666]">图标不单独设色，通过 currentColor 跟随上下文自动适配。</p>
        <div className="flex items-center gap-6 rounded-xl border border-white/5 bg-[#141414] p-6">
          <div className="flex items-center gap-2 text-white">
            <Search size={16} strokeWidth={1.5} />
            <span className="text-[13px]">白色文字</span>
          </div>
          <div className="flex items-center gap-2 text-[#999]">
            <Search size={16} strokeWidth={1.5} />
            <span className="text-[13px]">灰色文字</span>
          </div>
          <div className="flex items-center gap-2 text-[#666]">
            <Search size={16} strokeWidth={1.5} />
            <span className="text-[13px]">弱灰文字</span>
          </div>
          <div className="flex items-center gap-2 text-[#ef4444]">
            <AlertCircle size={16} strokeWidth={1.5} />
            <span className="text-[13px]">危险红</span>
          </div>
        </div>
      </section>

      {/* Icon Groups */}
      {iconGroups.map((group) => (
        <section key={group.title} className="space-y-4">
          <h2 className="font-heading text-xl font-medium tracking-[-0.01em]">{group.title}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {group.icons.map(({ Icon, name, use }) => (
              <div
                key={name}
                className="flex flex-col items-center gap-2 rounded-lg border border-white/5 bg-[#141414] p-4 hover:border-white/10 transition-colors"
              >
                <Icon size={20} strokeWidth={1.5} className="text-white" />
                <p className="text-[12px] text-white font-mono">{name}</p>
                <p className="text-[11px] text-[#666] text-center leading-[1.3]">{use}</p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
