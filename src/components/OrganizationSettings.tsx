import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useOrganization } from "@/hooks/useOrganization";
import { Building, Save, Loader2, FileText, Hash, Edit, Upload, Image as ImageIcon } from "lucide-react";
import { organizationService } from "@/services/organizationService";
import { getOrganizationLogoUrl } from "@/utils/organizationAvatar";

const OrganizationSettings = () => {
  const { toast } = useToast();
  const {
    organization,
    loading,
    updateOrganization
  } = useOrganization();

  const [formData, setFormData] = useState({
    name: organization?.name || "",
    address: organization?.address || "",
    company_reg_id: organization?.company_reg_id || "",
    tin: organization?.tin || "",
    logo: organization?.logo || ""
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSavingLogo, setIsSavingLogo] = useState(false);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Organization name is required",
        variant: "destructive"
      });
      return;
    }

    if (!organization) {
      toast({
        title: "Error",
        description: "Organization not found",
        variant: "destructive"
      });
      return;
    }

    try {
      await updateOrganization({
        name: formData.name,
        address: formData.address || null,
        company_reg_id: formData.company_reg_id || null,
        tin: formData.tin || null,
        logo: formData.logo || null,
      });
      toast({
        title: "Settings Updated",
        description: "Organization settings have been updated successfully"
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update organization settings",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    setFormData({
      name: organization?.name || "",
      address: organization?.address || "",
      company_reg_id: organization?.company_reg_id || "",
      tin: organization?.tin || "",
      logo: organization?.logo || ""
    });
    setIsEditing(false);
  };

  if (loading && !organization) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span className="ml-2 text-sm text-slate-600">Loading organization settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 rounded-lg bg-blue-100">
            <Building className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-slate-900">Organization Settings</h2>
            <p className="text-xs sm:text-sm text-slate-600">Manage your organization's information</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel} className="flex-1 sm:flex-none text-xs sm:text-sm">
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading} className="flex-1 sm:flex-none text-xs sm:text-sm">
                {loading ? (
                  <>
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
                    <span className="hidden sm:inline">Saving...</span>
                    <span className="sm:hidden">Save</span>
                  </>
                ) : (
                  <>
                    <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    <span className="hidden sm:inline">Save Changes</span>
                    <span className="sm:hidden">Save</span>
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} className="w-full sm:w-auto text-xs sm:text-sm">
              <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              <span className="hidden sm:inline">Edit Settings</span>
              <span className="sm:hidden">Edit</span>
            </Button>
          )}
        </div>
      </div>

      {/* Organization Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Organization Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs sm:text-sm">Organization Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={!isEditing}
              placeholder="Enter organization name"
              className="text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-xs sm:text-sm">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              disabled={!isEditing}
              placeholder="Enter organization address"
              rows={3}
              className="text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_reg_id" className="text-xs sm:text-sm">Company Registration ID</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-slate-400" />
                <Input
                  id="company_reg_id"
                  value={formData.company_reg_id}
                  onChange={(e) => setFormData({ ...formData, company_reg_id: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Enter registration ID"
                  className="pl-8 sm:pl-10 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tin" className="text-xs sm:text-sm">Tax Identification Number (TIN)</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-slate-400" />
                <Input
                  id="tin"
                  value={formData.tin}
                  onChange={(e) => setFormData({ ...formData, tin: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Enter TIN"
                  className="pl-8 sm:pl-10 text-sm"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organization Details */}
      {organization && (
        <Card>
          <CardHeader>
            <CardTitle>Organization Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <Label className="text-xs sm:text-sm font-medium text-slate-600">Organization ID</Label>
                  <p className="text-xs sm:text-sm text-slate-900 font-mono break-all">{organization.id}</p>
                </div>
                
                <div>
                  <Label className="text-xs sm:text-sm font-medium text-slate-600">Created</Label>
                  <p className="text-xs sm:text-sm text-slate-900">
                    {new Date(organization.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <Label className="text-xs sm:text-sm font-medium text-slate-600">Last Updated</Label>
                  <p className="text-xs sm:text-sm text-slate-900">
                    {new Date(organization.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                
                <div>
                  <Label className="text-xs sm:text-sm font-medium text-slate-600">Organization Logo</Label>
                  <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <img 
                      src={getOrganizationLogoUrl(organization)} 
                      alt="Organization logo" 
                      className="h-12 w-12 sm:h-16 sm:w-16 object-cover rounded-lg border border-slate-200 flex-shrink-0"
                      onError={(e) => {
                        // Fallback to default avatar if logo fails to load
                        const target = e.currentTarget as HTMLImageElement;
                        target.src = getOrganizationLogoUrl(organization);
                      }}
                    />
                    <div className="flex flex-col gap-2 flex-1 min-w-0">
                      <div className="flex gap-2">
                        <Input
                          type="url"
                          value={formData.logo || ""}
                          onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                          onBlur={async () => {
                            if (!isEditing || !organization) return;
                            
                            // Only save if logo changed
                            if (formData.logo === (organization.logo || "")) {
                              return;
                            }

                            setIsSavingLogo(true);
                            try {
                              await updateOrganization({
                                logo: formData.logo.trim() || null,
                              });
                              toast({
                                title: "Logo updated",
                                description: "Organization logo has been updated successfully",
                              });
                              // Refresh to show new logo
                              setTimeout(() => window.location.reload(), 500);
                            } catch (error: any) {
                              console.error("Logo update error:", error);
                              toast({
                                title: "Update failed",
                                description: error.message || "Failed to update logo. Please check the URL format and try again.",
                                variant: "destructive",
                              });
                              // Reset to original value on error
                              setFormData({ ...formData, logo: organization.logo || "" });
                            } finally {
                              setIsSavingLogo(false);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && isEditing) {
                              e.currentTarget.blur();
                            }
                          }}
                          placeholder="https://example.com/logo.png"
                          disabled={!isEditing || isSavingLogo}
                          className="text-xs sm:text-sm"
                        />
                        {isEditing && (
                          <Button
                            type="button"
                            size="sm"
                            onClick={async () => {
                              if (!organization) return;
                              
                              setIsSavingLogo(true);
                              try {
                                await updateOrganization({
                                  logo: formData.logo.trim() || null,
                                });
                                toast({
                                  title: "Logo updated",
                                  description: "Organization logo has been updated successfully",
                                });
                                // Refresh to show new logo
                                setTimeout(() => window.location.reload(), 500);
                              } catch (error: any) {
                                console.error("Logo update error:", error);
                                toast({
                                  title: "Update failed",
                                  description: error.message || "Failed to update logo. Please check the URL format and try again.",
                                  variant: "destructive",
                                });
                                // Reset to original value on error
                                setFormData({ ...formData, logo: organization.logo || "" });
                              } finally {
                                setIsSavingLogo(false);
                              }
                            }}
                            disabled={isSavingLogo || formData.logo === (organization.logo || "")}
                            className="text-xs sm:text-sm"
                          >
                            {isSavingLogo ? (
                              <>
                                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 animate-spin" />
                                <span className="hidden sm:inline">Saving...</span>
                              </>
                            ) : (
                              <>
                                <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                <span className="hidden sm:inline">Save</span>
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                      <p className="text-[10px] sm:text-xs text-slate-500">
                        {isEditing 
                          ? "Enter a direct link to your organization logo image. Press Enter or click Save to update."
                          : "Enter a direct link to your organization logo image"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OrganizationSettings;
