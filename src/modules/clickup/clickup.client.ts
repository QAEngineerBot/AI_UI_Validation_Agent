import axios, { AxiosInstance } from "axios";
import { clickupConfig } from "../../config/clickup.config";
import { CreateTaskRequest, ClickUpTask } from "./clickup.types";
import fs from "fs";
import FormData from "form-data";

export class ClickUpClient {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: clickupConfig.apiUrl,
      timeout: 30000,
      headers: {
        Authorization: clickupConfig.token,
        "Content-Type": "application/json",
      },
    });
  }

  async createTask(request: CreateTaskRequest): Promise<ClickUpTask> {
    const response = await this.client.post(
      `/list/${clickupConfig.listId}/task`,
      {
        name: request.name,
        description: request.description,
        priority: request.priority,
        tags: request.tags,
      },
    );

    return {
      id: response.data.id,
      name: response.data.name,
      url: response.data.url,
    };
  }

  async findTaskByName(taskName: string): Promise<ClickUpTask | null> {
    const response = await this.client.get(
      `/list/${clickupConfig.listId}/task`,
      {
        params: {
          include_closed: true,
        },
      },
    );

    const task = response.data.tasks.find(
      (task: any) =>
        task.name.trim().toLowerCase() === taskName.trim().toLowerCase(),
    );

    if (!task) {
      return null;
    }

    return {
      id: task.id,
      name: task.name,
      url: task.url,
    };
  }

  async addComment(taskId: string, comment: string): Promise<void> {
    await this.client.post(`/task/${taskId}/comment`, {
      comment_text: comment,
      notify_all: false,
    });
  }

  async uploadAttachment(taskId: string, filePath: string): Promise<void> {
    const form = new FormData();

    form.append("attachment", fs.createReadStream(filePath));

    await this.client.post(`/task/${taskId}/attachment`, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: clickupConfig.token,
      },
      maxBodyLength: Infinity,
    });
  }
}
