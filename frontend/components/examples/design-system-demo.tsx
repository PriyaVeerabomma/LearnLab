import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function DesignSystemDemo() {
  return (
    <div className="p-8 space-y-8">
      {/* Typography */}
      <section className="space-y-4">
        <h1>Heading 1</h1>
        <h2>Heading 2</h2>
        <h3>Heading 3</h3>
        <p className="max-w-2xl">Body text with good line length. Our design system uses clean typography with a modern sans-serif font. The text is optimized for readability with appropriate line heights and spacing.</p>
      </section>

      {/* Button Variants */}
      <section className="space-y-4">
        <h2 className="text-2xl font-heading font-bold">Button Variants</h2>
        <div className="flex flex-wrap gap-4">
          <Button>Default Button</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="warning">Warning</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
        
        {/* Button Sizes */}
        <div className="flex flex-wrap items-center gap-4">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon">👋</Button>
        </div>
      </section>

      {/* Card Variants */}
      <section className="space-y-4">
        <h2 className="text-2xl font-heading font-bold">Card Variants</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Default Card */}
          <Card>
            <CardHeader>
              <CardTitle>Default Card</CardTitle>
              <CardDescription>Default card with standard styling</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This is the default card variant with default shadows and padding.</p>
            </CardContent>
            <CardFooter>
              <Button>Action</Button>
            </CardFooter>
          </Card>

          {/* Primary Card */}
          <Card variant="primary" shadow="md">
            <CardHeader>
              <CardTitle>Primary Card</CardTitle>
              <CardDescription>Card with primary colors</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This card uses the primary color palette with medium shadows.</p>
            </CardContent>
            <CardFooter>
              <Button variant="secondary">Action</Button>
            </CardFooter>
          </Card>

          {/* Secondary Card */}
          <Card variant="secondary" shadow="lg">
            <CardHeader>
              <CardTitle>Secondary Card</CardTitle>
              <CardDescription>Card with secondary colors</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This card uses the secondary color palette with large shadows.</p>
            </CardContent>
            <CardFooter>
              <Button variant="accent">Action</Button>
            </CardFooter>
          </Card>

          {/* Accent Card */}
          <Card variant="accent" size="sm">
            <CardHeader>
              <CardTitle>Accent Card</CardTitle>
              <CardDescription>Smaller card with accent colors</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This card uses the accent color palette with small padding.</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline">Action</Button>
            </CardFooter>
          </Card>

          {/* Ghost Card */}
          <Card variant="ghost" size="lg">
            <CardHeader>
              <CardTitle>Ghost Card</CardTitle>
              <CardDescription>Transparent background</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This card has no background color and larger padding.</p>
            </CardContent>
            <CardFooter>
              <Button variant="ghost">Action</Button>
            </CardFooter>
          </Card>

          {/* Outline Card */}
          <Card variant="outline" shadow="none">
            <CardHeader>
              <CardTitle>Outline Card</CardTitle>
              <CardDescription>Border only</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This card has only a border without any shadows.</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline">Action</Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Color Palette */}
      <section className="space-y-4">
        <h2 className="text-2xl font-heading font-bold">Color Palette</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="h-20 bg-primary rounded-lg"></div>
            <p className="text-sm font-medium">Primary (Sky Blue)</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 bg-secondary rounded-lg"></div>
            <p className="text-sm font-medium">Secondary (Celadon)</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 bg-accent rounded-lg"></div>
            <p className="text-sm font-medium">Accent (Wisteria)</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 bg-destructive rounded-lg"></div>
            <p className="text-sm font-medium">Destructive (Light Coral)</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 bg-warning rounded-lg"></div>
            <p className="text-sm font-medium">Warning (Sunset)</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 bg-background rounded-lg border"></div>
            <p className="text-sm font-medium">Background (Baby Powder)</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 bg-foreground rounded-lg"></div>
            <p className="text-sm font-medium">Foreground (Eerie Black)</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 bg-muted rounded-lg"></div>
            <p className="text-sm font-medium">Muted</p>
          </div>
        </div>
      </section>
    </div>
  )
}
