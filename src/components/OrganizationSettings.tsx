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
    tin: organization?.tin || ""
  });

  const [isEditing, setIsEditing] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Organization name is required",
        variant: "destructive"
      });
      return;
    }

    try {
      await updateOrganization(formData);
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
      tin: organization?.tin || ""
    });
    setIsEditing(false);
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !organization) return;

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 2MB",
        variant: "destructive"
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image file",
        variant: "destructive"
      });
      return;
    }

    try {
      setUploadingLogo(true);
      const formData = new FormData();
      formData.append('logo', file);

      await organizationService.updateOrganization(organization.id, formData);
      
      toast({
        title: "Logo Updated",
        description: "Organization logo has been updated successfully"
      });

      // Refresh the page to show new logo
      window.location.reload();
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload logo",
        variant: "destructive"
      });
    } finally {
      setUploadingLogo(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-100">
            <Building className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Organization Settings</h2>
            <p className="text-sm text-slate-600">Manage your organization's information</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Settings
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
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Organization Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={!isEditing}
              placeholder="Enter organization name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              disabled={!isEditing}
              placeholder="Enter organization address"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_reg_id">Company Registration ID</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="company_reg_id"
                  value={formData.company_reg_id}
                  onChange={(e) => setFormData({ ...formData, company_reg_id: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Enter registration ID"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tin">Tax Identification Number (TIN)</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="tin"
                  value={formData.tin}
                  onChange={(e) => setFormData({ ...formData, tin: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Enter TIN"
                  className="pl-10"
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-slate-600">Organization ID</Label>
                  <p className="text-sm text-slate-900 font-mono">{organization.id}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-slate-600">Created</Label>
                  <p className="text-sm text-slate-900">
                    {new Date(organization.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-slate-600">Last Updated</Label>
                  <p className="text-sm text-slate-900">
                    {new Date(organization.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-slate-600">Organization Logo</Label>
                  <div className="mt-2 flex items-center gap-4">
                    {organization.logo ? (
                      <img 
                        src={organization.logo} 
                        alt="Organization logo" 
                        className="h-16 w-16 object-cover rounded-lg border border-slate-200"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-slate-400" />
                      </div>
                    )}
                    <div className="flex flex-col gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingLogo}
                      >
                        {uploadingLogo ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Logo
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-slate-500">Max 2MB, image files only</p>
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
