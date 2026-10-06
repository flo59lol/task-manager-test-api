import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, test } from "vitest";
import { isTaskOverdue } from "../../src/helpers/task.helper.js";
import { prisma } from "../../src/lib/prisma.js";
import ProjectRepository from "../../src/repositories/ProjectRepository.js";
import TaskRepository from "../../src/repositories/TaskRepository.js";

describe("repositories (integration)", () => {
  const rId : string = randomUUID();
  let customerId: number | undefined;
  let firstProjectId: number;
  let secondProjectId: number;
  let firstTaskId: number;
  let secondTaskId: number;

  const createProject = async (name: string) => {
    if (customerId === undefined) {
      throw new Error("Test customer has not been created");
    }

    const project = await ProjectRepository.create({
      name,
      customerId,
      dueDate: new Date("2035-01-01T12:00:00.000Z"),
    });
    return project;
  };

  const createTask = async (
    title: string,
    projectId?: number,
    dueDate?: Date,
  ) => {
    const task = await TaskRepository.create({ title, projectId, dueDate });
    return task;
  };

  beforeEach(async () => {
    if (!process.env.DATABASE_NAME?.endsWith("_test")) {
      throw new Error("Integration tests require a DATABASE_NAME ending in _test");
    }

    await prisma.task.deleteMany();
    await prisma.project.deleteMany();
    await prisma.customer.deleteMany();

    const customer = await prisma.customer.create({
      data: {
        name: "Integration customer " + rId,
        email: "integration-" + rId + "@example.test",
      },
    });
    customerId = customer.id;

    const firstProject = await createProject("Integration project A " + rId);
    const secondProject = await createProject("Integration project B " + rId);
    firstProjectId = firstProject.id;
    secondProjectId = secondProject.id;

    const firstTask = await createTask(
      "Integration task A " + rId,
      firstProject.id,
    );
    const secondTask = await createTask(
      "Integration task B " + rId,
      secondProject.id,
    );
    firstTaskId = firstTask.id;
    secondTaskId = secondTask.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("TaskRepository", () => {
    test("CT-004 verifies that a new task has TODO status", async () => {
      const task = await createTask("Nouvelle tâche", firstProjectId);

      expect(task.status).toBe("TODO");
    });

    test("CT-007 creates a task with its expected data", async () => {
      const title = "Created task " + rId;
      const created = await createTask(title, firstProjectId);

      expect(created.id).toBeTypeOf("number");
      expect(created.title).toBe(title);
      expect(created.projectId).toBe(firstProjectId);
      expect(created.dueDate).toBeInstanceOf(Date);
    });

    test("CT-008 returns tasks present in the database", async () => {
      const tasks = await TaskRepository.findAll();
      const byId = new Map(tasks.map((task) => [task.id, task]));

      expect(byId.get(firstTaskId)?.title).toBe("Integration task A " + rId);
      expect(byId.get(secondTaskId)?.title).toBe("Integration task B " + rId);
    });

    test("CT-009 returns an existing task and its project", async () => {
      const task = await TaskRepository.findById(firstTaskId);

      expect(task.id).toBe(firstTaskId);
      expect(task.title).toBe("Integration task A " + rId);
      expect(task.project?.id).toBe(firstProjectId);
    });

    test("CT-010 rejects an unknown ID without changing the database", async () => {
      const countBefore = await prisma.task.count();

      await expect(TaskRepository.findById(-1)).rejects.toThrow();
      expect(await prisma.task.count()).toBe(countBefore);
    });

    test("CT-011 persists updates to an existing task", async () => {
      const task = await createTask("Task to update " + rId, firstProjectId);
      const updatedTitle = "Updated task " + rId;

      await TaskRepository.update(task.id, { title: updatedTitle });
      const persisted = await TaskRepository.findById(task.id);

      expect(persisted.title).toBe(updatedTitle);
    });

    test("CT-012 deletes an existing task", async () => {
      const task = await createTask("Task to delete " + rId);

      await TaskRepository.delete(task.id);

      await expect(TaskRepository.findById(task.id)).rejects.toThrow();
      expect(await prisma.task.findUnique({ where: { id: task.id } })).toBeNull();
    });

    test("CT-019 returns the project related to a task", async () => {
      const task = await TaskRepository.findById(secondTaskId);

      expect(task.project?.id).toBe(secondProjectId);
      expect(task.project?.name).toBe("Integration project B " + rId);
    });

    test("CT-020 reads a newly created task on a subsequent repository call", async () => {
      const title = "Persisted task " + rId;
      const created = await createTask(title, firstProjectId);
      const reread = await TaskRepository.findById(created.id);

      expect(reread.id).toBe(created.id);
      expect(reread.title).toBe(title);
      expect(reread.projectId).toBe(firstProjectId);
    });

    test("CT-021 handles a task with an overdue due date", async () => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() - 3);
      const task = await createTask("Overdue task " + rId, firstProjectId, dueDate);
      const persisted = await TaskRepository.findById(task.id);

      expect(persisted.dueDate.getTime()).toBe(dueDate.getTime());
      expect(isTaskOverdue(persisted.dueDate, persisted.status)).toBe(true);
    });
  });

  describe("ProjectRepository", () => {
    test("CT-013 creates a project with its expected data", async () => {
      const name = "Created project " + rId;
      const project = await createProject(name);

      expect(project.id).toBeTypeOf("number");
      expect(project.name).toBe(name);
      expect(project.customerId).toBe(customerId);
      expect(project.reference).toMatch(/^PRJ-\d{4,}$/);
    });

    test("CT-014 returns projects present in the database", async () => {
      const projects = await ProjectRepository.findAll();
      const byId = new Map(projects.map((project) => [project.id, project]));

      expect(byId.get(firstProjectId)?.name).toBe("Integration project A " + rId);
      expect(byId.get(secondProjectId)?.name).toBe("Integration project B " + rId);
    });

    test("CT-015 returns an existing project and its customer", async () => {
      const project = await ProjectRepository.findById(firstProjectId);

      expect(project.id).toBe(firstProjectId);
      expect(project.name).toBe("Integration project A " + rId);
      expect(project.customer.id).toBe(customerId);
    });

    test("CT-016 rejects an unknown ID without changing the database", async () => {
      const countBefore = await prisma.project.count();

      await expect(ProjectRepository.findById(-1)).rejects.toThrow();
      expect(await prisma.project.count()).toBe(countBefore);
    });

    test("CT-017 persists updates to an existing project", async () => {
      const project = await createProject("Project to update " + rId);
      const updatedName = "Updated project " + rId;

      await ProjectRepository.update(project.id, { name: updatedName });
      const persisted = await ProjectRepository.findById(project.id);

      expect(persisted.name).toBe(updatedName);
    });

    test("CT-018 deletes an existing project", async () => {
      const project = await createProject("Project to delete " + rId);

      await ProjectRepository.delete(project.id);

      await expect(ProjectRepository.findById(project.id)).rejects.toThrow();
      expect(
        await prisma.project.findUnique({ where: { id: project.id } }),
      ).toBeNull();
    });
  });
});