import { NextResponse } from "next/server"
import { generateGeminiResponse, resetConversationHistory } from "@/utils/gemini-api"

export async function POST(request: Request) {
  try {
    const { message, resetHistory } = await request.json()

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Invalid request: message is required" }, { status: 400 })
    }

    // Reset conversation history if requested
    if (resetHistory) {
      resetConversationHistory()
      return NextResponse.json({ success: true, message: "Conversation history reset" })
    }

    // Call the Gemini API
    const response = await generateGeminiResponse(message)

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error in chat API:", error)

    // Check if the error is related to missing API key
    if (error instanceof Error && error.message.includes("API_KEY")) {
      return NextResponse.json(
        { error: "API key not configured. Please add your Gemini API key to the environment variables." },
        { status: 500 },
      )
    }

    // Return more detailed error information
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
