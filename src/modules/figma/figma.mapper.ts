import { ScreenMapService } from '../screen-mapping/screen-map.service';

export class FigmaMapper {
  private readonly screenMapService: ScreenMapService;

  constructor(screenMapService?: ScreenMapService) {
    this.screenMapService = screenMapService ?? new ScreenMapService();
  }

  /**
   * Resolve a screen name to its configured Figma node ID.
   */
  async getNodeIdForScreen(screenName: string): Promise<string> {
    const screen = await this.screenMapService.getScreen(screenName);
    return screen.figmaNodeId;
  }
}