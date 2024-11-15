import mongoose, { Connection } from "mongoose";

let cachedConnection: Connection | null = null;

export async function connectMongoDB(): Promise<Connection> {
  if (cachedConnection && cachedConnection.readyState === 1) {
    return cachedConnection;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined in the environment variables.");
  }

  try {
    mongoose.set("strictQuery", false);

    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "echo-quest-db",
    });

    cachedConnection = mongoose.connection;

    if (!cachedConnection.listeners("connected").length) {
      cachedConnection.on("connected", () => {
        console.log("✅ MongoDB connection established successfully.");
      });

      cachedConnection.on("error", (error) => {
        console.error("❌ MongoDB connection error:", error);
      });

      cachedConnection.on("disconnected", () => {
        console.warn("⚠️ MongoDB disconnected.");
      });
    }

    if (
      !process
        .listeners("SIGINT")
        .some((listener) => listener.name === "mongoClose")
    ) {
      process.once("SIGINT", async function mongoClose() {
        console.log("🔄 Closing MongoDB connection due to app termination...");
        await mongoose.disconnect();
        process.exit(0);
      });
    }

    return cachedConnection;
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error);
    throw error;
  }
}
