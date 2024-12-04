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
      <section className="bg-gradient-primary section-base">
        <div className="container-base text-center space-y-6">
          <h1 className="heading-hero text-accent mx-auto max-w-4xl">
            Transform PDFs into Interactive Learning Experiences
          </h1>
          <p className="text-body max-w-2xl mx-auto">
            Make learning engaging with audio podcasts, flashcards, quizzes, and more.
          </p>
          <Button 
            className="btn-primary btn-lg hover-base hover-lift"
            onClick={handleGetStarted}
          >
            Get Started <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-base bg-background">
        <div className="container-base">
          <h2 className="heading-section text-accent text-center mb-12">
            Why Choose LearnLab?
          </h2>
          <div className="grid-base grid-responsive">
            {features.map((feature, index) => (
              <Card key={index} className="card-base hover-base hover-lift shadow-sm">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <feature.icon className="h-12 w-12 text-primary" />
                  </div>
                  <CardTitle className="text-xl text-center text-accent">{feature.title}</CardTitle>
                  <CardDescription className="text-center text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section-base bg-muted">
        <div className="container-base">
          <h2 className="heading-section text-primary text-center mb-12">
            Seamless Learning in 4 Simple Steps
          </h2>
          <div className="grid-base md:grid-cols-4">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold">
                    {index + 1}
                  </div>
                  <step.icon className="h-8 w-8 text-accent" />
                  <p className="font-medium text-foreground">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/4 left-1/2 w-full h-0.5 bg-primary/30" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-6">
        <div className="container-base text-center">
          <p className="flex items-center justify-center gap-2">
            Made with <Heart className="h-5 w-5 text-destructive fill-current" /> by LearnLab scientists
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