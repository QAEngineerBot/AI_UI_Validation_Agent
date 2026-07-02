import { logger } from '../../core/logger/logger';
import { ScreenValidationResult } from '../../core/types/validation.types';

import { ClickUpClient } from './clickup.client';
import { ClickUpMapper } from './clickup.mapper';
import { CommentBuilder } from './comment.builder';

export class ClickUpService {
  private readonly client: ClickUpClient;
  private readonly mapper: ClickUpMapper;
  private readonly commentBuilder: CommentBuilder;

  constructor() {
    this.client = new ClickUpClient();
    this.mapper = new ClickUpMapper();
    this.commentBuilder = new CommentBuilder();
  }

  async createOrUpdateBug(
    validation: ScreenValidationResult
  ): Promise<void> {

    const taskName =
      `${validation.screenName} Screen UI Issues`;

    logger.info(
      `Searching ClickUp task "${taskName}"`
    );

    const existingTask =
      await this.client.findTaskByName(taskName);

    const comment =
      this.commentBuilder.build(validation);

    if (existingTask) {

      logger.info(
        `Existing ClickUp task found. Adding execution comment.`
      );

      await this.client.addComment(
        existingTask.id,
        comment
      );

      logger.info(
        `Comment added successfully.`
      );

      return;
    }

    logger.info(
      `No existing task found. Creating new bug.`
    );

    const request =
      this.mapper.map({
        validation,
      });

    const task =
      await this.client.createTask(request);

    logger.info(
      `Task created successfully.`
    );

    await this.client.addComment(
      task.id,
      comment
    );

    logger.info(
      `Initial execution comment added.`
    );

    logger.info(
      `Task URL : ${task.url}`
    );
  }
}