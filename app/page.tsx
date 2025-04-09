import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, BookOpen, Brain, Video, MessageCircle } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="space-y-4 max-w-3xl">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
                AI Tutoring Tool
              </h1>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-[700px] mx-auto">
                Boost your learning with AI-powered explanations, interactive tools, and real-time video calls
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Link href="/login">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Floating Shapes */}
        <div className="absolute top-1/4 left-10 w-24 h-24 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 right-10 w-32 h-32 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-36 h-36 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Powerful Learning Features</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-[700px] mx-auto">
              Everything you need to enhance your learning experience
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Brain className="h-10 w-10 text-purple-600" />}
              title="AI-Powered Learning"
              description="Get personalized explanations and answers to your questions using advanced AI technology"
            />
            <FeatureCard
              icon={<BookOpen className="h-10 w-10 text-purple-600" />}
              title="Progress Tracking"
              description="Track your learning progress with visual indicators and achievement streaks"
            />
            <FeatureCard
              icon={<Video className="h-10 w-10 text-purple-600" />}
              title="Video Calls"
              description="Connect with tutors through real-time video calls for personalized guidance"
            />
            <FeatureCard
              icon={<MessageCircle className="h-10 w-10 text-purple-600" />}
              title="Interactive Chat"
              description="Chat with our AI assistant to get help with homework and learning materials"
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24 bg-white dark:bg-gray-800">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">What Our Users Say</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-[700px] mx-auto">
              Hear from students who have transformed their learning experience
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="The AI tutor helped me understand complex math concepts that I was struggling with for months!"
              name="Alex Johnson"
              role="High School Student"
            />
            <TestimonialCard
              quote="I love how I can track my progress and see my improvement over time. The streak feature keeps me motivated!"
              name="Sarah Williams"
              role="College Freshman"
            />
            <TestimonialCard
              quote="The video call feature allowed me to get help from a tutor when I was stuck on a difficult problem."
              name="Michael Chen"
              role="Middle School Student"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-8 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Ready to Transform Your Learning Experience?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Join thousands of students who are already using our AI Tutoring Tool to improve their learning outcomes.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Link href="/login">
                Get Started Today <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-100 dark:bg-gray-900">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h3 className="text-xl font-bold">AI Tutoring Tool</h3>
              <p className="text-gray-600 dark:text-gray-400">Empowering students through AI</p>
            </div>
            <div className="flex space-x-6">
              <Link
                href="#"
                className="text-gray-600 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400"
              >
                About
              </Link>
              <Link
                href="#"
                className="text-gray-600 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400"
              >
                Features
              </Link>
              <Link
                href="#"
                className="text-gray-600 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400"
              >
                Contact
              </Link>
              <Link
                href="#"
                className="text-gray-600 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400"
              >
                Privacy
              </Link>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-600 dark:text-gray-400">
            &copy; {new Date().getFullYear()} AI Tutoring Tool. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <Card className="transition-all hover:shadow-lg">
      <CardContent className="p-6 text-center">
        <div className="mb-4 inline-flex items-center justify-center rounded-full bg-purple-100 p-3 dark:bg-purple-900">
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400">{description}</p>
      </CardContent>
    </Card>
  )
}

function TestimonialCard({ quote, name, role }) {
  return (
    <Card className="transition-all hover:shadow-lg">
      <CardContent className="p-6">
        <div className="mb-4 text-purple-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-8 w-8"
          >
            <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path>
            <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path>
          </svg>
        </div>
        <p className="mb-4 text-gray-600 dark:text-gray-400">{quote}</p>
        <div>
          <p className="font-semibold">{name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{role}</p>
        </div>
      </CardContent>
    </Card>
  )
}
