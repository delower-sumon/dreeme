import { AuthForm } from '@/components/auth/AuthForm'

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                <AuthForm />
            </div>
        </div>
    )
}
