import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BulkRecipientValidation from '@/components/BulkRecipientValidation';
import { AlertCircle, CheckCircle, Users, DollarSign, Clock, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Recipient {
  id: string;
  name: string;
  phoneNumber: string;
  amount: number;
  isValid?: boolean;
  isValidating?: boolean;
  validationMessage?: string;
  registeredName?: string;
}

const OrgBulkPaymentsDemo = () => {
  const { toast } = useToast();
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [allValid, setAllValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRecipientsChange = (newRecipients: Recipient[]) => {
    setRecipients(newRecipients);
  };

  const handleValidationComplete = (valid: boolean) => {
    setAllValid(valid);
  };

  const handleSubmitForApproval = async () => {
    if (!allValid || recipients.length === 0) {
      toast({
        title: "Cannot Submit",
        description: "Please ensure all recipients are validated before submitting.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate submission delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Bulk Payment Submitted",
        description: `Payment request for ${recipients.length} recipients has been sent for approval.`,
      });

      // Reset form
      setRecipients([]);
      setAllValid(false);
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Failed to submit bulk payment request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTotalAmount = () => {
    return recipients.reduce((sum, r) => sum + (r.amount || 0), 0);
  };

  const getValidRecipients = () => {
    return recipients.filter(r => r.isValid === true).length;
  };

  const getInvalidRecipients = () => {
    return recipients.filter(r => r.isValid === false).length;
  };

  const getPendingValidation = () => {
    return recipients.filter(r => r.name && r.phoneNumber && r.isValid === undefined).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Bulk Payments with Validation</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Send money to multiple recipients with built-in name verification
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Recipients</p>
                <p className="text-2xl font-bold">{recipients.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold">UGX {getTotalAmount().toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Validated</p>
                <p className="text-2xl font-bold text-green-600">{getValidRecipients()}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Invalid/Pending</p>
                <p className="text-2xl font-bold text-red-600">{getInvalidRecipients() + getPendingValidation()}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="add-recipients" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="add-recipients">Add Recipients</TabsTrigger>
          <TabsTrigger value="review-submit">Review & Submit</TabsTrigger>
        </TabsList>

        <TabsContent value="add-recipients">
          <BulkRecipientValidation
            onRecipientsChange={handleRecipientsChange}
            onValidationComplete={handleValidationComplete}
          />
        </TabsContent>

        <TabsContent value="review-submit">
          <Card>
            <CardHeader>
              <CardTitle>Review Bulk Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {recipients.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No Recipients Added</h3>
                  <p className="text-muted-foreground">Add recipients in the previous tab to review them here.</p>
                </div>
              ) : (
                <>
                  {/* Validation Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-green-800">Validated Recipients</span>
                      </div>
                      <div className="text-2xl font-bold text-green-700">{getValidRecipients()}</div>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <span className="font-medium text-red-800">Invalid Recipients</span>
                      </div>
                      <div className="text-2xl font-bold text-red-700">{getInvalidRecipients()}</div>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-orange-600" />
                        <span className="font-medium text-orange-800">Pending Validation</span>
                      </div>
                      <div className="text-2xl font-bold text-orange-700">{getPendingValidation()}</div>
                    </div>
                  </div>

                  {/* Recipient List */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Recipients Summary</h4>
                    {recipients.map((recipient, index) => (
                      <div key={recipient.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-full text-sm font-medium">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium">{recipient.name || 'Unnamed'}</div>
                              <div className="text-sm text-muted-foreground">{recipient.phoneNumber}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="font-medium">UGX {recipient.amount.toLocaleString()}</div>
                            </div>
                            <Badge
                              variant={
                                recipient.isValid === true ? 'secondary' :
                                recipient.isValid === false ? 'destructive' : 'outline'
                              }
                            >
                              {recipient.isValid === true ? 'Verified' :
                               recipient.isValid === false ? 'Invalid' : 'Pending'}
                            </Badge>
                          </div>
                        </div>
                        {recipient.validationMessage && (
                          <div className={`mt-3 text-sm p-2 rounded ${
                            recipient.isValid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                          }`}>
                            {recipient.validationMessage}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Total Summary */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-blue-800">Total Payment Amount</h4>
                        <p className="text-sm text-blue-600">{recipients.length} recipients</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-700">
                          UGX {getTotalAmount().toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleSubmitForApproval}
                      disabled={!allValid || recipients.length === 0 || isSubmitting}
                      className="flex-1"
                      size="lg"
                    >
                      {isSubmitting ? (
                        <>
                          <Clock className="h-5 w-5 mr-2 animate-spin" />
                          Submitting for Approval...
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5 mr-2" />
                          Submit for Approval
                        </>
                      )}
                    </Button>
                  </div>

                  {!allValid && recipients.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                        <span className="font-medium text-yellow-800">Validation Required</span>
                      </div>
                      <p className="text-sm text-yellow-700 mt-1">
                        Please ensure all recipients are validated before submitting. 
                        Invalid or unvalidated recipients will cause the submission to fail.
                      </p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrgBulkPaymentsDemo;