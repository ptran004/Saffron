import { type ActionFunctionArgs } from "react-router";
import * as fs from "fs";
import * as path from "path";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { apiKey } = await request.json();

    if (!apiKey) {
      return Response.json({ error: "API key is required" }, { status: 400 });
    }

    const envPath = path.resolve(process.cwd(), ".env");
    let envContent = "";

    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, "utf-8");
    }

    const lines = envContent.split("\n");
    let keyExists = false;
    const newLines = lines.map((line) => {
      if (line.startsWith("SERPAPI_API_KEY=")) {
        keyExists = true;
        return `SERPAPI_API_KEY=${apiKey}`;
      }
      return line;
    });

    if (!keyExists) {
      newLines.push(`SERPAPI_API_KEY=${apiKey}`);
    }

    fs.writeFileSync(envPath, newLines.join("\n"));
    
    // Update process.env for the current session
    process.env.SERPAPI_API_KEY = apiKey;

    return Response.json({ success: true, message: "SerpAPI key updated successfully" });
  } catch (error) {
    console.error("Config API Error:", error);
    return Response.json(
      { error: "Failed to update configuration", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
