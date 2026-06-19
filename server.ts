import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import axios from "axios";
import fs from "fs";

// Load environment variables from .env file
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route - Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "Nvidia Nemotron proxy" });
  });

  // Helper to sanitize message order and content
  function sanitizeMessages(rawMessages: any[]): any[] {
    if (!Array.isArray(rawMessages)) return [];

    // Filter messages with valid roles
    let filtered = rawMessages.filter(
      (m) => m && typeof m === "object" && (m.role === "system" || m.role === "user" || m.role === "assistant")
    );

    // Filter out empty contents
    filtered = filtered.filter(m => typeof m.content === "string" && m.content.trim() !== "");

    // Remove any initial assistant messages because the conversation must start with a user/system message
    while (filtered.length > 0 && filtered[0].role === "assistant") {
      filtered.shift();
    }

    const sanitized: any[] = [];
    for (const msg of filtered) {
      if (msg.role === "system") {
        // Keep only the first system message at index 0
        if (!sanitized.some(s => s.role === "system")) {
          sanitized.push({ role: msg.role, content: msg.content });
        }
      } else {
        if (sanitized.length === 0) {
          if (msg.role === "user") {
            sanitized.push({ role: msg.role, content: msg.content });
          }
        } else {
          const last = sanitized[sanitized.length - 1];
          if (last.role === msg.role) {
            // Merge consecutive messages with the same role
            last.content = `${last.content}\n${msg.content}`;
          } else {
            sanitized.push({ role: msg.role, content: msg.content });
          }
        }
      }
    }

    return sanitized;
  }

  // Helper to validate sequence rules
  function validateMessages(messagesList: any[]): boolean {
    if (messagesList.length === 0) {
      throw new Error("Message cannot be empty after sanitization");
    }
    for (let i = 1; i < messagesList.length; i++) {
      if (messagesList[i].role === messagesList[i - 1].role) {
        throw new Error(`Invalid role sequence: consecutive sequence of '${messagesList[i].role}' at index ${i}`);
      }
    }
    return true;
  }

  // API Route - Chat Completion Proxy using google/gemma-3n-e4b-it via Axios
  app.post("/api/ai/chat", async (req, res) => {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    // Sanitize and Validate Messages
    let sanitized;
    try {
      sanitized = sanitizeMessages(messages);
      validateMessages(sanitized);
    } catch (valErr: any) {
      console.error("Validation error for incoming messages:", valErr.message);
      return res.status(400).json({ error: valErr.message });
    }

    // Set headers for Server-Sent Events (SSE) streaming
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    const apiKey = process.env.NVIDIA_API_KEY;

    if (!apiKey || apiKey.trim() === "" || apiKey === "mock-key") {
      // Beautiful simulated payload if Nvidia key is empty or placeholder
      const simText = `⚠️ **NVIDIA_API_KEY is not configured in your environment.**

To activate real-time completions with the state-of-the-art **google/gemma-3n-e4b-it** model, please add your key to the \`.env\` file in your workspace:

\`\`\`env
NVIDIA_API_KEY=your_key_here
\`\`\`

---

### 🌸 Ayurvedic Ritusharya Suggestions (Simulated Mode):
Since you are in the **menstrual phase** right now, the body has a spike in **Vata** dosha:
- **Nourishment:** Favor digestive spice infusions like cumin, coriander, and fennel. Warm up meals and stay away from dry snacks!
- **Daily Rhythm:** Limit exhaustive physical fitness routines. Embrace yoga nidra or restorative breathing exercises (Pranayama).
- **Herbal support:** Sip organic licorice tea to naturally soothe and steady energy.`;

      const segments = simText.split(" ");
      for (let i = 0; i < segments.length; i++) {
        const payload = {
          choices: [
            {
              delta: {
                content: segments[i] + (i === segments.length - 1 ? "" : " "),
              },
            },
          ],
        };
        res.write(`data: ${JSON.stringify(payload)}\n\n`);
        await new Promise((resolve) => setTimeout(resolve, 20));
      }
      res.write("data: [DONE]\n\n");
      res.end();
      return;
    }

    try {
      const invokeUrl = "https://integrate.api.nvidia.com/v1/chat/completions";
      
      const headers = {
        "Authorization": `Bearer ${apiKey}`,
        "Accept": "text/event-stream",
        "Content-Type": "application/json"
      };

      const payload = {
        "model": "google/gemma-3n-e4b-it",
        "messages": sanitized,
        "max_tokens": 1024,
        "temperature": 0.20,
        "top_p": 0.70,
        "frequency_penalty": 0.00,
        "presence_penalty": 0.00,
        "stream": true
      };

      // 3. Log the exact messages array before API calls
      console.log("======================= PAYLOAD TO NVIDIA =======================");
      console.log(JSON.stringify(payload, null, 2));
      console.log("=================================================================");

      // Write initial log to trace the request
      const logPath = path.join(process.cwd(), "src", "stream.log");
      fs.writeFileSync(logPath, `=== Request at ${new Date().toISOString()} ===\nUrl: ${invokeUrl}\nPayload: ${JSON.stringify(payload)}\n\n`);

      const response = await axios.post(invokeUrl, payload, {
        headers,
        responseType: "stream"
      });

      fs.appendFileSync(logPath, `=== Response Status: ${response.status} ===\n`);

      // Forward chunks from NVIDIA streaming endpoints straight to frontend
      response.data.on("data", (chunk: any) => {
        const chunkStr = chunk.toString();
        fs.appendFileSync(logPath, `Chunk received: ${chunkStr}\n`);
        res.write(chunk);
      });

      response.data.on("end", () => {
        fs.appendFileSync(logPath, "=== Stream finished normally ===\n");
        res.end();
      });

      response.data.on("error", (err: any) => {
        fs.appendFileSync(logPath, `=== Axios stream transport error: ${err.message || err} ===\n`);
        console.error("Axios stream transport error:", err);
        res.end();
      });

    } catch (err: any) {
      console.error("Error calling Nvidia integrated API:", err);
      
      let errorMsg = err.message || "Unknown error";
      const logPath = path.join(process.cwd(), "src", "stream.log");

      if (err.response?.data) {
        try {
          if (typeof err.response.data.on === "function") {
            // Read body from stream
            const errorBuffer = await new Promise<Buffer>((resolve) => {
              const chunks: any[] = [];
              err.response.data.on("data", (chunk: any) => chunks.push(chunk));
              err.response.data.on("end", () => resolve(Buffer.concat(chunks)));
              err.response.data.on("error", () => resolve(Buffer.from("Failed to read error stream")));
            });
            errorMsg = errorBuffer.toString();
          } else {
            errorMsg = typeof err.response.data === "object" ? JSON.stringify(err.response.data) : err.response.data.toString();
          }
        } catch (readErr: any) {
          errorMsg = `Error reading response stream: ${readErr.message || readErr}`;
        }
      }

      fs.appendFileSync(logPath, `=== Error caught: ${errorMsg} ===\n`);
      
      const payload = {
        choices: [
          {
            delta: {
              content: `\n\n🔴 **NVIDIA API Connection Error:** ${errorMsg}\n\nPlease verify that your \`NVIDIA_API_KEY\` is valid and your application can make outgoing calls to \`https://integrate.api.nvidia.com\`.`,
            },
          },
        ],
      };
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
      res.write("data: [DONE]\n\n");
      res.end();
    }
  });

  // Vite Integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware loaded.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static distribution loaded.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
