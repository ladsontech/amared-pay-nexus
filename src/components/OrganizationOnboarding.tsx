import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/hooks/useOrganization";
import { 
  Building, 
  Save,
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  FileText,
  Hash,
  MapPin,
  Loader2,
  Image as ImageIcon,
  Upload
} from "lucide-react";
import { organizationService } from "@/services/organizationService";
import { getOrganizationLogoUrl } from "@/utils/organizationAvatar";

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
}

const steps: OnboardingStep[] = [
  { id: 1, title: "Welcome", description: "Let's set up your organization" },
  { id: 2, title: "Basic Information", description: "Organization name and details" },
  { id: 3, title: "Organization Logo", description: "Upload your organization logo" },
  { id: 4, title: "Additional Details", description: "Company registration and tax info (optional)" },
  { id: 5, title: "Complete", description: "You're all set!" },
];

export default function OrganizationOnboarding() {
  const { user } = useAuth();
  const { organization, updateOrganization } = useOrganization();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: organization?.name || user?.organization?.name || "",
    address: organization?.address || "",
    company_reg_id: organization?.company_reg_id || "",
    tin: organization?.tin || "",
    logo: organization?.logo || "",
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(
    organization?.logo ? getOrganizationLogoUrl(organization) : null
  );

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveBasicInfo = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Organization name required",
        description: "Please enter your organization name to continue",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await updateOrganization({
        name: formData.name.trim(),
        address: formData.address || null,
        company_reg_id: formData.company_reg_id || null,
        tin: formData.tin || null,
      });

      toast({
        title: "Information saved",
        description: "Organization details have been updated",
      });

      handleNext();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save organization information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoSave = async () => {
    if (!organization) return;

    setIsLoading(true);
    try {
      await updateOrganization({
        logo: formData.logo || null,
      });
      
      toast({
        title: "Logo saved",
        description: "Your organization logo has been saved successfully",
      });

      // Update preview
      if (formData.logo) {
        setLogoPreview(formData.logo);
      }

      // Optional: auto-advance to next step
      setTimeout(() => handleNext(), 1000);
    } catch (error) {
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Failed to save logo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoUrlChange = (url: string) => {
    setFormData({ ...formData, logo: url });
    // Update preview immediately if URL is valid
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      setLogoPreview(url);
    } else if (!url) {
      setLogoPreview(null);
    }
  };

  const handleSkipLogo = () => {
    handleNext();
  };

  const handleComplete = () => {
    // Mark onboarding as complete
    localStorage.setItem(`onboarding_complete_${user?.organizationId}`, 'true');
    // Reload to refresh organization data
    window.location.reload();
  };

  const handleSkipAll = () => {
    if (confirm("Are you sure you want to skip onboarding? You can complete it later in settings.")) {
      localStorage.setItem(`onboarding_complete_${user?.organizationId}`, 'true');
      window.location.reload();
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 text-center py-8">
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-blue-100">
                <Sparkles className="h-12 w-12 text-blue-600" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-foreground">Welcome to Alma Pay!</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Let's get your organization set up. This will only take a few minutes.
            </p>
            <div className="grid gap-4 md:grid-cols-3 mt-8 max-w-3xl mx-auto">
              <div className="p-4 rounded-lg border border-blue-200 bg-blue-50/50">
                <Building className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Organization Info</h3>
                <p className="text-sm text-muted-foreground">Set up your organization details</p>
              </div>
              <div className="p-4 rounded-lg border border-blue-200 bg-blue-50/50">
                <Upload className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Upload Logo</h3>
                <p className="text-sm text-muted-foreground">Add your organization branding</p>
              </div>
              <div className="p-4 rounded-lg border border-blue-200 bg-blue-50/50">
                <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Optional Details</h3>
                <p className="text-sm text-muted-foreground">Registration and tax information</p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="org-name" className="text-base font-semibold">
                Organization Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="org-name"
                placeholder="Enter your organization name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-12 text-base"
                required
              />
              <p className="text-sm text-muted-foreground">
                This will be displayed throughout the platform
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="org-address" className="text-base font-semibold">
                Organization Address
              </Label>
              <Textarea
                id="org-address"
                placeholder="Enter your organization address (optional)"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="min-h-24 text-base"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 py-4">
            <div className="text-center mb-6">
              <p className="text-muted-foreground mb-4">
                Enter your organization logo URL. This will be displayed in your app and on invoices.
              </p>
            </div>

            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-32 h-32 rounded-lg border-2 border-dashed border-blue-200 bg-blue-50/50 flex items-center justify-center overflow-hidden">
                  {logoPreview ? (
                    <img 
                      src={logoPreview} 
                      alt="Logo preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.src = '';
                        setLogoPreview(null);
                      }}
                    />
                  ) : (
                    <ImageIcon className="h-12 w-12 text-blue-300" />
                  )}
                </div>
              </div>

              <div className="w-full space-y-2">
                <Label htmlFor="logo-url" className="text-base font-semibold">
                  Logo URL
                </Label>
                <Input
                  id="logo-url"
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={formData.logo}
                  onChange={(e) => handleLogoUrlChange(e.target.value)}
                  className="h-12 text-base"
                />
                <p className="text-xs text-muted-foreground text-center">
                  Enter a direct link to your organization logo image
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Button
                  type="button"
                  onClick={handleLogoSave}
                  disabled={isLoading || !formData.logo}
                  className="w-full sm:w-auto"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Logo
                    </>
                  )}
                </Button>
                {!logoPreview && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleSkipLogo}
                    className="w-full sm:w-auto"
                  >
                    Skip for now
                  </Button>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 py-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                <strong>Optional:</strong> You can skip this step and add these details later in your settings.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company-reg" className="text-base font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Company Registration ID
              </Label>
              <Input
                id="company-reg"
                placeholder="Enter company registration number (optional)"
                value={formData.company_reg_id}
                onChange={(e) => setFormData({ ...formData, company_reg_id: e.target.value })}
                className="h-12 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tin" className="text-base font-semibold flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Tax Identification Number (TIN)
              </Label>
              <Input
                id="tin"
                placeholder="Enter TIN (optional)"
                value={formData.tin}
                onChange={(e) => setFormData({ ...formData, tin: e.target.value })}
                className="h-12 text-base"
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6 text-center py-8">
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-green-100">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-foreground">Setup Complete! 🎉</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your organization has been successfully configured. You're all set to start managing your finances.
            </p>
            <div className="mt-8">
              <Button onClick={handleComplete} size="lg" className="px-8">
                Go to Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-blue-200">
        <CardHeader className="border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Setup Your Organization</CardTitle>
              <CardDescription className="text-base mt-2">
                Step {currentStep} of {steps.length}: {steps[currentStep - 1]?.title}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkipAll}
              className="text-muted-foreground"
            >
              Skip
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1 || isLoading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex gap-2">
              {currentStep === 2 && (
                <Button
                  onClick={handleSaveBasicInfo}
                  disabled={isLoading || !formData.name.trim()}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Save & Continue
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              )}

              {currentStep === 4 && (
                <Button
                  onClick={async () => {
                    setIsLoading(true);
                    try {
                      await updateOrganization({
                        name: formData.name.trim(),
                        address: formData.address || null,
                        company_reg_id: formData.company_reg_id || null,
                        tin: formData.tin || null,
                      });
                      toast({
                        title: "Details saved",
                        description: "Additional information has been updated",
                      });
                      handleNext();
                    } catch (error) {
                      toast({
                        title: "Error",
                        description: error instanceof Error ? error.message : "Failed to save details",
                        variant: "destructive",
                      });
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Save & Continue
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              )}

              {currentStep === 3 && logoPreview && (
                <Button onClick={handleNext}>
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}

              {currentStep === 1 && (
                <Button onClick={handleNext}>
                  Get Started
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

