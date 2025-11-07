export interface SlideContent {
  title: string;
  content: string[]; // for bullet points
  image_prompt?: string;
  image_base64?: string; // to store the generated image
}
