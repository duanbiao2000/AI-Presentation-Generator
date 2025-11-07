export type LayoutType =
  | 'TEXT_WITH_IMAGE'
  | 'TEXT_ONLY'
  | 'TITLE_ONLY'
  | 'IMAGE_FOCUSED'
  | 'TWO_COLUMNS';

export interface SlideContent {
  title: string;
  layout: LayoutType;
  content?: string[]; // for bullet points in single column layouts
  content_col1?: string[]; // for two-column layouts
  content_col2?: string[]; // for two-column layouts
  image_prompt?: string;
  image_base64?: string; // to store the generated image
}
