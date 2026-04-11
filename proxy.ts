import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([  // protect the following routes, they cannot be accessed until the user is logged in
  "/doctor(.*)",
  "/onboarding(.*)",
  "/doctors(.*)",
  "/admin(.*)",
  "/video-call(.*)",
  "/appointments(.*)",
]);

export default clerkMiddleware(async(auth, req) => {
    const {userId} = await auth(); // check whether user is logged in

    if(!userId && isProtectedRoute(req)) {
        const {redirectToSignIn} = await auth() // if not logged in redirect to sign-in page

        return redirectToSignIn();
    }

    return NextResponse.next() // else redirect the logged in user to the desired page 
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};