import Pricing from "@/components/Pricing";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const PricingPage = () => {
  return (
    <div>
      <div>
        <Link
          href="/"
          className="flex items-center text-muted-foreground hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back To Home Page
        </Link>
      </div>
      <div className="text-center mb-16">
        <Badge
          variant="outline"
          className="bg-emerald-900/30 border-emerald-700/30 px-4 py-2 text-emerald-400 text-sm font-medium mb-6"
        >
          Afforable HealthCare
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold gradient-title mb-4">
          Simple, Transperant Pricing
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Choose your perfect consulatation package that fit your healthcare
          needs with no hidden fees and long term commitments
        </p>
      </div>
      <Pricing />
      <div className="max-w-3xl mx-auto mt-16 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          Questions? We're here to help
        </h2>
        <p className="text-muted-foreground mb-4">
          Contact out support team at support@medimeet.com
        </p>
      </div>
    </div>
  );
};

export default PricingPage;
