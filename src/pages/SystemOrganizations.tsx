import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search, Filter, Building, Wallet, Users, Edit, Eye, RefreshCw, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { organizationService, Organization, CreateOrganizationRequest } from "@/services/organizationService";
import { otpService } from "@/services/otpService";

const SystemOrganizations = () => {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState<null | Organization>(null);
  const [otpVerificationOpen, setOtpVerificationOpen] = useState(false);
  const [pendingOrganization, setPendingOrganization] = useState<CreateOrganizationRequest | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const { toast } = useToast();

  const fetchOrganizations = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching organizations...');
      const response = await organizationService.getOrganizations();
      console.log('Organizations fetched:', response);
      setOrganizations(response.results);
    } catch (error: any) {
      console.error('Failed to load organizations:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load organizations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const filteredOrganizations = organizations.filter(
    (org) =>
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async (data: CreateOrganizationRequest) => {
    try {
      console.log('Creating organization with data:', data);
      const result = await organizationService.createOrganization(data);
      console.log('Organization created successfully:', result);
      
      // Store the organization data for OTP verification
      setPendingOrganization(data);
      setOtpCode("");
      
      // Close the create dialog and open OTP verification
      setCreateOpen(false);
      setOtpVerificationOpen(true);
      
      // Show info toast
      toast({ 
        title: "Email Verification Required", 
        description: `Please check your email (${data.email}) for the verification code to complete organization setup.`,
        duration: 8000
      });
    } catch (error: any) {
      console.error('Create organization error:', error);
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create organization",
        variant: "destructive",
        duration: 5000
      });
      throw error; // Re-throw to stop loading state
    }
  };

  const handleUpdate = async (id: string, data: { name: string; address?: string; company_reg_id?: string; tin?: string }) => {
    try {
      await organizationService.updateOrganization(id, data);
      toast({ title: "Success", description: "Organization updated successfully" });
      setEditOpen(null);
      fetchOrganizations();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update organization", variant: "destructive" });
    }
  };

  const handleVerifyOtp = async () => {
    if (!pendingOrganization || !otpCode) {
      toast({
        title: "Missing Information",
        description: "Please enter the verification code",
        variant: "destructive"
      });
      return;
    }

    if (otpCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a 6-digit verification code",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsVerifyingOtp(true);
      console.log('Verifying OTP for email:', pendingOrganization.email);
      
      const result = await otpService.verifyEmailAddress({
        email_code: otpCode,
        email: pendingOrganization.email
      });

      console.log('Email verified successfully:', result);
      
      // Refresh the organizations list
      await fetchOrganizations();
      
      // Close OTP dialog
      setOtpVerificationOpen(false);
      setPendingOrganization(null);
      setOtpCode("");
      
      // Show success toast
      toast({
        title: "Email Verified Successfully",
        description: `Organization "${pendingOrganization.org_name}" is now fully set up and ready to use!`,
        duration: 5000
      });
    } catch (error: any) {
      console.error('OTP verification error:', error);
      toast({
        title: "Verification Failed",
        description: error.message || "Failed to verify email. Please check the code and try again.",
        variant: "destructive"
      });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (!pendingOrganization) {
      toast({
        title: "Error",
        description: "No pending organization found",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsResendingOtp(true);
      console.log('Resending OTP to email:', pendingOrganization.email);
      
      await otpService.resendEmailOTP({
        email: pendingOrganization.email
      });
      
      toast({
        title: "Code Resent",
        description: "A new verification code has been sent to your email",
        duration: 5000
      });
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      toast({
        title: "Resend Failed",
        description: error.message || "Failed to resend verification code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsResendingOtp(false);
    }
  };

  const handleCancelOtpVerification = () => {
    setOtpVerificationOpen(false);
    setPendingOrganization(null);
    setOtpCode("");
    toast({
      title: "Verification Cancelled",
      description: "Organization creation was cancelled. You can try again later.",
      variant: "destructive"
    });
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-slate-900">Organizations</h1>
            <p className="text-sm text-muted-foreground">Manage all organizations in the system</p>
          </div>
          <Button className="flex items-center space-x-2" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            <span>Add Organization</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
          <Card className="border border-slate-100 bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-base sm:text-lg">Total Organizations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{organizations.length}</div>
              <p className="text-xs sm:text-sm text-muted-foreground">Registered</p>
            </CardContent>
          </Card>
          <Card className="border border-slate-100 bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-base sm:text-lg">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-green-600">{organizations.length}</div>
              <p className="text-xs sm:text-sm text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>
          <Card className="border border-slate-100 bg-white sm:col-span-2 lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-base sm:text-lg">Total Staff</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">-</div>
              <p className="text-xs sm:text-sm text-muted-foreground">All organizations</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search organizations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-muted rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrganizations.map((org) => (
              <Card key={org.id} className="border border-slate-100 bg-white">
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Building className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="font-semibold text-base sm:text-lg truncate">{org.name}</h3>
                          <Badge className="bg-green-100 text-green-800 text-xs">Active</Badge>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                          <div>
                            <p className="truncate"><strong>ID:</strong> <span className="break-all">{org.id}</span></p>
                            <p className="truncate"><strong>Company Reg:</strong> {org.company_reg_id || "N/A"}</p>
                          </div>
                          <div>
                            <p className="truncate"><strong>TIN:</strong> {org.tin || "N/A"}</p>
                            <p className="truncate"><strong>Address:</strong> {org.address || "N/A"}</p>
                          </div>
                          <div>
                            <p><strong>Created:</strong> {new Date(org.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:space-x-2 sm:flex-shrink-0">
                      <Button variant="default" size="sm" className="w-full sm:w-auto text-xs sm:text-sm" onClick={() => navigate(`/system/organizations/${org.id}`)}>
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                        <span className="hidden sm:inline">View Details</span>
                        <span className="sm:hidden">View</span>
                      </Button>
                      <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs sm:text-sm" onClick={() => setEditOpen(org)}>
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Organization</DialogTitle>
            <DialogDescription>Set up a new organization with owner account.</DialogDescription>
          </DialogHeader>
          <OrgForm onSubmit={handleCreate} onCancel={() => setCreateOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editOpen} onOpenChange={(o) => !o && setEditOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Organization</DialogTitle>
            <DialogDescription>Update organization details.</DialogDescription>
          </DialogHeader>
          {editOpen && (
            <OrgEditForm 
              initial={editOpen} 
              onSubmit={(data) => handleUpdate(editOpen.id, data)} 
              onCancel={() => setEditOpen(null)} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* OTP Verification Dialog */}
      <Dialog open={otpVerificationOpen} onOpenChange={setOtpVerificationOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Verification Required
            </DialogTitle>
            <DialogDescription>
              Please check your email for the verification code to complete organization setup.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {pendingOrganization && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Organization:</strong> {pendingOrganization.org_name}
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Email:</strong> {pendingOrganization.email}
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="otp-code">Verification Code</Label>
              <Input
                id="otp-code"
                type="text"
                placeholder="Enter 6-digit code"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="text-center text-lg tracking-widest"
              />
              <p className="text-xs text-muted-foreground">
                Enter the 6-digit code sent to your email address
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleResendOtp}
                variant="outline"
                disabled={isResendingOtp || isVerifyingOtp}
                className="flex-1"
              >
                {isResendingOtp ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Resending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Resend Code
                  </>
                )}
              </Button>
              
              <Button
                onClick={handleVerifyOtp}
                disabled={!otpCode || otpCode.length !== 6 || isVerifyingOtp || isResendingOtp}
                className="flex-1"
              >
                {isVerifyingOtp ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Email'
                )}
              </Button>
            </div>
            
            <div className="text-center">
              <Button
                onClick={handleCancelOtpVerification}
                variant="ghost"
                size="sm"
                disabled={isVerifyingOtp || isResendingOtp}
              >
                Cancel Organization Creation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SystemOrganizations;

// Create Form Component
interface OrgFormProps {
  onSubmit: (data: CreateOrganizationRequest) => void;
  onCancel: () => void;
}

const OrgForm = ({ onSubmit, onCancel }: OrgFormProps) => {
  const [form, setForm] = useState<CreateOrganizationRequest>({
    username: "",
    password: "",
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    org_name: "",
    address: "",
    company_reg_id: "",
    tin: "",
    wallet_currency: 1,
    wallet_pin: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(form);
      // Success - form will be reset when dialog closes
    } catch (error) {
      // Error already shown by parent, just keep dialog open
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <h3 className="font-semibold text-sm sm:text-base">Organization Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label>Organization Name</Label>
            <Input value={form.org_name} onChange={(e) => setForm({ ...form, org_name: e.target.value })} required />
          </div>
          <div>
            <Label>Address</Label>
            <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div>
            <Label>Company Registration ID</Label>
            <Input value={form.company_reg_id} onChange={(e) => setForm({ ...form, company_reg_id: e.target.value })} />
          </div>
          <div>
            <Label>TIN</Label>
            <Input value={form.tin} onChange={(e) => setForm({ ...form, tin: e.target.value })} />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold text-sm sm:text-base">Owner Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label>First Name</Label>
            <Input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} required />
          </div>
          <div>
            <Label>Last Name</Label>
            <Input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} required />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <Label>Phone Number</Label>
            <Input value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} required />
          </div>
          <div>
            <Label>Username</Label>
            <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
          </div>
          <div>
            <Label>Password</Label>
            <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold text-sm sm:text-base">Wallet Setup</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label>Currency ID</Label>
            <Input type="number" value={form.wallet_currency} onChange={(e) => setForm({ ...form, wallet_currency: Number(e.target.value) })} required />
          </div>
          <div>
            <Label>Wallet PIN</Label>
            <Input type="password" value={form.wallet_pin} onChange={(e) => setForm({ ...form, wallet_pin: e.target.value })} required minLength={4} maxLength={4} />
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Organization"}
        </Button>
      </DialogFooter>
    </form>
  );
};

// Edit Form Component
interface OrgEditFormProps {
  initial: Organization;
  onSubmit: (data: { name: string; address?: string; company_reg_id?: string; tin?: string }) => void;
  onCancel: () => void;
}

const OrgEditForm = ({ initial, onSubmit, onCancel }: OrgEditFormProps) => {
  const [form, setForm] = useState({
    name: initial.name,
    address: initial.address || "",
    company_reg_id: initial.company_reg_id || "",
    tin: initial.tin || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Organization Name</Label>
        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      </div>
      <div>
        <Label>Address</Label>
        <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
      </div>
      <div>
        <Label>Company Registration ID</Label>
        <Input value={form.company_reg_id} onChange={(e) => setForm({ ...form, company_reg_id: e.target.value })} />
      </div>
      <div>
        <Label>TIN</Label>
        <Input value={form.tin} onChange={(e) => setForm({ ...form, tin: e.target.value })} />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save Changes</Button>
      </DialogFooter>
    </form>
  );
};
