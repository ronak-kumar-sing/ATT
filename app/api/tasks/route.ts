import { NextResponse } from "next/server"
import { generateGeminiResponse } from "@/utils/gemini-api"

export async function POST(request: Request) {
  try {
    const { subject, difficulty, count } = await request.json()

    if (!subject || !difficulty || !count) {
      return NextResponse.json(
        { error: "Invalid request: subject, difficulty, and count are required" },
        { status: 400 },
      )
    }

    // Create a prompt for the Gemini API to generate educational tasks
    const prompt = `Generate ${count} educational tasks for a student studying ${subject} at a ${difficulty} difficulty level. 
    Each task should be specific, actionable, and help the student learn effectively.
    Return ONLY a plain JSON array of objects with 'text' property for each task.
    Example format: [{"text":"Read chapter 5 and summarize the main concepts"},{"text":"Solve practice problems 1-5"}]
    Do not include any markdown formatting, code blocks, or explanations - just the raw JSON array.`

    // Call the Gemini API
    const response = await generateGeminiResponse(prompt)

    // Parse the JSON from the response text
    let tasksJson = []

    try {
      // First, try to clean up the response to extract just the JSON part
      let jsonText = response.text

      // Remove markdown code blocks if present
      jsonText = jsonText.replace(/```(?:json)?\s*([\s\S]*?)\s*```/g, "$1")

      // Remove any explanatory text before or after the JSON array
      const arrayStartIndex = jsonText.indexOf("[")
      const arrayEndIndex = jsonText.lastIndexOf("]") + 1

      if (arrayStartIndex >= 0 && arrayEndIndex > arrayStartIndex) {
        jsonText = jsonText.substring(arrayStartIndex, arrayEndIndex)
      }

      // Now try to parse the cleaned JSON
      tasksJson = JSON.parse(jsonText)

      // Validate that we have an array of objects with 'text' property
      if (!Array.isArray(tasksJson) || !tasksJson.every((item) => typeof item === "object" && "text" in item)) {
        throw new Error("Response is not in the expected format")
      }
    } catch (error) {
      console.error("Error parsing AI response as JSON:", error, "Raw response:", response.text)

      // Fallback: Create a simple array of tasks from the text
      // Split by newlines and look for numbered items or bullet points
      const taskRegex = /(?:^|\n)(?:\d+\.|\*|-)\s*(.+?)(?=\n|$)/g
      const matches = [...response.text.matchAll(taskRegex)]

      if (matches.length > 0) {
        tasksJson = matches.map((match) => ({ text: match[1].trim() })).slice(0, count)
      } else {
        // Last resort: just split by newlines and take non-empty lines
        const lines = response.text
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line && !line.startsWith("```") && line.length > 5)
          .map((line) => ({ text: line.replace(/^\d+\.\s*/, "").trim() }))

        tasksJson = lines.slice(0, count)
      }
    }

    // Ensure we have the requested number of tasks (or fewer if not enough were generated)
    tasksJson = tasksJson.slice(0, count)

    // If we still have no tasks, create a generic fallback
    if (tasksJson.length === 0) {
      tasksJson = [
        { text: `Study ${subject} concepts at ${difficulty} level` },
        { text: `Practice ${subject} problems` },
        { text: `Review ${subject} notes` },
      ].slice(0, count)
    }

    return NextResponse.json({ tasks: tasksJson })
  } catch (error) {
    console.error("Error in tasks API:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
