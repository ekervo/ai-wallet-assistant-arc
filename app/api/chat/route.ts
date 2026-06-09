import { askDeepseek } from "../../../lib/deepseek";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return Response.json({
        reply: "Please enter a message.",
        intent: null,
      });
    }

    const response = await askDeepseek(message);
    const data = JSON.parse(response || "{}");

    return Response.json(data);
  } catch {
    return Response.json(
      {
        reply: "AI processing failed. Please try again.",
        intent: null,
      },
      { status: 500 }
    );
  }
}