import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Campus Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/university-campus-building-with-students.jpg')",
          }}
        />
        <div className="absolute inset-0 bg-primary/80" />
        <div className="relative z-10 flex flex-col justify-center px-12 text-primary-foreground">
          <h1 className="text-4xl font-bold mb-4">TalepDestek</h1>
          <p className="text-xl opacity-90 mb-8">University Request & Support System</p>
          <div className="space-y-4 text-lg opacity-80">
            <p>✓ Submit requests easily</p>
            <p>✓ Track your submissions</p>
            <p>✓ Get quick support</p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="lg:hidden mb-6">
              <h1 className="text-3xl font-bold text-primary">TalepDestek</h1>
              <p className="text-muted-foreground">University Request & Support System</p>
            </div>
            <h2 className="text-2xl font-semibold text-foreground">Welcome Back</h2>
            <p className="text-muted-foreground mt-2">Sign in to your account</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
