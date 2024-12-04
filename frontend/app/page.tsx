'use client';

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, ArrowRight, Upload, Sparkles, BookOpen, Share2 } from "lucide-react"
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/auth');
  };

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#87CEEB] to-[#ACE1AF] py-20">
        <div className="container mx-auto text-center space-y-6 px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#003366] max-w-4xl mx-auto">
            Transform PDFs into Interactive Learning Experiences
          </h1>
          <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto">
            Make learning engaging with audio podcasts, flashcards, quizzes, and more.
          </p>
          <Button 
            variant="default" 
            size="lg" 
            className="mt-8"
            onClick={handleGetStarted}
          >
            Get Started <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[#003366] mb-12">
            Why Choose LearnLab?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-2">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <feature.icon className="h-12 w-12 text-[#87CEEB]" />
                  </div>
                  <CardTitle className="text-xl text-center text-[#003366]">{feature.title}</CardTitle>
                  <CardDescription className="text-center text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[#87CEEB] mb-12">
            Seamless Learning in 4 Simple Steps
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="h-16 w-16 rounded-full bg-[#87CEEB] flex items-center justify-center text-white text-xl font-bold">
                    {index + 1}
                  </div>
                  <step.icon className="h-8 w-8 text-[#003366]" />
                  <p className="font-medium text-gray-800">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/4 left-1/2 w-full h-0.5 bg-[#87CEEB]" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1C1C1C] text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="flex items-center justify-center gap-2">
            Made with <Heart className="h-5 w-5 text-red-500 fill-current" /> by LearnLab scientists
          </p>
        </div>
      </footer>
    </main>
  )
}

const features = [
  {
    icon: BookOpen,
    title: "Learn on the Go",
    description: "Convert PDFs into engaging audio podcasts for effortless learning.",
  },
  {
    icon: Sparkles,
    title: "Revise with Confidence",
    description: "Key concepts at your fingertips through AI-powered flashcards.",
  },
  {
    icon: BookOpen,
    title: "Test Your Knowledge",
    description: "Challenge yourself with AI-driven quizzes and instant feedback.",
  },
]

const steps = [
  {
    icon: Upload,
    description: "Start by choosing the material you want to learn.",
  },
  {
    icon: Sparkles,
    description: "Generate flashcards, audio, quizzes, and more.",
  },
  {
    icon: BookOpen,
    description: "Revise, test, and understand key concepts.",
  },
  {
    icon: Share2,
    description: "Create and post professional blogs instantly.",
  },
]