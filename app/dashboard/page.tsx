"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import {
  Video,
  MessageCircle,
  Plus,
  Trash2,
  Calendar,
  Award,
  BarChart,
  Sparkles,
  Loader2,
  BrainCircuit,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function DashboardPage() {
  const [tasks, setTasks] = useState([
    { id: 1, text: "Read for 20 minutes", completed: false },
    { id: 2, text: "Solve 5 math problems", completed: false },
    { id: 3, text: "Draw a picture", completed: false },
  ])

  const [streak, setStreak] = useState(0)
  const [completedDates, setCompletedDates] = useState([])
  const [progress, setProgress] = useState(0)
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false)
  const [taskError, setTaskError] = useState("")

  // AI Task Generation state
  const [taskSubject, setTaskSubject] = useState("math")
  const [customSubject, setCustomSubject] = useState("")
  const [useCustomSubject, setUseCustomSubject] = useState(false)
  const [taskDifficulty, setTaskDifficulty] = useState("medium")
  const [taskCount, setTaskCount] = useState("3")
  const [showAIDialog, setShowAIDialog] = useState(false)

  useEffect(() => {
    // Calculate progress based on completed tasks
    const completedCount = tasks.filter((task) => task.completed).length
    const newProgress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0
    setProgress(newProgress)
  }, [tasks])

  const toggleTaskCompletion = (id) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
  }

  const addTask = () => {
    const taskText = prompt("Enter a new task:")
    if (taskText) {
      const newTask = {
        id: tasks.length ? Math.max(...tasks.map((t) => t.id)) + 1 : 1,
        text: taskText,
        completed: false,
      }
      setTasks([...tasks, newTask])
    }
  }

  const removeTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id))
  }

  const toggleDateCompletion = (dateString) => {
    if (completedDates.includes(dateString)) {
      setCompletedDates(completedDates.filter((d) => d !== dateString))
    } else {
      setCompletedDates([...completedDates, dateString])
    }

    // Update streak
    const newStreak = completedDates.length + (completedDates.includes(dateString) ? -1 : 1)
    setStreak(newStreak)
  }

  // Generate AI tasks
  const generateAITasks = async () => {
    setIsGeneratingTasks(true)
    setTaskError("")

    // Determine which subject to use (custom or predefined)
    const subjectToUse = useCustomSubject ? customSubject : taskSubject

    if (useCustomSubject && !customSubject.trim()) {
      setTaskError("Please enter a custom subject")
      setIsGeneratingTasks(false)
      return
    }

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: subjectToUse,
          difficulty: taskDifficulty,
          count: Number.parseInt(taskCount),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate tasks")
      }

      const data = await response.json()

      // Add the AI-generated tasks to the task list
      const newTasks = data.tasks.map((task, index) => ({
        id: tasks.length ? Math.max(...tasks.map((t) => t.id)) + index + 1 : index + 1,
        text: task.text,
        completed: false,
        isAIGenerated: true,
      }))

      setTasks([...tasks, ...newTasks])
      setShowAIDialog(false)
    } catch (error) {
      console.error("Error generating AI tasks:", error)
      setTaskError(error.message || "Failed to generate tasks")
    } finally {
      setIsGeneratingTasks(false)
    }
  }

  // Reset dialog state when opened
  const handleDialogOpenChange = (open) => {
    if (open) {
      // Reset error state when opening dialog
      setTaskError("")
    }
    setShowAIDialog(open)
  }

  // Generate calendar days
  const generateCalendarDays = () => {
    const today = new Date()
    const days = []

    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(today.getDate() - i)
      const dateString = date.toISOString().split("T")[0]
      const isToday = i === 0

      days.push({
        date,
        dateString,
        day: date.getDate(),
        isToday,
        isCompleted: completedDates.includes(dateString),
      })
    }

    return days
  }

  const calendarDays = generateCalendarDays()

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container px-4 py-8 mx-auto">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Super Kid Progress Tracker
          </h1>
          <div className="inline-flex items-center bg-white dark:bg-gray-800 px-6 py-3 rounded-full shadow-lg">
            <span className="text-3xl animate-pulse">🔥</span>
            <span className="text-2xl font-bold text-red-500 mx-2">{streak}</span>
            <span className="text-xl text-purple-600 dark:text-purple-400">Day Streak!</span>
          </div>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Calendar Section */}
          <Card className="shadow-lg border-purple-100 dark:border-purple-900">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Calendar className="mr-2 h-6 w-6 text-purple-600" />
                Daily Challenges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4 text-purple-600 dark:text-purple-400 font-medium">
                {new Date().toLocaleString("default", { month: "long" })} {new Date().getFullYear()}
              </div>
              <div className="grid grid-cols-7 gap-3">
                {calendarDays.map((day) => (
                  <button
                    key={day.dateString}
                    onClick={() => toggleDateCompletion(day.dateString)}
                    className={`h-12 flex items-center justify-center rounded-lg cursor-pointer transition-colors
                      ${day.isToday ? "bg-purple-100 dark:bg-purple-900/50" : "bg-gray-100 dark:bg-gray-800"}
                      ${day.isCompleted ? "bg-green-400 dark:bg-green-600 text-white" : ""}
                    `}
                  >
                    {day.day}
                    {day.isToday ? " 🎯" : ""}
                  </button>
                ))}
              </div>
              <p className="mt-4 text-sm text-center text-purple-500 dark:text-purple-400">
                Tap the days to mark completed challenges! ⭐
              </p>
            </CardContent>
          </Card>

          {/* Progress Section */}
          <Card className="shadow-lg border-purple-100 dark:border-purple-900">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Award className="mr-2 h-6 w-6 text-purple-600" />
                Task Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="text-center">
                  <div className="relative w-48 h-48 mx-auto">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle
                        className="text-purple-100 dark:text-purple-900/50"
                        strokeWidth="10"
                        stroke="currentColor"
                        fill="transparent"
                        r="40"
                        cx="50"
                        cy="50"
                      />
                      <circle
                        className="text-purple-600 dark:text-purple-400"
                        strokeWidth="10"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress / 100)}`}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="40"
                        cx="50"
                        cy="50"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">{progress}%</div>
                      <div className="text-lg text-purple-500 dark:text-purple-300">Tasks Done!</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Reading</span>
                    <span>75%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Math</span>
                    <span>60%</span>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Science</span>
                    <span>85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Task Management Section */}
        <Card className="shadow-lg border-purple-100 dark:border-purple-900 mb-12">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center text-2xl">
              <BarChart className="mr-2 h-6 w-6 text-purple-600" />
              Today's Awesome Tasks
            </CardTitle>
            <div className="flex space-x-2">
              <Dialog open={showAIDialog} onOpenChange={handleDialogOpenChange}>
                <DialogTrigger asChild>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <BrainCircuit className="mr-2 h-4 w-4" /> AI Tasks
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Generate AI Learning Tasks</DialogTitle>
                    <DialogDescription>Let our AI tutor suggest personalized learning tasks for you.</DialogDescription>
                  </DialogHeader>

                  {taskError && (
                    <Alert variant="destructive">
                      <AlertDescription>{taskError}</AlertDescription>
                    </Alert>
                  )}

                  <div className="grid gap-4 py-4">
                    {/* Subject Selection - Radio Group for Custom vs Predefined */}
                    <div className="space-y-4">
                      <Label>Subject Type</Label>
                      <RadioGroup
                        defaultValue="predefined"
                        value={useCustomSubject ? "custom" : "predefined"}
                        onValueChange={(value) => setUseCustomSubject(value === "custom")}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="predefined" id="predefined" />
                          <Label htmlFor="predefined" className="cursor-pointer">
                            Choose from list
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="custom" id="custom" />
                          <Label htmlFor="custom" className="cursor-pointer">
                            Custom subject
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Predefined Subject Dropdown */}
                    {!useCustomSubject && (
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="subject" className="text-right">
                          Subject
                        </Label>
                        <Select value={taskSubject} onValueChange={setTaskSubject}>
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="math">Mathematics</SelectItem>
                            <SelectItem value="science">Science</SelectItem>
                            <SelectItem value="english">English</SelectItem>
                            <SelectItem value="history">History</SelectItem>
                            <SelectItem value="art">Art</SelectItem>
                            <SelectItem value="music">Music</SelectItem>
                            <SelectItem value="programming">Programming</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Custom Subject Input */}
                    {useCustomSubject && (
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="customSubject" className="text-right">
                          Custom Subject
                        </Label>
                        <Input
                          id="customSubject"
                          value={customSubject}
                          onChange={(e) => setCustomSubject(e.target.value)}
                          placeholder="Enter any subject or topic..."
                          className="col-span-3"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="difficulty" className="text-right">
                        Difficulty
                      </Label>
                      <Select value={taskDifficulty} onValueChange={setTaskDifficulty}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="challenging">Challenging</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="count" className="text-right">
                        Number of Tasks
                      </Label>
                      <Select value={taskCount} onValueChange={setTaskCount}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select count" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Task</SelectItem>
                          <SelectItem value="2">2 Tasks</SelectItem>
                          <SelectItem value="3">3 Tasks</SelectItem>
                          <SelectItem value="5">5 Tasks</SelectItem>
                          <SelectItem value="10">10 Tasks</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={generateAITasks}
                      disabled={isGeneratingTasks}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {isGeneratingTasks ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate Tasks
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button onClick={addTask} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="mr-2 h-4 w-4" /> Add Task
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center space-x-4 p-4 rounded-lg ${
                    task.isAIGenerated
                      ? "bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50"
                      : "bg-purple-50 dark:bg-gray-800 hover:bg-purple-100 dark:hover:bg-gray-700"
                  } transition-colors`}
                >
                  <Checkbox
                    id={`task-${task.id}`}
                    checked={task.completed}
                    onCheckedChange={() => toggleTaskCompletion(task.id)}
                    className="data-[state=checked]:bg-purple-600"
                  />
                  <label
                    htmlFor={`task-${task.id}`}
                    className={`flex-1 cursor-pointer ${task.completed ? "line-through text-gray-500" : ""}`}
                  >
                    <div className="flex items-center">
                      {task.text}
                      {task.isAIGenerated && <Sparkles className="ml-2 h-3 w-3 text-purple-600 dark:text-purple-400" />}
                    </div>
                  </label>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTask(task.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {tasks.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No tasks yet. Click "Add Task" or "AI Tasks" to create one!
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Floating Action Buttons */}
        <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-50">
          <Link href="/video">
            <Button className="rounded-full w-12 h-12 md:w-auto md:h-auto md:rounded-lg md:px-4 bg-red-500 hover:bg-red-600">
              <Video className="h-5 w-5 md:mr-2" />
              <span className="hidden md:inline">Video Call</span>
            </Button>
          </Link>
          <Link href="/chat">
            <Button className="rounded-full w-12 h-12 md:w-auto md:h-auto md:rounded-lg md:px-4 bg-purple-600 hover:bg-purple-700">
              <MessageCircle className="h-5 w-5 md:mr-2" />
              <span className="hidden md:inline">Chat Buddy</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
