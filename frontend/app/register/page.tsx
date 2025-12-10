import { RegisterForm } from "@/components/register-form"

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Campus Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/university-library-students.png')",
          }}
        />
        <div className="absolute inset-0 bg-primary/80" />
        <div className="relative z-10 flex flex-col justify-center px-12 text-primary-foreground">
          <h1 className="text-4xl font-bold mb-4">Join TalepDestek</h1>
          <p className="text-xl opacity-90 mb-8">Create your account today</p>
          <div className="space-y-4 text-lg opacity-80">
            <p>✓ Quick registration process</p>
            <p>✓ Access to all support services</p>
            <p>✓ Track all your requests</p>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="lg:hidden mb-6">
              <h1 className="text-3xl font-bold text-primary">TalepDestek</h1>
              <p className="text-muted-foreground">University Request & Support System</p>
            </div>
            <h2 className="text-2xl font-semibold text-foreground">Create Account</h2>
            <p className="text-muted-foreground mt-2">Fill in your details to get started</p>
          </div>
          <RegisterForm />
        </div>
      </div>
    </div>
  )
}
