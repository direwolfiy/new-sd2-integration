import { ElementItem, CharacterVariant, CharacterInfoDetail, SceneState, SceneInfoDetail } from "./types";

// TODO: [mock] replace with API call
export const elements: ElementItem[] = [
  // 剧本 — 星辰变
  {
    id: "el-script-1",
    projectId: "proj-1",
    type: "script",
    name: "总剧本",
    thumbnailUrl: "",
    tags: ["3 集", "仙侠"],
    wordCount: 1247,
    createdAt: "2025-12-01",
  },
  // 角色 — 星辰变
  {
    id: "el-1",
    projectId: "proj-1",
    type: "character",
    name: "秦羽",
    thumbnailUrl: "/elements/qinyu.jpg",
    tags: ["主角", "修炼者"],
    variants: ["日常", "战斗", "星辰形态"],
    createdAt: "2025-12-05",
  },
  {
    id: "el-2",
    projectId: "proj-1",
    type: "character",
    name: "姜立",
    thumbnailUrl: "/elements/jiangli.jpg",
    tags: ["女主", "仙族"],
    variants: ["日常", "仙装"],
    createdAt: "2025-12-05",
  },
  {
    id: "el-3",
    projectId: "proj-1",
    type: "character",
    name: "侯费",
    thumbnailUrl: "/elements/houfei.jpg",
    tags: ["配角", "灵兽"],
    variants: ["人形", "猿形"],
    createdAt: "2025-12-08",
  },
  {
    id: "el-4",
    projectId: "proj-1",
    type: "character",
    name: "黑羽",
    thumbnailUrl: "/elements/heiyu.jpg",
    tags: ["配角", "暗族"],
    createdAt: "2025-12-08",
  },
  // 场景 — 星辰变
  {
    id: "el-5",
    projectId: "proj-1",
    type: "scene",
    name: "秦村黄昏",
    thumbnailUrl: "/elements/qincun.jpg",
    tags: ["村庄", "黄昏"],
    createdAt: "2025-12-10",
  },
  {
    id: "el-6",
    projectId: "proj-1",
    type: "scene",
    name: "九剑仙府外景",
    thumbnailUrl: "/elements/xianfu.jpg",
    tags: ["仙府", "云海"],
    createdAt: "2025-12-12",
  },
  {
    id: "el-7",
    projectId: "proj-1",
    type: "scene",
    name: "潜龙大陆山顶",
    thumbnailUrl: "/elements/shanding.jpg",
    tags: ["山脉", "日出"],
    createdAt: "2025-12-12",
  },
  // 道具 — 星辰变
  {
    id: "el-8",
    projectId: "proj-1",
    type: "prop",
    name: "流星泪",
    thumbnailUrl: "/elements/liuxing.jpg",
    tags: ["神器", "核心道具"],
    createdAt: "2025-12-06",
  },
  {
    id: "el-9",
    projectId: "proj-1",
    type: "prop",
    name: "黑炎君之戒",
    thumbnailUrl: "/elements/jiezhi.jpg",
    tags: ["装备"],
    createdAt: "2025-12-15",
  },
  // 音效 — 星辰变
  {
    id: "el-10",
    projectId: "proj-1",
    type: "audio",
    name: "古风 BGM — 悠远",
    thumbnailUrl: "/elements/bgm1.jpg",
    tags: ["BGM", "古风"],
    createdAt: "2025-12-20",
  },
  {
    id: "el-11",
    projectId: "proj-1",
    type: "audio",
    name: "战斗音效包",
    thumbnailUrl: "/elements/sfx1.jpg",
    tags: ["音效", "战斗"],
    createdAt: "2025-12-20",
  },
  // 剧本 — 都市暗影
  {
    id: "el-script-2",
    projectId: "proj-2",
    type: "script",
    name: "总剧本",
    thumbnailUrl: "",
    tags: ["2 集", "悬疑"],
    wordCount: 892,
    createdAt: "2026-01-15",
  },
  // 角色 — 都市暗影
  {
    id: "el-12",
    projectId: "proj-2",
    type: "character",
    name: "林默",
    thumbnailUrl: "/elements/linmo.jpg",
    tags: ["主角", "侦探"],
    variants: ["便装", "正装"],
    createdAt: "2026-01-20",
  },
  {
    id: "el-13",
    projectId: "proj-2",
    type: "character",
    name: "苏晚",
    thumbnailUrl: "/elements/suwan.jpg",
    tags: ["女主", "记者"],
    createdAt: "2026-01-20",
  },
  // 场景 — 都市暗影
  {
    id: "el-14",
    projectId: "proj-2",
    type: "scene",
    name: "废弃地铁站",
    thumbnailUrl: "/elements/ditie.jpg",
    tags: ["都市", "地下"],
    createdAt: "2026-01-25",
  },
  // 剧本 — 食堂争霸
  {
    id: "el-script-3",
    projectId: "proj-3",
    type: "script",
    name: "总剧本",
    thumbnailUrl: "",
    tags: ["2 集", "搞笑"],
    wordCount: 1053,
    createdAt: "2025-10-20",
  },
];

export function getElementsByProject(projectId: string): ElementItem[] {
  return elements.filter((el) => el.projectId === projectId);
}

export function getElementsByType(projectId: string, type: string): ElementItem[] {
  return elements.filter((el) => el.projectId === projectId && el.type === type);
}

// TODO: [mock] replace with API call
export const characterDetails: Record<string, CharacterVariant[]> = {
  "el-1": [
    {
      id: "v-1-1",
      name: "日常",
      description: "朴素简洁的青色布衣，束发佩剑，少年侠客气质",
      episodes: [1, 2, 3],
      images: [
        { id: "img-1a", name: "主图", url: null, isPrimary: true },
        { id: "img-1b", name: "三视图", url: null, isPrimary: false },
        { id: "img-1c", name: "背面图", url: null, isPrimary: false },
      ],
    },
    {
      id: "v-1-2",
      name: "战斗",
      description: "黑色劲装，周身环绕星辰之力，目光凌厉",
      episodes: [1, 2],
      images: [
        { id: "img-2a", name: "主图", url: null, isPrimary: true },
        { id: "img-2b", name: "特写", url: null, isPrimary: false },
      ],
    },
    {
      id: "v-1-3",
      name: "星辰形态",
      description: "星辰变觉醒后终极形态，通体散发星光，发丝变为银色",
      episodes: [3],
      images: [
        { id: "img-3a", name: "主图", url: null, isPrimary: true },
      ],
    },
  ],
  "el-2": [
    {
      id: "v-2-1",
      name: "日常",
      description: "淡雅白衣，发间点缀珠花，举止端庄",
      episodes: [1, 2],
      images: [
        { id: "img-4a", name: "主图", url: null, isPrimary: true },
        { id: "img-4b", name: "侧面", url: null, isPrimary: false },
      ],
    },
    {
      id: "v-2-2",
      name: "仙装",
      description: "仙族正装，华美锦袍配灵玉饰品，气场全开",
      episodes: [2, 3],
      images: [
        { id: "img-5a", name: "主图", url: null, isPrimary: true },
        { id: "img-5b", name: "三视图", url: null, isPrimary: false },
        { id: "img-5c", name: "细节", url: null, isPrimary: false },
      ],
    },
  ],
  "el-3": [
    {
      id: "v-3-1",
      name: "人形",
      description: "身材魁梧的青年形象，面容粗犷，眼神锐利",
      episodes: [1, 2, 3],
      images: [
        { id: "img-6a", name: "主图", url: null, isPrimary: true },
        { id: "img-6b", name: "全身", url: null, isPrimary: false },
      ],
    },
    {
      id: "v-3-2",
      name: "猿形",
      description: "巨大猿形灵兽形态，浑身金毛，力大无穷",
      episodes: [1, 2],
      images: [
        { id: "img-7a", name: "主图", url: null, isPrimary: true },
      ],
    },
  ],
  "el-4": [],
};

// TODO: [mock] replace with API call
export const sceneDetails: Record<string, SceneState[]> = {
  "el-5": [
    {
      id: "sv-5-1",
      name: "黄昏",
      description: "夕阳西下，金色余晖洒满村庄，炊烟袅袅，远处山峦层叠",
      episodes: [1, 2],
      images: [
        { id: "si-5a", name: "全景", url: null, isPrimary: true },
        { id: "si-5b", name: "近景", url: null, isPrimary: false },
      ],
    },
    {
      id: "sv-5-2",
      name: "夜晚",
      description: "星空璀璨，村庄灯火点点，虫鸣声声，宁静祥和",
      episodes: [1],
      images: [
        { id: "si-5c", name: "全景", url: null, isPrimary: true },
      ],
    },
  ],
  "el-6": [
    {
      id: "sv-6-1",
      name: "白天",
      description: "仙府悬浮于云海之上，金光万道，瑞气千条，殿宇巍峨壮观",
      episodes: [1, 2, 3],
      images: [
        { id: "si-6a", name: "全景", url: null, isPrimary: true },
        { id: "si-6b", name: "入口", url: null, isPrimary: false },
        { id: "si-6c", name: "远景", url: null, isPrimary: false },
      ],
    },
    {
      id: "sv-6-2",
      name: "雷暴",
      description: "电闪雷鸣，仙府在暴风雨中若隐若现，气势磅礴",
      episodes: [2],
      images: [
        { id: "si-6d", name: "全景", url: null, isPrimary: true },
      ],
    },
  ],
  "el-7": [
    {
      id: "sv-7-1",
      name: "日出",
      description: "高山之巅，云海翻涌，旭日东升，霞光万丈",
      episodes: [1, 3],
      images: [
        { id: "si-7a", name: "全景", url: null, isPrimary: true },
        { id: "si-7b", name: "山顶特写", url: null, isPrimary: false },
      ],
    },
  ],
  "el-14": [],
};

// TODO: [mock] replace with API call
export const sceneInfo: Record<string, SceneInfoDetail> = {
  "el-5": {
    location: "秦村 — 偏远山村，秦羽成长之地，三面环山，一条小溪穿村而过",
    mood: "宁静祥和，带有淡淡的乡愁与少年离家的不舍",
  },
  "el-6": {
    location: "九剑仙府 — 悬浮于云海之上的仙家府邸，九把巨剑插于山巅",
    mood: "壮阔恢弘，仙气飘渺，令人心生敬畏",
  },
  "el-7": {
    location: "潜龙大陆最高峰 — 终年积雪，云雾缭绕，传说中潜龙沉睡之地",
    mood: "苍茫辽阔，孤独而壮美",
  },
  "el-14": {
    location: "废弃地铁站 — 城市边缘废弃多年的地铁隧道，潮湿阴暗",
    mood: "压抑阴冷，充满悬疑与不安",
  },
};

// TODO: [mock] replace with API call
export const characterInfo: Record<string, CharacterInfoDetail> = {
  "el-1": {
    bio: "秦氏家族幼子，天生无法修炼内功，却意外获得流星泪，踏上星辰变修炼之路。性格坚韧不拔，重情重义。",
    voiceDescription: "少年音，略带沙哑的磁性，沉稳中透着不服输的倔强",
  },
  "el-2": {
    bio: "姜氏族长之女，天资聪颖，修炼天赋极高。性格温婉大方，与秦羽相知相爱，是秦羽最坚实的后盾。",
    voiceDescription: "清亮温柔的女声，语调平和舒缓，偶尔带着少女的俏皮",
  },
  "el-3": {
    bio: "灵兽化形，秦羽的结拜兄弟。性格豪爽，好战成性，但忠心耿耿，为兄弟可以不惜一切。",
    voiceDescription: "粗犷浑厚的男中音，说话直来直去，笑声爽朗",
  },
  "el-4": {
    bio: "暗族高手，秦羽的挚友。沉默寡言，实力强大，行事果决，关键时刻从不犹豫。",
    voiceDescription: "低沉冷淡的男低音，话少但每句都很有分量",
  },
};
