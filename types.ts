export type LayoutType =
  | 'TEXT_WITH_IMAGE'
  | 'TEXT_ONLY'
  | 'IMAGE_FOCUSED'
  | 'TITLE_ONLY'
  | 'TWO_COLUMNS';

export interface SlideContent {
  title: string;
  layout: LayoutType;
  content?: string[];
  contentColumn1?: string[];
  contentColumn2?: string[];
  speakerNotes?: string;
  imageBase64?: string;
}
