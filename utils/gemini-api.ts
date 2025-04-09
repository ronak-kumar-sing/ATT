// Gemini API integration with enhanced prompting

export interface GeminiResponse {
  text: string
  model: string
}

// Store conversation history for context
let conversationHistory: { role: string; content: string }[] = []
const MAX_HISTORY_LENGTH = 10 // Limit history to prevent token limits

export async function generateGeminiResponse(message: string): Promise<GeminiResponse> {
  // Get the API key from environment variables
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in environment variables")
  }

  try {
    // Add the user message to conversation history
    conversationHistory.push({ role: "user", content: message })

    // Trim history if it gets too long
    if (conversationHistory.length > MAX_HISTORY_LENGTH) {
      conversationHistory = conversationHistory.slice(conversationHistory.length - MAX_HISTORY_LENGTH)
    }

    // Create a system prompt that guides the AI to be an educational tutor
    const systemPrompt = `You are an expert educational AI tutor with deep knowledge across all academic subjects.
    Your responses should be:
    1. Clear and easy to understand for students
    2. Accurate and factually correct
    3. Structured with examples and analogies when helpful
    4. Encouraging and supportive
    5. Concise but thorough

    If explaining complex topics, break them down into simpler components. If the student seems confused, offer alternative explanations.
    Always cite sources for factual information when possible.`

    // Format the conversation for the API request
    const formattedConversation = [
      {
        role: "user",
        parts: [{ text: systemPrompt }],
      },
    ]

    // Add conversation history for context
    conversationHistory.forEach((item) => {
      formattedConversation.push({
        role: item.role === "user" ? "user" : "model",
        parts: [{ text: item.content }],
      })
    })

    // Using the Gemini Flash model instead of Pro
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: formattedConversation,
          generationConfig: {
            temperature: 0.4, // Lower temperature for more focused, factual responses
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048, // Increased token limit for more detailed responses
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
          ],
        }),
      },
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Gemini API error:", JSON.stringify(errorData))
      throw new Error(`Gemini API error: ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()

    // Extract the response text from the Gemini API response
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI"

    // Add the AI response to conversation history
    conversationHistory.push({ role: "assistant", content: responseText })

    return {
      text: responseText,
      model: "Gemini Flash",
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error)
    throw error
  }
}

// Function to reset conversation history (useful when starting a new chat)
export function resetConversationHistory() {
  conversationHistory = []
}
