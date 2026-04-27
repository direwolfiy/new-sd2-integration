export interface ApiResult<T> {
  code: number;
  message: string;
  bizCode?: string;
  data: T;
}

export interface PageResult<T> {
  list: T[];
  total: number;
  pageNum: number;
  pageSize: number;
  pages?: number;
}

export interface LoginResponse {
  id: number;
  username: string;
  roleId?: number;
  userType?: number;
  nickName?: string;
  defaultTenantId?: number;
  lastActiveTenantId?: number;
  tenantCount: number;
  token: string;
  accessToken: string;
  refreshToken: string;
  accessExpireAt: string;
  refreshExpireAt: string;
  signKey: string;
  signExpireAt: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// Backend: ResourceSceneContentDTO
export interface ContentItem {
  id: string;
  title: string;
  summary?: string | null;
  script?: string | null;
  language?: string | null;
  coverUrl?: string | null;
  status?: number | null;
  tenantId?: string | null;
  creator?: string | null;
  createdTime?: string | null;
  updatedTime?: string | null;
  audioDuration?: number | null;
  businessType?: number | null;
  videoDuration?: number | null;
  chapterCount?: number | null;
  assetLibraryId?: string | null;
  characterFolderId?: string | null;
  sceneFolderId?: string | null;
  propFolderId?: string | null;
  estimatedEpisodes?: number | null;
  videoAspectRatio?: string | null;
  style?: string | null;
  playbackMode?: number | null;
  playbackSpeed?: number | null;
  videoCreateBusinessType?: string | null;
  imageCreateBusinessType?: string | null;
  bgmId?: string | null;
  sceneAspectRatio?: string | null;
  productionStage?: number | null;
  producerId?: string | null;
  producerName?: string | null;
  projectType?: number | null;
  contentSource?: number | null;
  styleId?: string | null;
  orderScriptId?: string | null;
  needMultiViewScene?: boolean | null;
}

export interface ContentQuery {
  keyword?: string;
  tenantId?: number;
  status?: number;
  businessType?: number | number[];
  excludeBusinessType?: number;
  creator?: number;
  producer?: number;
  productionStage?: number;
  playbackMode?: number;
  pageNum?: number;
  pageSize?: number;
}

// Backend: ResourceSceneChapterDTO
export interface ChapterItem {
  id: string;
  contentId: string;
  chapterTitle?: string | null;
  chapterOrder: number;
  chapterContent?: string | null;
  status?: number | null;
  creator?: string | null;
  createdTime?: string | null;
  updatedTime?: string | null;
  audioUrl?: string | null;
  audioDuration?: number | null;
  videoUrl?: string | null;
  videoDuration?: number | null;
  bgmId?: string | null;
  subtitlesResultUrl?: string | null;
}

// Backend: ResourceTemplateBaseDTO (elements = templates)
export interface TemplateItem {
  id: string;
  contentId?: string | null;
  templateName: string;
  templateType: number; // 0=character, 1=scene, 2=prop
  description?: string | null;
  coverUrl?: string | null;
  tags?: string | null;
  status?: number | null;
  createdTime?: string | null;
  updatedTime?: string | null;
  sortOrder?: number | null;
  extraData?: string | null; // JSON string with variant info
}

export interface TemplateQuery {
  contentId?: string;
  templateType?: number;
  keyword?: string;
  status?: number;
  pageNum?: number;
  pageSize?: number;
}

// Backend: ResourceSceneScriptDTO (storyboard scripts)
export interface SceneScriptItem {
  id: string;
  chapterId: string;
  sortOrder: number;
  scriptContent?: string | null;
  imagePrompt?: string | null;
  videoPrompt?: string | null;
  imageUrl?: string | null;
  videoUrl?: string | null;
  videoStatus?: string | null;
  duration?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

// Backend: AssetResourceDTO
export interface AssetResourceItem {
  id: string;
  libraryId?: string | null;
  resourceName: string;
  resourceType?: number | null;
  resourceUrl?: string | null;
  coverUrl?: string | null;
  tags?: string | null;
  status?: number | null;
  createdTime?: string | null;
}

// Backend: NovelShowStyleDTO
export interface StyleItem {
  id: string;
  styleName: string;
  stylePrefix?: string | null;
  description?: string | null;
  coverUrl?: string | null;
  isActive?: boolean | null;
  sortOrder?: number | null;
}

// Tenant account
export interface TenantAccountOverview {
  balance: number;
  frozenAmount: number;
  totalRecharged: number;
  totalConsumed: number;
}
