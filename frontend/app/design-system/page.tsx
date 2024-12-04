import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <main className="container-custom min-h-screen py-10">
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4">
        <ThemeToggle />
      </div>

      {/* Header */}
      <section className="space-y-4 text-center mb-10">
        <h1>Welcome to LearnLab</h1>
        <p className="max-w-2xl mx-auto">
          This is a demonstration of our design system with light and dark mode support.
        </p>
      </section>

      {/* Components Demo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Cards with different variants */}
        <Card>
          <CardHeader>
            <CardTitle>Default Card</CardTitle>
            <CardDescription>This is a default card variant</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Content goes here</p>
          </CardContent>
          <CardFooter>
            <Button>Action</Button>
          </CardFooter>
        </Card>

        <Card variant="secondary">
          <CardHeader>
            <CardTitle>Secondary Card</CardTitle>
            <CardDescription>This is a secondary card variant</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Content goes here</p>
          </CardContent>
          <CardFooter>
            <Button variant="secondary">Action</Button>
          </CardFooter>
        </Card>

        <Card variant="accent">
          <CardHeader>
            <CardTitle>Accent Card</CardTitle>
            <CardDescription>This is an accent card variant</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Content goes here</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline">Action</Button>
          </CardFooter>
        </Card>
      </div>

      {/* Button Variants */}
      <section className="mt-10 space-y-4">
        <h2>Button Variants</h2>
        <div className="flex flex-wrap gap-4">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </section>

      {/* Typography */}
      <section className="mt-10 space-y-4">
        <h2>Typography</h2>
        <div className="space-y-4">
          <h1>Heading 1</h1>
          <h2>Heading 2</h2>
          <h3>Heading 3</h3>
          <p>Regular paragraph text with good line length. The quick brown fox jumps over the lazy dog.</p>
          <p className="text-foreground-secondary">Secondary text color example.</p>
          <small>Small text example</small>
        </div>
      </section>
    </main>
  )
}
