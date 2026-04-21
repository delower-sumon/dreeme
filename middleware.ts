export { default } from "next-auth/middleware"

export const config = {
    matcher: [
        "/journal/:path*",
        "/dreamspace/:path*",
        "/tracker/:path*",
        "/settings/:path*"
    ]
}
