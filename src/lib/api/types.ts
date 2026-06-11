export interface ApiResult<T> {
  code: number;
  message: string;
  bizCode?: string;
  data: T;
}

export interface PageResult<T> {
  list: T[];
  total: number;
  page_num: number;
  page_size: number;
  pages?: number;
}

export interface LoginResponse {
  id: number;
  username: string;
  roleId?: number;
  userType?: number;
  nickName?: string;
  defaultTenantId?: string;
  lastActiveTenantId?: string;
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
  chapter_content?: string | null;
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

// Backend: ResourceSceneRoleDTO (project-level elements via scene-role binding)
export interface SceneRoleItem {
  id: string;
  content_id?: string | null;
  resource_temp_id?: string | null;
  status?: number | null;
  type?: number | null;
  chapter_id?: string | null;
  template_name?: string | null;
  template_type?: string | null;
  role_type?: string | null;
  template_category?: string | null;
  description?: string | null;
  cover_image?: string | null;
  voice_profile?: Record<string, unknown> | null;
  appearance?: Record<string, unknown> | null;
  template_metadata?: Record<string, unknown> | null;
  seedance_asset_uuid?: string | null;
  seedance_asset_status?: string | null;
  is_referenced_from_project?: boolean | null;
}

// Backend: ResourceTemplateBaseDTO (elements = templates)
export interface TemplateItem {
  id: number;
  contentId: number;
  template_name: string;
  template_type: string; // "ROLE", "SCENE", "PROP", "AUDIO", etc.
  description?: string | null;
  cover_image?: string | null;
  status?: number | null;
  created_time?: string | null;
  updated_time?: string | null;
  role_type?: string | null;
  template_category?: string | null;
  voice_profile?: Record<string, unknown> | null;
  appearance?: unknown | null;
  primaryImageUrl?: string | null;
  usage_count?: number | null;
  autoCreated?: boolean | null;
}

export interface TemplateQuery {
  contentId?: string;
  templateType?: string;
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
  image_result_url?: string | null;
  videoUrl?: string | null;
  videoResultUrl?: string | null;
  video_result_url?: string | null;
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

// AI model config
export interface AiImageModelConfigDTO {
  id: number;
  model_id: string;
  model_name: string;
  model_version?: string | null;
  status?: string | null;
  platform?: string | null;
  vendor?: string | null;
  support_reference_image?: boolean | null;
  support_image_to_image?: boolean | null;
  max_reference_image_count?: number | null;
  supported_aspect_ratios?: string[] | null;
  max_resolution?: string | null;
  cost_per_image?: number | null;
  business_type?: number | null;
  business_type_array?: number[] | null;
}

export interface AiImageModelListResult {
  total: number;
  page_num: number;
  page_size: number;
  items: AiImageModelConfigDTO[];
}

export interface AiVideoModelConfigDTO {
  id: number;
  model_id: string;
  modelId?: string | null;
  model_name: string;
  modelName?: string | null;
  model_version?: string | null;
  modelVersion?: string | null;
  model_type?: string | null;
  modelType?: string | null;
  platform?: string | null;
  status?: string | null;
  description?: string | null;
  supported_ratios?: string | string[] | null;
  supportedRatios?: string | string[] | null;
  quality_levels?: string | string[] | null;
  qualityLevels?: string | string[] | null;
  default_quality?: string | null;
  defaultQuality?: string | null;
  max_resolution?: string | null;
  maxResolution?: string | null;
  min_duration?: number | null;
  minDuration?: number | null;
  max_duration?: number | null;
  maxDuration?: number | null;
  supported_durations?: number[] | null;
  supportedDurations?: number[] | null;
  support_audio_modes?: number[] | null;
  supportAudioModes?: number[] | null;
  support_image_to_video?: number[] | null;
  supportImageToVideo?: number[] | null;
  cost_per_video?: number | string | null;
  costPerVideo?: number | string | null;
  cost_per_second?: number | string | null;
  costPerSecond?: number | string | null;
  business_type?: number[] | null;
  businessType?: number[] | null;
  has_discount?: boolean | null;
  hasDiscount?: boolean | null;
  discount_label?: string | null;
  discountLabel?: string | null;
}

// Tenant account
export interface TenantAccountOverview {
  tenantId: string;
  tenantName: string;
  tenantType?: string;
  totalBalance: string;
  availableBalance: string;
  frozenBalance: string;
  totalRechargeAmount: string;
  totalConsumedAmount?: string;
  totalRefundAmount?: string;
}

// Image generation history
export interface ImageGenerationHistoryQuery {
  pageNum?: number;
  pageSize?: number;
  businessId?: string;
  businessIds?: string[] | string;
  businessType?: string;
  contentId?: string;
  taskStatus?: string;
  modelId?: string;
  prompt?: string;
  forStoryboard?: boolean;
}

export interface ImageGenerationHistoryItem {
  taskId: number;
  createdTime?: string | null;
  updateTime?: string | null;
  status?: string | null;
  title?: string | null;
  modelId?: string | null;
  resolution?: string | null;
  imageUrls?: string[] | null;
  thumbnailUrl?: string | null;
  errorMessage?: string | null;
  prompt?: string | null;
  progress?: number | null;
  generationType?: string | null;
  aspectRatio?: string | null;
  imageCount?: number | null;
}

export interface SceneScriptPromptItem {
  id?: string | number | null;
  sceneScriptId?: string | number | null;
  scene_script_id?: string | number | null;
  chapterId?: string | number | null;
  chapter_id?: string | number | null;
  aiVideoPrompt?: string | null;
  ai_video_prompt?: string | null;
  referenceAssets?: Array<Record<string, unknown>> | null;
  reference_assets?: Array<Record<string, unknown>> | null;
  videoFirstImg?: string | null;
  video_first_img?: string | null;
  aspectRatio?: string | null;
  aspect_ratio?: string | null;
  type?: number | null;
  imgFrameType?: number | null;
  img_frame_type?: number | null;
  frameOrder?: number | null;
  frame_order?: number | null;
  parentPromptId?: string | number | null;
  parent_prompt_id?: string | number | null;
}

export interface ResourceTemplateAssetHistoryItem {
  id: string | number;
  contentId?: string | number | null;
  resourceTempId?: string | number | null;
  resource_temp_id?: string | number | null;
  assetType?: string | null;
  asset_type?: string | null;
  resourceType?: string | null;
  resource_type?: string | null;
  sourceType?: string | null;
  source_type?: string | null;
  sourceRefType?: string | null;
  source_ref_type?: string | null;
  sourceRefId?: string | number | null;
  source_ref_id?: string | number | null;
  title?: string | null;
  assetUrl?: string | null;
  asset_url?: string | null;
  thumbnailUrl?: string | null;
  thumbnail_url?: string | null;
  usageType?: string | null;
  usage_type?: string | null;
  metadata?: Record<string, unknown> | null;
  createTime?: string | null;
  create_time?: string | null;
}
