"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Mic,
  MicOff,
  VideoIcon,
  VideoOff,
  PhoneOff,
  ScreenShare,
  MessageSquare,
  Users,
  MoreVertical,
  Hand,
  PresentationIcon,
  Layout,
  Grid,
  Maximize2,
  Minimize2,
  RepeatIcon as Record,
  Copy,
  UserPlus,
  X,
  Send,
  Pin,
  VolumeX,
  Shield,
  Clock,
  ImageIcon,
  Loader2,
  ArrowRight,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ScreenShareIcon as StopScreenShare,
} from "lucide-react"

// Mock data for participants
const MOCK_PARTICIPANTS = [
  {
    id: "host",
    name: "Dr. Smith",
    role: "Tutor",
    avatar: "/placeholder.svg?height=40&width=40",
    isHost: true,
  },
  {
    id: "student1",
    name: "Alex Johnson",
    role: "Student",
    avatar: "/placeholder.svg?height=40&width=40",
    isHost: false,
  },
  {
    id: "student2",
    name: "Sarah Williams",
    role: "Student",
    avatar: "/placeholder.svg?height=40&width=40",
    isHost: false,
  },
]

export default function VideoCallPage() {
  // Session state
  const [sessionState, setSessionState] = useState("setup") // setup, joining, active, ended
  const [userName, setUserName] = useState("")
  const [roomCode, setRoomCode] = useState("")
  const [isCreatingRoom, setIsCreatingRoom] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [sessionStartTime, setSessionStartTime] = useState(null)
  const [sessionDuration, setSessionDuration] = useState("00:00")

  // Media state
  const [cameraEnabled, setCameraEnabled] = useState(true)
  const [micEnabled, setMicEnabled] = useState(true)
  const [screenShareActive, setScreenShareActive] = useState(false)
  const [handRaised, setHandRaised] = useState(false)
  const [recordingActive, setRecordingActive] = useState(false)
  const [fullScreenActive, setFullScreenActive] = useState(false)
  const [selectedCamera, setSelectedCamera] = useState("")
  const [selectedMic, setSelectedMic] = useState("")
  const [availableCameras, setAvailableCameras] = useState([])
  const [availableMics, setAvailableMics] = useState([])
  const [cameraStream, setCameraStream] = useState(null)
  const [screenStream, setScreenStream] = useState(null)
  const [activeStream, setActiveStream] = useState(null)

  // UI state
  const [chatOpen, setChatOpen] = useState(false)
  const [participantsOpen, setParticipantsOpen] = useState(false)
  const [viewLayout, setViewLayout] = useState("grid") // grid, spotlight
  const [pinnedParticipant, setPinnedParticipant] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [messageInput, setMessageInput] = useState("")
  const [participants, setParticipants] = useState([])

  // Refs
  const containerRef = useRef(null)
  const localVideoRef = useRef(null)
  const chatEndRef = useRef(null)

  // Initialize media devices
  useEffect(() => {
    async function initializeDevices() {
      try {
        // Get list of media devices
        const devices = await navigator.mediaDevices.enumerateDevices()

        // Filter cameras and microphones
        const cameras = devices
          .filter((device) => device.kind === "videoinput")
          .map((device) => ({
            id: device.deviceId,
            label: device.label || `Camera ${device.deviceId.substring(0, 5)}...`,
          }))

        const mics = devices
          .filter((device) => device.kind === "audioinput")
          .map((device) => ({
            id: device.deviceId,
            label: device.label || `Microphone ${device.deviceId.substring(0, 5)}...`,
          }))

        setAvailableCameras(cameras)
        setAvailableMics(mics)

        // Set defaults if available
        if (cameras.length > 0) setSelectedCamera(cameras[0].id)
        if (mics.length > 0) setSelectedMic(mics[0].id)
      } catch (err) {
        console.error("Error getting media devices:", err)
        setErrorMessage("Could not access media devices. Please check your browser permissions.")
      }
    }

    initializeDevices()

    // Cleanup function
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop())
      }
      if (screenStream) {
        screenStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  // Start camera preview
  useEffect(() => {
    async function startCameraPreview() {
      // Stop any existing streams
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop())
      }

      if (!selectedCamera && !selectedMic) return

      try {
        // Request camera and microphone access
        const constraints = {
          audio: selectedMic ? { deviceId: { exact: selectedMic } } : false,
          video: selectedCamera ? { deviceId: { exact: selectedCamera } } : false,
        }

        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        setCameraStream(stream)
        setActiveStream(stream)

        // Update video element
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }

        // Set success message
        setSuccessMessage("Camera and microphone connected successfully")
        setTimeout(() => setSuccessMessage(""), 3000)
      } catch (err) {
        console.error("Error starting camera:", err)
        setErrorMessage("Could not start camera. Please check your permissions and try again.")
      }
    }

    if (sessionState === "setup") {
      startCameraPreview()
    }
  }, [selectedCamera, selectedMic, sessionState])

  // Update session duration
  useEffect(() => {
    if (sessionState !== "active" || !sessionStartTime) return

    const interval = setInterval(() => {
      const now = new Date()
      const diff = now - sessionStartTime
      const minutes = Math.floor(diff / 60000)
      const seconds = Math.floor((diff % 60000) / 1000)
      setSessionDuration(`${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`)
    }, 1000)

    return () => clearInterval(interval)
  }, [sessionState, sessionStartTime])

  // Scroll chat to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages])

  // Generate a random room code
  const generateRoomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let result = ""
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setRoomCode(result)
  }

  // Start or join a session
  const startSession = async (isNewSession = true) => {
    if (!userName.trim()) {
      setErrorMessage("Please enter your name")
      return
    }

    if (!isNewSession && !roomCode.trim()) {
      setErrorMessage("Please enter a room code")
      return
    }

    setSessionState("joining")
    setErrorMessage("")
    setIsCreatingRoom(true)

    try {
      // Generate room code if creating a new session
      if (isNewSession && !roomCode) {
        generateRoomCode()
      }

      // Simulate joining delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Set up participants
      const sessionParticipants = isNewSession
        ? [{ id: "you", name: userName, isHost: true, isSelf: true }]
        : [{ id: "you", name: userName, isHost: false, isSelf: true }, ...MOCK_PARTICIPANTS]

      setParticipants(sessionParticipants)

      // Add welcome message
      setChatMessages([
        {
          id: Date.now(),
          sender: "System",
          message: isNewSession
            ? `Welcome to your new session, ${userName}! Share the room code with others to invite them.`
            : `Welcome to the session, ${userName}!`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ])

      // Set session start time
      setSessionStartTime(new Date())

      // Update state
      setSessionState("active")
      setIsCreatingRoom(false)
    } catch (err) {
      console.error("Error starting session:", err)
      setErrorMessage("Could not start session. Please try again.")
      setSessionState("setup")
      setIsCreatingRoom(false)
    }
  }

  // End the current session
  const endSession = () => {
    // Stop all media tracks
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop())
    }
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop())
    }

    // Reset state
    setSessionState("ended")
    setCameraStream(null)
    setScreenStream(null)
    setActiveStream(null)
    setScreenShareActive(false)
  }

  // Return to setup screen
  const returnToSetup = () => {
    setSessionState("setup")
    setParticipants([])
    setChatMessages([])
    setSessionStartTime(null)
    setSessionDuration("00:00")
  }

  // Toggle camera
  const toggleCamera = () => {
    if (!cameraStream) return

    const videoTracks = cameraStream.getVideoTracks()
    if (videoTracks.length === 0) return

    const newState = !cameraEnabled
    videoTracks.forEach((track) => {
      track.enabled = newState
    })

    setCameraEnabled(newState)
  }

  // Toggle microphone
  const toggleMicrophone = () => {
    if (!cameraStream) return

    const audioTracks = cameraStream.getAudioTracks()
    if (audioTracks.length === 0) return

    const newState = !micEnabled
    audioTracks.forEach((track) => {
      track.enabled = newState
    })

    setMicEnabled(newState)
  }

  // Toggle screen sharing
  const toggleScreenShare = async () => {
    if (screenShareActive) {
      // Stop screen sharing
      if (screenStream) {
        screenStream.getTracks().forEach((track) => track.stop())
      }

      setScreenStream(null)
      setActiveStream(cameraStream)
      setScreenShareActive(false)

      // Update local video
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = cameraStream
      }

      // Add system message
      addSystemMessage(`${userName} stopped sharing their screen`)

      return
    }

    try {
      // Try to get screen share stream
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      })

      // Add audio tracks from camera stream if available
      if (cameraStream) {
        const audioTracks = cameraStream.getAudioTracks()
        audioTracks.forEach((track) => {
          stream.addTrack(track.clone())
        })
      }

      // Set screen stream
      setScreenStream(stream)
      setActiveStream(stream)
      setScreenShareActive(true)

      // Update local video
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      // Add system message
      addSystemMessage(`${userName} started sharing their screen`)

      // Handle user stopping share via browser UI
      stream.getVideoTracks()[0].onended = () => {
        toggleScreenShare()
      }
    } catch (err) {
      console.error("Error sharing screen:", err)

      // Don't show error message for permission errors, just use the fallback
      setErrorMessage("")

      // Create a simulated screen sharing experience instead
      simulateScreenSharing()

      // Show a notification about simulation mode
      setSuccessMessage("Screen sharing is running in simulation mode due to browser restrictions")
      setTimeout(() => setSuccessMessage(""), 5000)
    }
  }

  // Simulate screen sharing when actual API is not available
  const simulateScreenSharing = () => {
    // Create a canvas element to simulate a screen
    const canvas = document.createElement("canvas")
    canvas.width = 1280
    canvas.height = 720

    // Get canvas context and draw simulated screen content
    const ctx = canvas.getContext("2d")

    // Draw background
    ctx.fillStyle = "#f0f0f0"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw window-like elements
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(50, 50, 800, 500)
    ctx.strokeStyle = "#cccccc"
    ctx.lineWidth = 2
    ctx.strokeRect(50, 50, 800, 500)

    // Draw header bar
    ctx.fillStyle = "#6d28d9"
    ctx.fillRect(50, 50, 800, 40)

    // Draw window title
    ctx.fillStyle = "#ffffff"
    ctx.font = "16px sans-serif"
    ctx.fillText("AI Tutoring Tool - Screen Share Simulation", 70, 75)

    // Draw some content
    ctx.fillStyle = "#333333"
    ctx.font = "20px sans-serif"
    ctx.fillText("Screen sharing is being simulated", 100, 150)
    ctx.font = "16px sans-serif"
    ctx.fillText("This is a fallback when actual screen sharing is not available", 100, 180)
    ctx.fillText("in preview mode or restricted environments.", 100, 210)

    // Draw simulation notice
    ctx.fillStyle = "#ff5500"
    ctx.font = "bold 24px sans-serif"
    ctx.fillText("SIMULATION MODE", 100, 300)

    // Draw explanation
    ctx.fillStyle = "#333333"
    ctx.font = "16px sans-serif"
    ctx.fillText("The browser has restricted access to screen capture.", 100, 340)
    ctx.fillText("This would work normally in a deployed application.", 100, 370)

    // Draw some UI elements
    ctx.fillStyle = "#6d28d9"
    ctx.fillRect(100, 420, 200, 40)
    ctx.fillStyle = "#ffffff"
    ctx.fillText("Button Example", 140, 445)

    // Create a simulated stream from the canvas
    let stream
    try {
      // Try to get a stream from the canvas
      stream = canvas.captureStream(30)

      // Add audio tracks from camera stream if available
      if (cameraStream) {
        const audioTracks = cameraStream.getAudioTracks()
        audioTracks.forEach((track) => {
          stream.addTrack(track.clone())
        })
      }
    } catch (err) {
      console.error("Canvas capture not supported:", err)
      // If canvas.captureStream is not supported, just set the flag without a stream
      setScreenShareActive(true)
      addSystemMessage(`${userName} started sharing their screen (simulated)`)
      return
    }

    // Set screen stream
    setScreenStream(stream)
    setActiveStream(stream)
    setScreenShareActive(true)

    // Update local video if stream was created successfully
    if (localVideoRef.current && stream) {
      localVideoRef.current.srcObject = stream
    }

    // Add system message
    addSystemMessage(`${userName} started sharing their screen (simulated)`)

    // Start animation loop to make the simulation more dynamic
    let animationFrame = 0
    const animate = () => {
      animationFrame++

      // Update time
      const now = new Date()
      ctx.fillStyle = "#333333"
      ctx.fillRect(600, 70, 200, 30)
      ctx.fillStyle = "#ffffff"
      ctx.font = "14px sans-serif"
      ctx.fillText(now.toLocaleTimeString(), 650, 90)

      // Animate a small element
      const x = 400 + Math.sin(animationFrame / 30) * 50
      ctx.fillStyle = "#ff5500"
      ctx.beginPath()
      ctx.arc(x, 500, 10, 0, Math.PI * 2)
      ctx.fill()

      requestAnimationFrame(animate)
    }

    animate()
  }

  // Toggle hand raise
  const toggleHandRaise = () => {
    const newState = !handRaised
    setHandRaised(newState)

    if (newState) {
      addSystemMessage(`${userName} raised their hand`)
    } else {
      addSystemMessage(`${userName} lowered their hand`)
    }
  }

  // Toggle recording
  const toggleRecording = () => {
    const newState = !recordingActive
    setRecordingActive(newState)

    if (newState) {
      addSystemMessage(`${userName} started recording the session`)
    } else {
      addSystemMessage(`${userName} stopped recording`)
    }
  }

  // Toggle fullscreen
  const toggleFullScreen = () => {
    if (!containerRef.current) return

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`)
      })
    } else {
      document.exitFullscreen()
    }

    setFullScreenActive(!fullScreenActive)
  }

  // Toggle chat panel
  const toggleChat = () => {
    setChatOpen(!chatOpen)
    if (participantsOpen) setParticipantsOpen(false)
  }

  // Toggle participants panel
  const toggleParticipants = () => {
    setParticipantsOpen(!participantsOpen)
    if (chatOpen) setChatOpen(false)
  }

  // Pin/unpin participant
  const togglePinParticipant = (participantId) => {
    if (pinnedParticipant === participantId) {
      setPinnedParticipant(null)
      setViewLayout("grid")
    } else {
      setPinnedParticipant(participantId)
      setViewLayout("spotlight")
    }
  }

  // Send chat message
  const sendChatMessage = (e) => {
    e.preventDefault()

    if (!messageInput.trim()) return

    const newMessage = {
      id: Date.now(),
      sender: userName,
      message: messageInput,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isSelf: true,
    }

    setChatMessages([...chatMessages, newMessage])
    setMessageInput("")

    // Simulate response in 1-3 seconds if in a joined session
    if (sessionState === "active" && participants.length > 1) {
      setTimeout(
        () => {
          const responses = [
            "That's a good point!",
            "I understand what you're saying.",
            "Could you elaborate on that?",
            "Let me think about that for a moment.",
            "That's interesting, I hadn't considered that perspective.",
          ]

          const responseMessage = {
            id: Date.now(),
            sender: MOCK_PARTICIPANTS[0].name,
            message: responses[Math.floor(Math.random() * responses.length)],
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            isSelf: false,
          }

          setChatMessages((prev) => [...prev, responseMessage])
        },
        1000 + Math.random() * 2000,
      )
    }
  }

  // Add system message to chat
  const addSystemMessage = (message) => {
    const systemMessage = {
      id: Date.now(),
      sender: "System",
      message: message,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isSystem: true,
    }

    setChatMessages([...chatMessages, systemMessage])
  }

  // Copy room code to clipboard
  const copyRoomCode = () => {
    navigator.clipboard
      .writeText(roomCode)
      .then(() => {
        setSuccessMessage("Room code copied to clipboard")
        setTimeout(() => setSuccessMessage(""), 3000)
      })
      .catch((err) => {
        console.error("Failed to copy room code:", err)
        setErrorMessage("Failed to copy room code")
      })
  }

  // Render setup screen
  const renderSetupScreen = () => {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Join Video Session</CardTitle>
            <CardDescription>Set up your audio and video before joining</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {errorMessage && (
              <Alert variant="destructive" className="text-sm">
                <AlertCircle className="h-4 w-4 mr-2" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            {successMessage && (
              <Alert className="bg-green-500/10 text-green-500 border-green-500/20 text-sm">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="user-name">Your Name</Label>
              <Input
                id="user-name"
                placeholder="Enter your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>

            <Tabs defaultValue="join" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="join">Join Session</TabsTrigger>
                <TabsTrigger value="create">Create Session</TabsTrigger>
              </TabsList>

              <TabsContent value="join" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="room-code">Room Code</Label>
                  <Input
                    id="room-code"
                    placeholder="Enter room code"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  />
                </div>

                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={() => startSession(false)}
                  disabled={isCreatingRoom}
                >
                  {isCreatingRoom ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Join Session
                    </>
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="create" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="new-room-code">Room Code (Optional)</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="new-room-code"
                      placeholder="Auto-generate code"
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    />
                    <Button variant="outline" size="icon" onClick={generateRoomCode} title="Generate random code">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={() => startSession(true)}
                  disabled={isCreatingRoom}
                >
                  {isCreatingRoom ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Session
                    </>
                  )}
                </Button>
              </TabsContent>
            </Tabs>

            <Separator />

            <div className="space-y-4">
              <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden relative">
                {cameraStream ? (
                  <video ref={localVideoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <VideoIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Camera preview</p>
                    </div>
                  </div>
                )}

                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  <Button
                    variant={micEnabled ? "outline" : "destructive"}
                    size="icon"
                    className="h-10 w-10 rounded-full bg-black/50 text-white hover:bg-black/70"
                    onClick={toggleMicrophone}
                  >
                    {micEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                  </Button>

                  <Button
                    variant={cameraEnabled ? "outline" : "destructive"}
                    size="icon"
                    className="h-10 w-10 rounded-full bg-black/50 text-white hover:bg-black/70"
                    onClick={toggleCamera}
                  >
                    {cameraEnabled ? <VideoIcon className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mic-select">Microphone</Label>
                  <Select value={selectedMic} onValueChange={setSelectedMic}>
                    <SelectTrigger id="mic-select">
                      <SelectValue placeholder="Select microphone" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableMics.map((mic) => (
                        <SelectItem key={mic.id} value={mic.id}>
                          {mic.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="camera-select">Camera</Label>
                  <Select value={selectedCamera} onValueChange={setSelectedCamera}>
                    <SelectTrigger id="camera-select">
                      <SelectValue placeholder="Select camera" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCameras.map((camera) => (
                        <SelectItem key={camera.id} value={camera.id}>
                          {camera.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render session ended screen
  const renderSessionEndedScreen = () => {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Session Ended</CardTitle>
            <CardDescription>Your video session has ended</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-red-500/20 p-6">
                <PhoneOff className="h-12 w-12 text-red-500" />
              </div>
            </div>

            <div>
              <p className="text-lg font-medium">Session duration: {sessionDuration}</p>
              <p className="text-gray-500 mt-1">Thank you for using AI Tutoring Tool</p>
            </div>
          </CardContent>

          <CardFooter className="flex justify-center">
            <Button className="bg-purple-600 hover:bg-purple-700" onClick={returnToSetup}>
              Start New Session
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Render active session UI
  const renderActiveSession = () => {
    return (
      <div ref={containerRef} className="min-h-screen bg-gray-900 flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 p-2 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <VideoIcon className="h-5 w-5 text-purple-400 mr-2" />
              <span className="text-white font-medium hidden sm:inline">AI Tutoring Session</span>
            </div>
            <Badge variant="outline" className="text-gray-300 border-gray-600">
              <Clock className="h-3 w-3 mr-1" />
              {sessionDuration}
            </Badge>
            {roomCode && (
              <Badge variant="outline" className="text-gray-300 border-gray-600">
                <span className="mr-1">Room:</span>
                {roomCode}
              </Badge>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-300 hover:text-white hover:bg-gray-700 rounded-full"
                    onClick={copyRoomCode}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy room code</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-300 hover:text-white hover:bg-gray-700 rounded-full"
                >
                  <Shield className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-medium">Security Options</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="lock-meeting">Lock session</Label>
                      <Switch id="lock-meeting" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="waiting-room">Enable waiting room</Label>
                      <Switch id="waiting-room" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="allow-share">Allow participants to share screen</Label>
                      <Switch id="allow-share" defaultChecked />
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-300 hover:text-white hover:bg-gray-700 rounded-full"
                >
                  <UserPlus className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-medium">Invite People</h4>
                  <div className="flex space-x-2">
                    <Input value={roomCode} readOnly className="text-xs" />
                    <Button size="sm" onClick={copyRoomCode}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Or invite by email:</p>
                    <div className="flex space-x-2">
                      <Input placeholder="Email address" className="text-xs" />
                      <Button size="sm">
                        <Send className="h-4 w-4 mr-2" />
                        Send
                      </Button>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Video Grid */}
          <div className={`flex-1 p-4 ${chatOpen || participantsOpen ? "lg:mr-80" : ""}`}>
            {errorMessage && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500/90 text-white px-4 py-2 rounded-md shadow-lg flex items-center space-x-2 max-w-md">
                <span>{errorMessage}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-white hover:bg-red-600/50"
                  onClick={() => setErrorMessage("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {successMessage && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-500/90 text-white px-4 py-2 rounded-md shadow-lg flex items-center space-x-2 max-w-md">
                <span>{successMessage}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-white hover:bg-green-600/50"
                  onClick={() => setSuccessMessage("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Video Layout */}
            {viewLayout === "spotlight" && pinnedParticipant ? (
              <div className="grid grid-cols-1 gap-4 h-full">
                {/* Main spotlight video */}
                <div className="relative rounded-lg overflow-hidden h-full">
                  {renderParticipantVideo(
                    pinnedParticipant === "you"
                      ? { id: "you", name: userName, isSelf: true }
                      : participants.find((p) => p.id === pinnedParticipant),
                    true,
                  )}
                </div>

                {/* Strip of other participants */}
                <div className="absolute bottom-4 right-4 flex space-x-2 z-10">
                  {participants
                    .filter((p) => p.id !== pinnedParticipant)
                    .map((participant) => (
                      <div
                        key={participant.id}
                        className="w-32 h-24 rounded-lg overflow-hidden border-2 border-gray-700"
                      >
                        {renderParticipantVideo(participant, false)}
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <div
                className={`grid grid-cols-1 sm:grid-cols-2 gap-4 h-full ${participants.length > 4 ? "md:grid-cols-3 lg:grid-cols-4" : ""}`}
              >
                {/* Self view */}
                <div className="relative rounded-lg overflow-hidden">
                  {renderParticipantVideo({ id: "you", name: userName, isSelf: true }, false)}
                </div>

                {/* Other participants */}
                {participants
                  .filter((p) => !p.isSelf)
                  .map((participant) => (
                    <div key={participant.id} className="relative rounded-lg overflow-hidden">
                      {renderParticipantVideo(participant, false)}
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Side Panel (Chat or Participants) */}
          {(chatOpen || participantsOpen) && (
            <div className="w-full lg:w-80 bg-gray-800 border-l border-gray-700 flex flex-col absolute lg:relative right-0 top-0 bottom-0 z-20">
              <Tabs
                defaultValue={chatOpen ? "chat" : "participants"}
                className="flex flex-col h-full"
                onValueChange={(value) => {
                  if (value === "chat") {
                    setChatOpen(true)
                    setParticipantsOpen(false)
                  } else {
                    setChatOpen(false)
                    setParticipantsOpen(true)
                  }
                }}
              >
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="chat">Chat</TabsTrigger>
                    <TabsTrigger value="participants">Participants ({participants.length})</TabsTrigger>
                  </TabsList>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-white lg:hidden ml-2"
                    onClick={() => {
                      setChatOpen(false)
                      setParticipantsOpen(false)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <TabsContent value="chat" className="flex-1 flex flex-col p-0 m-0">
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {chatMessages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.isSelf ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              msg.isSelf
                                ? "bg-purple-600 text-white"
                                : msg.isSystem
                                  ? "bg-gray-600 text-white"
                                  : "bg-gray-700 text-white"
                            }`}
                          >
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-sm">{msg.sender}</span>
                              <span className="text-xs opacity-70">{msg.time}</span>
                            </div>
                            <p>{msg.message}</p>
                          </div>
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                    </div>
                  </ScrollArea>

                  <div className="p-4 border-t border-gray-700">
                    <form onSubmit={sendChatMessage} className="flex space-x-2">
                      <div className="relative flex-1">
                        <Input
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          placeholder="Type a message..."
                          className="pr-10"
                        />
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-gray-400 hover:text-gray-100"
                          >
                            <ImageIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <Button type="submit" size="icon" disabled={!messageInput.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </TabsContent>

                <TabsContent value="participants" className="flex-1 flex flex-col p-0 m-0">
                  <ScrollArea className="flex-1">
                    <div className="p-4 space-y-1">
                      {/* Self */}
                      <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-700">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-white">
                              {userName} <span className="text-xs text-gray-400">(You)</span>
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Other participants */}
                      {participants
                        .filter((p) => !p.isSelf)
                        .map((participant) => (
                          <div
                            key={participant.id}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-700"
                          >
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-8 w-8">
                                {participant.avatar ? (
                                  <AvatarImage src={participant.avatar} alt={participant.name} />
                                ) : (
                                  <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                                )}
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium text-white">
                                  {participant.name}{" "}
                                  {participant.isHost && <span className="text-xs text-gray-400">(Host)</span>}
                                </p>
                                {participant.role && <p className="text-xs text-gray-400">{participant.role}</p>}
                              </div>
                            </div>

                            <div className="flex items-center space-x-1">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-gray-400 hover:text-white"
                                      onClick={() => togglePinParticipant(participant.id)}
                                    >
                                      <Pin className="h-3.5 w-3.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{pinnedParticipant === participant.id ? "Unpin" : "Pin"}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-gray-400 hover:text-white"
                                  >
                                    <MoreVertical className="h-3.5 w-3.5" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-48">
                                  <div className="space-y-1">
                                    <Button variant="ghost" size="sm" className="w-full justify-start">
                                      <VolumeX className="h-4 w-4 mr-2" />
                                      Mute participant
                                    </Button>
                                    <Button variant="ghost" size="sm" className="w-full justify-start">
                                      <MessageSquare className="h-4 w-4 mr-2" />
                                      Message privately
                                    </Button>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </div>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="bg-gray-800 p-4 border-t border-gray-700">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={micEnabled ? "outline" : "destructive"}
                    size="icon"
                    className={`rounded-full h-10 w-10 ${micEnabled ? "hover:bg-gray-700" : ""}`}
                    onClick={toggleMicrophone}
                  >
                    {micEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{micEnabled ? "Turn off microphone" : "Turn on microphone"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={cameraEnabled ? "outline" : "destructive"}
                    size="icon"
                    className={`rounded-full h-10 w-10 ${cameraEnabled ? "hover:bg-gray-700" : ""}`}
                    onClick={toggleCamera}
                  >
                    {cameraEnabled ? <VideoIcon className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{cameraEnabled ? "Turn off camera" : "Turn on camera"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={screenShareActive ? "destructive" : "outline"}
                    size="icon"
                    className={`rounded-full h-10 w-10 ${!screenShareActive ? "hover:bg-gray-700" : ""}`}
                    onClick={toggleScreenShare}
                  >
                    {screenShareActive ? <StopScreenShare className="h-5 w-5" /> : <ScreenShare className="h-5 w-5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{screenShareActive ? "Stop sharing screen" : "Share screen"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={handRaised ? "secondary" : "outline"}
                    size="icon"
                    className={`rounded-full h-10 w-10 ${!handRaised ? "hover:bg-gray-700" : ""}`}
                    onClick={toggleHandRaise}
                  >
                    <Hand className={`h-5 w-5 ${handRaised ? "text-yellow-400" : ""}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{handRaised ? "Lower hand" : "Raise hand"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={recordingActive ? "destructive" : "outline"}
                    size="icon"
                    className={`rounded-full h-10 w-10 ${!recordingActive ? "hover:bg-gray-700" : ""}`}
                    onClick={toggleRecording}
                  >
                    <Record className={`h-5 w-5 ${recordingActive ? "text-red-500" : ""}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{recordingActive ? "Stop recording" : "Start recording"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full h-10 w-10 hover:bg-gray-700">
                  <Layout className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56">
                <div className="space-y-2">
                  <h4 className="font-medium">Layout Options</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={viewLayout === "grid" ? "secondary" : "outline"}
                      className="justify-start"
                      onClick={() => setViewLayout("grid")}
                    >
                      <Grid className="h-4 w-4 mr-2" />
                      Grid
                    </Button>
                    <Button
                      variant={viewLayout === "spotlight" ? "secondary" : "outline"}
                      className="justify-start"
                      onClick={() => setViewLayout("spotlight")}
                    >
                      <Maximize2 className="h-4 w-4 mr-2" />
                      Spotlight
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={chatOpen ? "secondary" : "outline"}
                    size="icon"
                    className={`rounded-full h-10 w-10 ${!chatOpen ? "hover:bg-gray-700" : ""}`}
                    onClick={toggleChat}
                  >
                    <MessageSquare className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{chatOpen ? "Close chat" : "Open chat"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={participantsOpen ? "secondary" : "outline"}
                    size="icon"
                    className={`rounded-full h-10 w-10 ${!participantsOpen ? "hover:bg-gray-700" : ""}`}
                    onClick={toggleParticipants}
                  >
                    <Users className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{participantsOpen ? "Close participants" : "Show participants"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full h-10 w-10 hover:bg-gray-700"
                    onClick={toggleFullScreen}
                  >
                    {fullScreenActive ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{fullScreenActive ? "Exit full screen" : "Enter full screen"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button variant="destructive" size="icon" className="rounded-full h-10 w-10" onClick={endSession}>
              <PhoneOff className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Helper function to render a participant video
  const renderParticipantVideo = (participant, isSpotlight) => {
    const { id, name, isSelf } = participant

    // Determine what to display based on screen sharing state
    if (isSelf) {
      if (screenShareActive) {
        return (
          <>
            <div className="w-full h-full bg-gray-900 flex items-center justify-center">
              <div className="text-center text-white">
                {activeStream && localVideoRef.current ? (
                  <video ref={localVideoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
                ) : (
                  <div className="p-4">
                    <PresentationIcon className="h-12 w-12 mx-auto mb-2 text-purple-400" />
                    <p className="text-lg font-semibold">Your Screen (Simulated)</p>
                    <p className="text-sm text-gray-400 mt-2">Screen sharing is being simulated in this environment</p>
                  </div>
                )}
              </div>
            </div>

            {/* Indicators */}
            <div className="absolute bottom-2 left-2 flex space-x-1">
              {!micEnabled && (
                <Badge variant="destructive" className="flex items-center space-x-1 px-1.5">
                  <MicOff className="h-3 w-3" />
                </Badge>
              )}
              {screenShareActive && (
                <Badge className="bg-green-600 flex items-center space-x-1 px-1.5">
                  <ScreenShare className="h-3 w-3" />
                </Badge>
              )}
              {pinnedParticipant === "you" && (
                <Badge className="bg-blue-600 flex items-center space-x-1 px-1.5">
                  <Pin className="h-3 w-3" />
                </Badge>
              )}
              {handRaised && (
                <Badge className="bg-yellow-600 flex items-center space-x-1 px-1.5">
                  <Hand className="h-3 w-3" />
                </Badge>
              )}
            </div>

            {/* Controls */}
            <div className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/70"
                      onClick={() => togglePinParticipant("you")}
                    >
                      <Pin className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{pinnedParticipant === "you" ? "Unpin" : "Pin"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </>
        )
      } else if (!cameraEnabled) {
        return (
          <>
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <div className="text-center text-white">
                <Avatar className={`${isSpotlight ? "h-24 w-24" : "h-16 w-16"} mx-auto mb-2`}>
                  <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                </Avatar>
                <p className={`${isSpotlight ? "text-xl" : "text-sm"} font-semibold`}>{name} (You)</p>
              </div>
            </div>

            {/* Indicators */}
            <div className="absolute bottom-2 left-2 flex space-x-1">
              {!micEnabled && (
                <Badge variant="destructive" className="flex items-center space-x-1 px-1.5">
                  <MicOff className="h-3 w-3" />
                </Badge>
              )}
              {pinnedParticipant === "you" && (
                <Badge className="bg-blue-600 flex items-center space-x-1 px-1.5">
                  <Pin className="h-3 w-3" />
                </Badge>
              )}
              {handRaised && (
                <Badge className="bg-yellow-600 flex items-center space-x-1 px-1.5">
                  <Hand className="h-3 w-3" />
                </Badge>
              )}
            </div>

            {/* Controls */}
            <div className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/70"
                      onClick={() => togglePinParticipant("you")}
                    >
                      <Pin className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{pinnedParticipant === "you" ? "Unpin" : "Pin"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </>
        )
      } else {
        return (
          <>
            <div className="w-full h-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center">
              {cameraStream ? (
                <video ref={localVideoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
              ) : (
                <div className="text-center text-white">
                  <Avatar className={`${isSpotlight ? "h-24 w-24" : "h-16 w-16"} mx-auto mb-2 border-2 border-white`}>
                    <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <p className={`${isSpotlight ? "text-xl" : "text-sm"} font-semibold`}>{name} (You)</p>
                </div>
              )}
            </div>

            {/* Indicators */}
            <div className="absolute bottom-2 left-2 flex space-x-1">
              {!micEnabled && (
                <Badge variant="destructive" className="flex items-center space-x-1 px-1.5">
                  <MicOff className="h-3 w-3" />
                </Badge>
              )}
              {pinnedParticipant === "you" && (
                <Badge className="bg-blue-600 flex items-center space-x-1 px-1.5">
                  <Pin className="h-3 w-3" />
                </Badge>
              )}
              {handRaised && (
                <Badge className="bg-yellow-600 flex items-center space-x-1 px-1.5">
                  <Hand className="h-3 w-3" />
                </Badge>
              )}
            </div>

            {/* Controls */}
            <div className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/70"
                      onClick={() => togglePinParticipant("you")}
                    >
                      <Pin className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{pinnedParticipant === "you" ? "Unpin" : "Pin"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </>
        )
      }
    } else {
      // Render other participants
      return (
        <>
          <div className="w-full h-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
            <div className="text-center text-white">
              <Avatar className={`${isSpotlight ? "h-24 w-24" : "h-16 w-16"} mx-auto mb-2 border-2 border-white`}>
                {participant.avatar ? (
                  <AvatarImage src={participant.avatar} alt={participant.name} />
                ) : (
                  <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                )}
              </Avatar>
              <p className={`${isSpotlight ? "text-xl" : "text-sm"} font-semibold`}>{participant.name}</p>
              {participant.role && (
                <p className={`${isSpotlight ? "text-sm" : "text-xs"} text-gray-200`}>{participant.role}</p>
              )}
            </div>
          </div>

          {/* Indicators */}
          <div className="absolute bottom-2 left-2 flex space-x-1">
            {pinnedParticipant === participant.id && (
              <Badge className="bg-blue-600 flex items-center space-x-1 px-1.5">
                <Pin className="h-3 w-3" />
              </Badge>
            )}
          </div>

          {/* Controls */}
          <div className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/70"
                    onClick={() => togglePinParticipant(participant.id)}
                  >
                    <Pin className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{pinnedParticipant === participant.id ? "Unpin" : "Pin"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </>
      )
    }
  }

  // Render the appropriate UI based on session state
  if (sessionState === "setup") {
    return renderSetupScreen()
  } else if (sessionState === "ended") {
    return renderSessionEndedScreen()
  } else {
    return renderActiveSession()
  }
}
