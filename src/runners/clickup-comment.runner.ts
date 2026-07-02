import { ClickUpClient } from '../modules/clickup/clickup.client';

async function run() {
  const client = new ClickUpClient();

  const task = await client.findTaskByName(
    'AI UI Validation Test'
  );

  if (!task) {
    console.log('Task not found.');
    return;
  }

  await client.addComment(
    task.id,
    `This is a test comment from AI UI Validation Agent.

Execution Time: ${new Date().toISOString()}`
  );

  console.log('Comment added successfully.');
}

run().catch(console.error);