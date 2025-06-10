
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface PaymentLinkFormProps {
  onSuccess: () => void;
}

const PaymentLinkForm = ({ onSuccess }: PaymentLinkFormProps) => {
  const [formData, setFormData] = useState({
    amount: "",
    reference: "",
    paymentReason: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCreatePaymentLink = async () => {
    if (!formData.amount || !formData.reference || !formData.paymentReason) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/payments/mobile-money/initiate-collection/", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          currency: "UGX",
          reference: formData.reference,
          description: formData.paymentReason,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Payment Link Created",
          description: "Your payment collection link has been generated successfully and can now be shared via WhatsApp.",
        });
        setFormData({ amount: "", reference: "", paymentReason: "" });
        onSuccess();
      } else {
        throw new Error("Failed to create payment link");
      }
    } catch (error) {
      console.error("Error creating payment link:", error);
      toast({
        title: "Error",
        description: "Failed to create payment link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="amount">Amount (UGX)</Label>
        <Input
          id="amount"
          type="number"
          placeholder="50000"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="reference">Reference Code</Label>
        <Input
          id="reference"
          placeholder="SCHOOL_FEES_2024"
          value={formData.reference}
          onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="paymentReason">Payment Reason</Label>
        <Textarea
          id="paymentReason"
          placeholder="Describe what this payment is for..."
          value={formData.paymentReason}
          onChange={(e) => setFormData({ ...formData, paymentReason: e.target.value })}
        />
      </div>
      
      <div className="bg-muted p-3 rounded-lg text-sm text-muted-foreground">
        <p>💡 The payment link will be shareable via WhatsApp. When users click the link, they'll enter their phone number (+256) to complete the payment.</p>
      </div>
      
      <Button onClick={handleCreatePaymentLink} className="w-full" disabled={isLoading}>
        {isLoading ? "Creating..." : "Create Payment Link"}
      </Button>
    </div>
  );
};

export default PaymentLinkForm;
