export interface ScreenMapEntry {
  figmaNodeId: string;
  platform: 'android' | 'ios' | 'web';
  tags?: string[];
}

export type ScreenMap = Record<string, ScreenMapEntry>;