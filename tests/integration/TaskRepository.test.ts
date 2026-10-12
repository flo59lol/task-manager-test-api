import { test, describe, expect, beforeAll, afterEach, afterAll } from "vitest";
import TaskRepository from "../../src/repositories/TaskRepository.js";
import { prisma } from "../../src/lib/prisma.js";
import { TaskPriority, TaskStatus } from "../../src/generated/prisma/enums.js";

describe("Test TaskRepository", () => {


    beforeAll(async () => {
        await prisma.$transaction(async (tx) => {
            await tx.$executeRaw`SET FOREIGN_KEY_CHECKS = 0`;
            await tx.$executeRaw`TRUNCATE TABLE tasks`;
            await tx.$executeRaw`TRUNCATE TABLE projects`;
            await tx.$executeRaw`TRUNCATE TABLE customers`;
            await tx.$executeRaw`SET FOREIGN_KEY_CHECKS = 1`;
        }
        )
    });

    afterEach(async () => {
        await prisma.$transaction(async (tx) => {
            await tx.$executeRaw`SET FOREIGN_KEY_CHECKS = 0`;
            await tx.$executeRaw`TRUNCATE TABLE tasks`;
            await tx.$executeRaw`SET FOREIGN_KEY_CHECKS = 1`;
        });
    });

    const task =
    {
        title: "Créer la base de données",
        description: "Créer les tables principales du projet",
        status: TaskStatus.COMPLETED,
        priority: TaskPriority.HIGH,
        dueDate: new Date("2026-10-01"),
    }

    test("should create a task", async () => {

        const createdTask = await TaskRepository.create(task);

        expect(createdTask).toMatchObject(task);
    });

    test("should create an invalid task", async () => {

        await expect(TaskRepository.create({
            ...task,
            projectId: -1,

        })).rejects.toThrow();
    });

    test("should retrieve tasks", async () => {

        await TaskRepository.create(task);
        await TaskRepository.create(task);
        const retrievedTasks = await TaskRepository.findAll();
        expect(retrievedTasks).toHaveLength(2);
    });


    test("should update a task", async () => {

        const createdTask = await TaskRepository.create(task);
        const newTask = {
            ...task,
            title: "Créer la base de données - mise à jour",
        };

        const updatedTask = await TaskRepository.update(createdTask.id, newTask);

        expect(updatedTask).toMatchObject(newTask);
        expect(updatedTask.title).toBe(newTask.title);

    });

    test("Throw exception with invalid data", async () => {

        await TaskRepository.create(task);
        const newTask = {
            ...task,
            title: "Créer la base de données - mise à jour",
            projectId: -1
        };

        await expect(TaskRepository.update(-1, newTask)).rejects.toThrow();

    });

     test("should delete a task", async () => {

        const createdTask = await TaskRepository.create(task);

        await TaskRepository.delete(createdTask.id);

        await expect(TaskRepository.findById(createdTask.id)).rejects.toThrow();

    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

});

