"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  PaperclipIcon,
  SendIcon,
  Moon,
  Sun,
  BookOpen,
  Package,
  Sparkles,
  RefreshCw,
  Award,
  Users,
  Video,
  MessageCircle,
  X,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      content: "Hello! I'm your AI tutor powered by Gemini Flash. How can I help you with your learning today?",
      sender: "bot",
      isError: false,
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const messagesEndRef = useRef(null)
  const { theme, setTheme } = useTheme()

  const [showResources, setShowResources] = useState(false)
  const [activeResourceTopic, setActiveResourceTopic] = useState("math")

  const fileInputRef = useRef(null)
  const [selectedFile, setSelectedFile] = useState(null)

  // Sample resources by topic
  const resourcesByTopic = {
    math: [
      { title: "Khan Academy - Mathematics", url: "https://www.khanacademy.org/math", type: "interactive" },
      { title: "Desmos Graphing Calculator", url: "https://www.desmos.com/calculator", type: "tool" },
      { title: "Math is Fun", url: "https://www.mathsisfun.com/", type: "reference" },
      { title: "Brilliant - Math Courses", url: "https://brilliant.org/courses/math/", type: "course" },
    ],
    science: [
      { title: "NASA Science", url: "https://science.nasa.gov/", type: "reference" },
      { title: "PhET Interactive Simulations", url: "https://phet.colorado.edu/", type: "interactive" },
      { title: "National Geographic", url: "https://www.nationalgeographic.com/science/", type: "articles" },
      {
        title: "Crash Course Science",
        url: "https://www.youtube.com/playlist?list=PL8dPuuaLjXtPAJr1ysd5yGIyiSFuh0mIL",
        type: "video",
      },
    ],
    history: [
      { title: "World History Encyclopedia", url: "https://www.worldhistory.org/", type: "reference" },
      { title: "History Channel", url: "https://www.history.com/", type: "articles" },
      { title: "Smithsonian History", url: "https://www.si.edu/explore/history", type: "interactive" },
      { title: "BBC History", url: "https://www.bbc.co.uk/history", type: "articles" },
    ],
    english: [
      { title: "Purdue Online Writing Lab", url: "https://owl.purdue.edu/", type: "reference" },
      { title: "Grammarly", url: "https://www.grammarly.com/", type: "tool" },
      { title: "Project Gutenberg", url: "https://www.gutenberg.org/", type: "books" },
      { title: "ThoughtCo English", url: "https://www.thoughtco.com/english-4133049", type: "articles" },
    ],
    programming: [
      { title: "MDN Web Docs", url: "https://developer.mozilla.org/", type: "reference" },
      { title: "freeCodeCamp", url: "https://www.freecodecamp.org/", type: "interactive" },
      { title: "GitHub Learning Lab", url: "https://lab.github.com/", type: "interactive" },
      { title: "Stack Overflow", url: "https://stackoverflow.com/", type: "community" },
    ],
    general: [
      { title: "Wikipedia", url: "https://www.wikipedia.org/", type: "reference" },
      { title: "Coursera", url: "https://www.coursera.org/", type: "courses" },
      { title: "edX", url: "https://www.edx.org/", type: "courses" },
      { title: "TED-Ed", url: "https://ed.ted.com/", type: "video" },
    ],
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const removeSelectedFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isGenerating || !inputValue.trim()) return

    // Add user message
    let messageContent = inputValue
    if (selectedFile) {
      const fileType = selectedFile.type.split("/")[0]
      const fileEmoji = fileType === "image" ? "🖼️" : fileType === "application" ? "📄" : "📎"
      messageContent += `\n\n${fileEmoji} Attached: ${selectedFile.name}`
    }

    // Update the user message with the file info
    const userMessage = {
      id: Date.now(),
      content: messageContent,
      sender: "user",
      attachment: selectedFile
        ? {
          name: selectedFile.name,
          type: selectedFile.type,
          size: selectedFile.size,
        }
        : null,
    }
    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsGenerating(true)
    setErrorMessage("")

    try {
      // Call the Gemini API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: inputValue }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to get response from AI")
      }

      const data = await response.json()

      // Format the response with Markdown-like enhancements
      const formattedContent = formatAIResponse(data.text)

      const botResponse = {
        id: Date.now() + 1,
        content: formattedContent,
        sender: "bot",
        model: data.model,
      }

      setMessages((prev) => [...prev, botResponse])
    } catch (error) {
      console.error("Error calling AI API:", error)
      setErrorMessage(error.message)

      const errorMessage = {
        id: Date.now() + 1,
        content: "Sorry, I couldn't process your request. Please try again.",
        sender: "bot",
        isError: true,
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsGenerating(false)
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  // Format AI responses to enhance readability
  const formatAIResponse = (text) => {
    // This is a simple formatter that could be expanded with more sophisticated parsing
    // For example, you could use a Markdown parser library for more complex formatting

    // Add bold to headings (lines that end with a colon)
    text = text.replace(/^(.+):$/gm, "<strong>$1:</strong>")

    // Convert asterisks to bold
    text = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")

    // Convert single asterisks to italic
    text = text.replace(/\*(.+?)\*(?!\*)/g, "<em>$1</em>")

    // Convert numbered lists
    text = text.replace(/^\d+\.\s(.+)$/gm, '<div class="ml-4">• $1</div>')

    // Convert bullet points
    text = text.replace(/^-\s(.+)$/gm, '<div class="ml-4">• $1</div>')

    // Add paragraph breaks
    text = text.replace(/\n\n/g, "</p><p>")

    // Wrap in paragraph tags
    text = `<p>${text}</p>`

    return text
  }

  const clearChat = async () => {
    // Reset conversation history on the server
    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resetHistory: true }),
      })
    } catch (error) {
      console.error("Error resetting conversation history:", error)
    }

    // Reset UI
    setMessages([
      {
        id: 1,
        content: "Hello! I'm your AI tutor powered by Gemini Flash. How can I help you with your learning today?",
        sender: "bot",
        isError: false,
      },
    ])
    setErrorMessage("")
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const handleTextareaKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Card className="h-[calc(100vh-4rem)] flex flex-col shadow-xl">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl flex items-center">
                <Avatar className="h-8 w-8 mr-2 bg-purple-100 dark:bg-purple-900">
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <span className="flex items-center">
                  Gemini Flash AI Tutor
                  <Sparkles className="h-4 w-4 ml-2 text-yellow-400" />
                </span>
              </CardTitle>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={clearChat} title="Clear chat history">
                  <RefreshCw className="h-5 w-5" />
                </Button>
                <Button
                  variant={showResources ? "secondary" : "ghost"}
                  size="icon"
                  title="Extra resources"
                  onClick={() => setShowResources(!showResources)}
                >
                  <Package className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {errorMessage && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${message.sender === "user"
                    ? "bg-purple-600 text-white"
                    : message.isError
                      ? "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                      : "bg-gray-100 dark:bg-gray-800"
                    }`}
                >
                  {message.model && (
                    <div className="flex items-center mb-1">
                      <Sparkles className="h-3 w-3 text-yellow-500 mr-1" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">{message.model}</span>
                    </div>
                  )}
                  {message.sender === "bot" && !message.isError ? (
                    <div
                      className="prose dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: message.content }}
                    ></div>
                  ) : (
                    <p>{message.content}</p>
                  )}
                </div>
              </div>
            ))}
            {isGenerating && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg p-4 bg-gray-100 dark:bg-gray-800">
                  <div className="flex space-x-2">
                    <div className="h-2 w-2 bg-purple-600 rounded-full animate-bounce"></div>
                    <div className="h-2 w-2 bg-purple-600 rounded-full animate-bounce delay-100"></div>
                    <div className="h-2 w-2 bg-purple-600 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>
          {showResources && (
            <div className="border-t border-b p-4 bg-gray-50 dark:bg-gray-800/50">
              {/* AI Recommendations Section */}
              <div className="mb-6 bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-100 dark:border-purple-800">
                <h3 className="text-lg font-medium mb-2 flex items-center text-purple-800 dark:text-purple-300">
                  <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
                  AI Recommended Resources
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Based on your recent questions, these resources might help you:
                </p>
                <div className="grid grid-cols-1 gap-3">
                  <a
                    href="https://www.khanacademy.org/math/algebra"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-3 rounded-lg bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors"
                  >
                    <div className="mr-3 bg-purple-100 dark:bg-purple-900/50 p-2 rounded-full">
                      <Award className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium">Khan Academy: Algebra Fundamentals</div>
                      <div className="text-xs text-purple-600 dark:text-purple-400">
                        Highly Relevant • Interactive Course
                      </div>
                    </div>
                  </a>
                  <a
                    href="https://www.youtube.com/playlist?list=PLmdFyQYShrjfPLdHQxuNWvh2ct666Na2"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-3 rounded-lg bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors"
                  >
                    <div className="mr-3 bg-purple-100 dark:bg-purple-900/50 p-2 rounded-full">
                      <Video className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium">Visual Algebra Explanations</div>
                      <div className="text-xs text-purple-600 dark:text-purple-400">Recommended • Video Series</div>
                    </div>
                  </a>
                </div>
              </div>

              {/* Regular Resources Section */}
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Learning Resources by Topic</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(resourcesByTopic).map((topic) => (
                    <Button
                      key={topic}
                      variant={activeResourceTopic === topic ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => setActiveResourceTopic(topic)}
                      className="capitalize"
                    >
                      {topic}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {resourcesByTopic[activeResourceTopic].map((resource, index) => (
                  <a
                    key={index}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="mr-3 bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full">
                      {resource.type === "interactive" && <Sparkles className="h-4 w-4 text-purple-600" />}
                      {resource.type === "reference" && <BookOpen className="h-4 w-4 text-purple-600" />}
                      {resource.type === "video" && <Video className="h-4 w-4 text-purple-600" />}
                      {resource.type === "tool" && <Package className="h-4 w-4 text-purple-600" />}
                      {resource.type === "articles" && <MessageCircle className="h-4 w-4 text-purple-600" />}
                      {resource.type === "course" && <Award className="h-4 w-4 text-purple-600" />}
                      {resource.type === "books" && <BookOpen className="h-4 w-4 text-purple-600" />}
                      {resource.type === "community" && <Users className="h-4 w-4 text-purple-600" />}
                      {![
                        "interactive",
                        "reference",
                        "video",
                        "tool",
                        "articles",
                        "course",
                        "books",
                        "community",
                      ].includes(resource.type) && <Package className="h-4 w-4 text-purple-600" />}
                    </div>
                    <div>
                      <div className="font-medium">{resource.title}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{resource.type}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
          <CardFooter className="border-t p-4">
            <form onSubmit={handleSubmit} className="flex w-full space-x-2">
              <div className="relative flex-none">
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" id="file-upload" />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="flex-none"
                  title="Attach file"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <PaperclipIcon className="h-5 w-5" />
                </Button>

                {selectedFile && (
                  <div className="absolute bottom-full mb-2 left-0 bg-white dark:bg-gray-800 rounded-md shadow-md p-2 min-w-[200px] border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center truncate">
                        <span className="text-xs font-medium truncate mr-2">{selectedFile.name}</span>
                        <span className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={removeSelectedFile}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleTextareaKeyDown}
                placeholder="Ask me anything about your studies..."
                className="flex-1 min-h-[2.5rem] max-h-[10rem] resize-none"
              />
              <Button
                type="submit"
                size="icon"
                disabled={isGenerating || !inputValue.trim()}
                className="flex-none bg-purple-600 hover:bg-purple-700"
              >
                <SendIcon className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">Powered by Google Gemini Flash</p>
      </div>
    </div>
  )
}
