import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User";

dotenv.config();

interface Migration {
  id: string;
  name: string;
  up: () => Promise<void>;
  down?: () => Promise<void>;
}

const migrations: Migration[] = [
  {
    id: "001_create_user_indexes",
    name: "Create User model indexes",
    up: async () => {
      console.log("Creating User model indexes...");
      await User.createIndexes();
      console.log("✓ User indexes created successfully");
    },
    down: async () => {
      console.log("Dropping User model indexes...");
      await User.collection.dropIndexes();
      console.log("✓ User indexes dropped successfully");
    },
  },
  {
    id: "002_ensure_user_collection",
    name: "Ensure User collection exists",
    up: async () => {
      console.log("Ensuring User collection exists...");
      if (!mongoose.connection.db) {
        throw new Error("Database connection not established");
      }
      const collections = await mongoose.connection.db
        .listCollections({ name: "users" })
        .toArray();
      if (collections.length === 0) {
        await mongoose.connection.createCollection("users");
        console.log("✓ User collection created");
      } else {
        console.log("✓ User collection already exists");
      }
    },
  },
];

export const runMigrations = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI environment variable is not defined");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("✓ Connected to MongoDB");

    console.log("\nStarting migrations...");
    console.log("=".repeat(50));

    for (const migration of migrations) {
      console.log(`\nRunning migration: ${migration.name} (${migration.id})`);
      try {
        await migration.up();
        console.log(`✓ Migration ${migration.id} completed successfully`);
      } catch (error) {
        console.error(`✗ Migration ${migration.id} failed:`, error);
        throw error;
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log("✓ All migrations completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
};

export const rollbackMigrations = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI environment variable is not defined");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("✓ Connected to MongoDB");

    console.log("\nRolling back migrations...");
    console.log("=".repeat(50));

    for (let i = migrations.length - 1; i >= 0; i--) {
      const migration = migrations[i];
      if (migration.down) {
        console.log(
          `\nRolling back migration: ${migration.name} (${migration.id})`
        );
        try {
          await migration.down();
          console.log(`✓ Migration ${migration.id} rolled back successfully`);
        } catch (error) {
          console.error(
            `✗ Rollback of migration ${migration.id} failed:`,
            error
          );
          throw error;
        }
      } else {
        console.log(
          `\nSkipping rollback for migration ${migration.id} (no down migration defined)`
        );
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log("✓ All migrations rolled back successfully!");
  } catch (error) {
    console.error("Rollback failed:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
};

if (require.main === module) {
  const command = process.argv[2];

  if (command === "rollback") {
    rollbackMigrations();
  } else {
    runMigrations();
  }
}
