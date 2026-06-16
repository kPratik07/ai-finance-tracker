import dns from "dns";
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Some ISP/router DNS servers reject Node.js SRV lookups (querySrv ECONNREFUSED).
    if (process.env.MONGODB_URI?.startsWith("mongodb+srv://")) {
      dns.setServers(
        process.env.DNS_SERVERS?.split(",").map((s) => s.trim()).filter(Boolean) ?? [
          "8.8.8.8",
          "8.8.4.4",
          "1.1.1.1",
        ]
      );
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
