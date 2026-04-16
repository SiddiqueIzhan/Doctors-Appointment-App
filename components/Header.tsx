import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { checkUser } from "@/lib/checkUser";
import {
  Calendar,
  CreditCard,
  ShieldCheck,
  Stethoscope,
  User,
} from "lucide-react";
import { Badge } from "./ui/badge";
import {
  checkAndAllocateCredits,
  UserWithTransactions,
} from "@/actions/credits";

const Header = async () => {
  const user: UserWithTransactions | null = await checkUser();
  if (user?.role === "PATIENT") {
    await checkAndAllocateCredits(user);
  }

  return (
    <header className="fixed top-0 w-full border-b bg-background/80 z-10 backdrop-blur-md supports-backdrop-filter:bg-background/60">
      <nav className="container mx-auto px-12 h-16 flex items-center justify-between">
        <Link href="/">
          <Image
            src="/logo-single.png"
            alt="logo"
            height={60}
            width={200}
            className="h-10 w-auto object-contain"
          />
        </Link>
        <div className="w-1/5 flex items-center justify-between">
          <SignedIn>
            {user?.role === "UNASSIGNED" && (
              <Link href="/onboarding">
                <Button
                  variant="outline"
                  className="hidden md:inline-flex items-center gap-2  cursor-pointer"
                >
                  <User className="h-4 w-4" />
                  Complete Profile
                </Button>
                <Button variant="ghost" className="md:hidden w-10 h-10 p-0 cursor-pointer">
                  <User className="h-4 w-4" />
                </Button>
              </Link>
            )}
            {user?.role === "DOCTOR" && (
              <Link href="/doctor">
                <Button
                  variant="outline"
                  className="hidden md:inline-flex items-center gap-2 cursor-pointer"
                >
                  <Stethoscope className="h-4 w-4" />
                  Doctor Dashboard
                </Button>
                <Button variant="ghost" className="md:hidden w-10 h-10 p-0 cursor-pointer">
                  <Stethoscope className="h-4 w-4" />
                </Button>
              </Link>
            )}
            {user?.role === "PATIENT" && (
              <Link href="/appointments">
                <Button
                  variant="outline"
                  className="hidden md:inline-flex items-center gap-2 cursor-pointer"
                >
                  <Calendar className="h-4 w-4" />
                  My Appointments
                </Button>
                <Button variant="ghost" className="md:hidden w-10 h-10 p-0 cursor-pointer">
                  <Calendar className="h-4 w-4" />
                </Button>
              </Link>
            )}
            {user?.role === "ADMIN" && (
              <Link href="/admin">
                <Button
                  variant="outline"
                  className="hidden md:inline-flex items-center gap-2"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Admin Dashboard
                </Button>
                <Button variant="ghost" className="md:hidden w-10 h-10 p-0">
                  <ShieldCheck className="h-4 w-4" />
                </Button>
              </Link>
            )}
            {(!user || user?.role === "PATIENT") && (
              <Link href="/pricing">
                <Badge
                  variant="outline"
                  className="h-9 bg-emerald-900/20 border-emerald-700/30 px-3 py-1 flex items-center gap-2"
                >
                  <CreditCard className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">
                    {user && user?.role === "PATIENT" ? (
                      <>
                        {user.credits}{" "}
                        <span className="hidden md:inline">Credits</span>
                      </>
                    ) : (
                      <>Pricing</>
                    )}
                  </span>
                </Badge>
              </Link>
            )}

            <UserButton />
          </SignedIn>

          <SignedOut>
            <SignInButton>
              <Button variant="secondary" className="cursor-pointer">Sign In</Button>
            </SignInButton>
          </SignedOut>
          {/* Show the user button when the user is signed in */}
        </div>
      </nav>
    </header>
  );
};

export default Header;
