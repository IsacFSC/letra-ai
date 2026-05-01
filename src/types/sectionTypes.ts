// types/section.ts
export enum SectionType {
  VERSE = "VERSE",
  CHORUS = "CHORUS",
  BRIDGE = "BRIDGE",
  OUTRO = "OUTRO",
  INTRO = "INTRO",
  BUILD = "BUILD",
  DROP = "DROP",
}

// types/sectionTypes.ts

export type Section = {
  id: string;
  type: SectionType;
  label: string;
  content: string;
  order: number;
  color?: string;
};