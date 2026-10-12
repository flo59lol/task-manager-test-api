import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, test } from "vitest";
import { ProjectStatus } from "../../src/generated/prisma/enums.js";
import ProjectRepository from "../../src/repositories/ProjectRepository.js";
import { prisma } from "../../src/lib/prisma.js";

describe("Test ProjectRepository", () => {
    const testId = randomUUID();
    let customerId: number;

    const projectData = () => ({
        name: "Projet d'intégration " + testId,
        description: "Projet de test",
        status: ProjectStatus.IN_PROGRESS,
        amountExclTax: 15000,
        vatRate: 20,
        dueDate: new Date("2026-12-01T00:00:00.000Z"),
        customerId,
    });

    beforeEach(async () => {
        if (!process.env.DATABASE_NAME?.endsWith("_test")) {
            throw new Error("Integration tests require a DATABASE_NAME ending in _test");
        }

        await prisma.task.deleteMany();
        await prisma.project.deleteMany();
        await prisma.customer.deleteMany();

        const customer = await prisma.customer.create({
            data: {
                name: "Client de test",
                email: "project-" + testId + "@example.test",
            },
        });
        customerId = customer.id;
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    test("should create a project", async () => {
        const data = projectData();
        const created = await ProjectRepository.create(data);

        expect(created.id).toBeTypeOf("number");
        expect(created.name).toBe(data.name);
        expect(created.description).toBe(data.description);
        expect(created.status).toBe(data.status);
        expect(Number(created.amountExclTax)).toBe(data.amountExclTax);
        expect(Number(created.vatRate)).toBe(data.vatRate);
        expect(created.customerId).toBe(customerId);
        expect(created.reference).toMatch(/^PRJ-\d{4,}$/);
    });

    test("should reject a project with an invalid customer", async () => {
        await expect(
            ProjectRepository.create({ ...projectData(), customerId: -1 }),
        ).rejects.toThrow();
    });

    test("should retrieve projects", async () => {
        const first = await ProjectRepository.create(projectData());
        const second = await ProjectRepository.create(projectData());

        const projects = await ProjectRepository.findAll();

        expect(projects).toHaveLength(2);
        expect(projects.map((project) => project.id)).toContain(first.id);
        expect(projects.map((project) => project.id)).toContain(second.id);
    });

    test("should retrieve a project by ID", async () => {
        const created = await ProjectRepository.create(projectData());
        const retrieved = await ProjectRepository.findById(created.id);

        expect(retrieved.id).toBe(created.id);
        expect(retrieved.name).toBe(created.name);
        expect(retrieved.customer.id).toBe(customerId);
    });

    test("should update a project", async () => {
        const created = await ProjectRepository.create(projectData());
        const newName = "Projet modifié";

        const updated = await ProjectRepository.update(created.id, {
            name: newName,
        });

        expect(updated.name).toBe(newName);
        expect((await ProjectRepository.findById(created.id)).name).toBe(newName);
    });

    test("should reject an update for an unknown project", async () => {
        await expect(
            ProjectRepository.update(-1, { name: "Projet modifié" }),
        ).rejects.toThrow();
    });

    test("should delete a project", async () => {
        const created = await ProjectRepository.create(projectData());

        await ProjectRepository.delete(created.id);

        await expect(ProjectRepository.findById(created.id)).rejects.toThrow();
        await expect(
            prisma.project.findUnique({ where: { id: created.id } }),
        ).resolves.toBeNull();
    });
});