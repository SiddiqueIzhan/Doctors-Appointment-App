"use client";
import { setUserRole } from "@/actions/onboarding";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { useFetch } from "@/hooks/use-fetch";
import { Loader2, Stethoscope, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod/v3";
import { userRoleRespType } from "../../../actions/onboarding";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SpecialitiesType, SPECIALTIES } from "@/lib/speciality";

type DoctorFormType = {
  speciality: string;
  experience: number;
  credentialURL: string;
  description: string;
};

const doctorFormSchema = z.object({
  speciality: z.string(),
  experience: z
    .number()
    .min(1, "At least 1 year of Experience Required")
    .max(70, "At most 70 years of experience required"),
  credentialURL: z
    .string()
    .url("Enter a valid URL")
    .min(1, "description should be more than 10 characters"),
  description: z
    .string()
    .min(10, "description should be more than 10 characters")
    .max(1000, "description should be more than 1000 characters"),
});

const Onboarding = () => {
  const [step, setStep] = useState("choose-role");
  const router = useRouter();
  const { data, loading, error, fn: submitUserRole } = useFetch(setUserRole);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<z.infer<typeof doctorFormSchema>>({
    resolver: zodResolver(doctorFormSchema),
    defaultValues: {
      speciality: "",
      experience: 0,
      credentialURL: "",
      description: "",
    },
  });

  const specialityValue = watch("speciality");

  const handleSetPatientRole = async () => {
    if (loading) return;

    const formData = new FormData();
    formData.append("role", "PATIENT");

    await submitUserRole(formData);
  };

  const onSubmitDoctorDetails = async (data: DoctorFormType) => {
    if (loading) return;

    const formData = new FormData();
    formData.append("role", "DOCTOR");
    formData.append("speciality", data.speciality);
    formData.append("experience", String(data.experience));
    formData.append("credentialURL", data.credentialURL);
    formData.append("description", data.description);

    await submitUserRole(formData);
  };

  useEffect(() => {
    if (data && data.success) {
      toast.success("Role Assigned Successfully");
      router.push(data.redirect);
    }
  }, [data]);

  return (
    <>
      {step === "choose-role" && (
        <div className="grid md:grid-cols-2 grid-cols-1 gap-6">
          <Card
            className="bg-transparent flex items-center p-6 cursor-pointer transition-all border-emerald-900/20 hover:border-emerald-700/40"
            onClick={() => {
              if (!loading) handleSetPatientRole();
            }}
          >
            <div className="p-6 bg-emerald-950/70 rounded-full">
              <User className="h-8 w-8 text-emerald-200" />
            </div>
            <CardContent className="text-center">
              <CardTitle className="text-xl mb-2 font-bold">
                Join as a Patient
              </CardTitle>
              <CardDescription className="text-md text-muted-foreground">
                Book appointments, consult with doctors and manage your
                healthcare journey
              </CardDescription>
            </CardContent>
            <Button className="gradient w-full cursor-pointer" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  processing...
                </>
              ) : (
                "Continue as Patient"
              )}
            </Button>
          </Card>
          <Card
            className="bg-transparent flex items-center p-6 cursor-pointer transition-all border-emerald-900/20 hover:border-emerald-700/40"
            onClick={() => !loading && setStep("doctors-form")}
          >
            <div className="p-6 bg-emerald-950/70 rounded-full">
              <Stethoscope className="h-8 w-8 text-emerald-200" />
            </div>
            <CardContent className="text-center">
              <CardTitle className="text-xl mb-2 font-bold">
                Join as a doctor
              </CardTitle>
              <CardDescription className="text-md text-muted-foreground">
                Create your professional profile, set your availability and
                provide consultataions
              </CardDescription>
            </CardContent>
            <Button className="gradient w-full cursor-pointer">Continue as Doctor</Button>
          </Card>
        </div>
      )}
      {step === "doctors-form" && (
        <Card className="bg-transparent  border-emerald-900/20">
          <CardContent className="flex flex-col gap-6">
            <div>
              <CardTitle className="text-xl font-bold mb-2">
                Complete Your Doctor Profile
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Please provide your professional details for verification
              </CardDescription>
            </div>
            <form
              className="space-y-6"
              onSubmit={handleSubmit(onSubmitDoctorDetails)}
            >
              <div className="space-y-2">
                <Label htmlFor="speciality" className="mb-2">
                  Medical Speciality
                </Label>
                <Select
                  value={specialityValue}
                  onValueChange={(value) => setValue("speciality", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your speciality" />
                  </SelectTrigger>
                  <SelectContent>
                    {SPECIALTIES.map((opt) => {
                      const Icon = opt.icon;
                      return (
                        <SelectItem key={opt.name} value={opt.name}>
                          <div className="flex items-center gap-2">
                            <span>
                              <Icon className="w-4 h-4" />
                            </span>
                            {opt.name}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {errors.speciality && (
                  <p className="text-sm font-medium text-red-500 mt-1">
                    {errors.speciality.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience</Label>
                <Input
                  id="experience"
                  type="number"
                  placeholder="Eg. 5"
                  {...register("experience", { valueAsNumber: true })}
                />
                {errors.experience && (
                  <p className="text-sm font-medium text-red-500 mt-1">
                    {errors.experience.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="credentialURL">Credential URL</Label>
                <Input
                  type="url"
                  id="credentialURL"
                  placeholder="https://example.com/my-medical-degree.pdf"
                  {...register("credentialURL")}
                />
                {errors.credentialURL && (
                  <p className="text-sm font-medium text-red-500 mt-1">
                    {errors.credentialURL.message}
                  </p>
                )}
                <p className="text-sm font-medium mt-1 text-muted-foreground">
                  Please provide a link to your medical degree or certification
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  rows={4}
                  id="description"
                  placeholder="Describe your expertise, services and approach to patient care..."
                  {...register("description")}
                />
                {errors.description && (
                  <p className="text-sm font-medium text-red-500 mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>
              <div className="w-full flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("choose-role")}
                  className="border-emerald-900/30 cursor-pointer"
                  disabled={loading}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      processing...
                    </>
                  ) : (
                    "Submit for Verification"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default Onboarding;
