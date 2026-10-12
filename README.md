# Task Manager — Test Starter

API REST de gestion de projets et de tâches (Express, TypeScript, Prisma, MySQL), prête à être testée avec Vitest et Supertest.

## Domaine

- **Customer** : un client, identifié par son email.
- **Project** : un projet appartient à un client. Il a un statut, un montant hors taxes et un taux de TVA. Sa référence (`PRJ-0001`) est générée automatiquement.
- **Task** : une tâche, rattachée ou non à un projet, avec un statut et une priorité.

Supprimer un projet supprime ses tâches. Un client ayant encore des projets ne peut pas être supprimé.

## Architecture

```
src/
├── routes/        URL + méthode HTTP → méthode du controller
├── controllers/   lecture de la requête, envoi de la réponse
├── repositories/  accès aux données avec Prisma
└── lib/prisma.ts  client Prisma partagé
```

## Configuration

Deux fichiers d'environnement sont à créer à partir des modèles fournis :

- `.env` depuis `.env.example` : base de développement.
- `.env.test` depuis `.env.test.example` : base dédiée aux tests.

Utilisez deux bases différentes : les tests vident les tables de leur base.

## Démarrage

`npm run dev` génère le client Prisma avant de lancer le serveur en mode développement.
`npm start` génère le client, compile le projet, puis lance le serveur.

## Tests

Les tests sont rangés dans `tests/` par type :

| Dossier | Ce qu'on teste | Base de données |
|---|---|---|
| `unit/` | une fonction isolée, sans dépendance | non |
| `integration/` | un repository avec la vraie base | oui |
| `functional/` | l'API de bout en bout, via des requêtes HTTP (Supertest) | oui |

Les dossiers sont vides : à vous d'écrire les tests.
