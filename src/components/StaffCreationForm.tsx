import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { organizationService, CreateStaffRequest } from "@/services/organizationService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface StaffCreationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function StaffCreationForm({ open, onOpenChange, onSuccess }: StaffCreationFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Omit<CreateStaffRequest, "organization">>({
    username: "",
    password: "",
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    role: "member",
  });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setFormData({
        username: "",
        password: "",
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        role: "member",
      });
    }
  }, [open]);

  const validateForm = (): boolean => {
    // Validate required fields
    if (!formData.first_name.trim()) {
      toast({
        title: "Validation Error",
        description: "First name is required",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.last_name.trim()) {
      toast({
        title: "Validation Error",
        description: "Last name is required",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.email.trim()) {
      toast({
        title: "Validation Error",
        description: "Email is required",
        variant: "destructive",
      });
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.phone_number.trim()) {
      toast({
        title: "Validation Error",
        description: "Phone number is required",
        variant: "destructive",
      });
      return false;
    }

    // Validate phone number length (>= 10 characters)
    if (formData.phone_number.length < 10) {
      toast({
        title: "Validation Error",
        description: "Phone number must be at least 10 characters",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.password) {
      toast({
        title: "Validation Error",
        description: "Password is required",
        variant: "destructive",
      });
      return false;
    }

    // Validate password length (8-40 characters)
    if (formData.password.length < 8 || formData.password.length > 40) {
      toast({
        title: "Validation Error",
        description: "Password must be between 8 and 40 characters",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Check if organization ID is available
    if (!user?.organizationId) {
      toast({
        title: "Organization Error",
        description: "Organization ID not found. Please refresh the page and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare payload according to API specification
      const payload: CreateStaffRequest = {
        username: formData.username.trim() || formData.email.split("@")[0], // Use email prefix if username not provided
        password: formData.password,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        phone_number: formData.phone_number.trim(),
        organization: user.organizationId,
        role: formData.role,
      };

      await organizationService.addStaff(payload);

      toast({
        title: "Success",
        description: `${formData.first_name} ${formData.last_name} has been added successfully`,
      });

      // Reset form
      setFormData({
        username: "",
        password: "",
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        role: "member",
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add staff member",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine if owner role can be assigned (only for superusers or owners)
  // During impersonation, isSuperuser is false but role is 'owner', so check both
  const canAssignOwner = user?.isSuperuser === true || user?.role === "owner";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Staff Member</DialogTitle>
          <DialogDescription>
            Add a new staff member to your organization. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">
                First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
                placeholder="John"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">
                Last Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
                placeholder="Doe"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john.doe@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone_number">
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone_number"
              value={formData.phone_number}
              onChange={(e) =>
                setFormData({ ...formData, phone_number: e.target.value })
              }
              placeholder="+256701234567"
              required
              minLength={10}
            />
            <p className="text-xs text-muted-foreground">
              Must be at least 10 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              placeholder="johndoe (optional)"
            />
            <p className="text-xs text-muted-foreground">
              If not provided, will be generated from email
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              Password <span className="text-red-500">*</span>
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="Enter password"
              required
              minLength={8}
              maxLength={40}
            />
            <p className="text-xs text-muted-foreground">
              Must be between 8 and 40 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value: "owner" | "manager" | "member") =>
                setFormData({ ...formData, role: value })
              }
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {canAssignOwner && <SelectItem value="owner">Owner</SelectItem>}
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="member">Member</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Staff Member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

