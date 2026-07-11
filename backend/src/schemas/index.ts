export { loginSchema } from "./auth.schema";
export { createNewsSchema, updateNewsSchema, newsQuerySchema } from "./news.schema";
export { createCategorySchema, updateCategorySchema } from "./category.schema";
export { createTagSchema, updateTagSchema } from "./tag.schema";
export { createUserSchema, updateUserSchema, updateProfileSchema, changePasswordSchema } from "./user.schema";
export { presignedUploadSchema } from "./upload.schema";

export type {
  CreateNewsInput,
  UpdateNewsInput,
  NewsQueryInput,
} from "./news.schema";
export type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "./category.schema";
export type {
  CreateTagInput,
  UpdateTagInput,
} from "./tag.schema";
export type {
  CreateUserInput,
  UpdateUserInput,
  UpdateProfileInput,
  ChangePasswordInput,
} from "./user.schema";
export type { PresignedUploadInput } from "./upload.schema";
