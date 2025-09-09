import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Loader2, Trash2 } from 'lucide-react';
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

interface BulkRecipientValidationProps {
  onRecipientsChange: (recipients: Recipient[]) => void;
  onValidationComplete: (allValid: boolean) => void;
}

const BulkRecipientValidation: React.FC<BulkRecipientValidationProps> = ({
  onRecipientsChange,
  onValidationComplete
}) => {
  const { toast } = useToast();
  const [recipients, setRecipients] = useState<Recipient[]>([
    { id: '1', name: '', phoneNumber: '', amount: 0 }
  ]);

  // Mock validation function - simulates API call to telecom provider
  const validateRecipient = async (phoneNumber: string, enteredName: string): Promise<{
    isValid: boolean;
    registeredName?: string;
    message: string;
  }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock registered names for demo
    const mockDatabase = {
      '256701234567': 'John Doe',
      '256781234567': 'Jane Smith', 
      '256771234567': 'Bob Wilson',
      '256741234567': 'Alice Johnson',
      '256761234567': 'Mike Brown'
    };

    const registeredName = mockDatabase[phoneNumber as keyof typeof mockDatabase];
    
    if (!registeredName) {
      return {
        isValid: false,
        message: 'Phone number not found in network database'
      };
    }

    const namesMatch = enteredName.toLowerCase().trim() === registeredName.toLowerCase().trim();
    
    return {
      isValid: namesMatch,
      registeredName,
      message: namesMatch 
        ? 'Name matches network registration'
        : `Name mismatch. Registered as: ${registeredName}`
    };
  };

  const handleRecipientChange = (id: string, field: keyof Recipient, value: string | number) => {
    setRecipients(prev => 
      prev.map(recipient => 
        recipient.id === id 
          ? { ...recipient, [field]: value, isValid: undefined, validationMessage: undefined }
          : recipient
      )
    );
  };

  const handleValidateRecipient = async (id: string) => {
    const recipient = recipients.find(r => r.id === id);
    if (!recipient || !recipient.name || !recipient.phoneNumber) return;

    setRecipients(prev =>
      prev.map(r => r.id === id ? { ...r, isValidating: true } : r)
    );

    try {
      const validation = await validateRecipient(recipient.phoneNumber, recipient.name);
      
      setRecipients(prev =>
        prev.map(r => 
          r.id === id 
            ? {
                ...r,
                isValidating: false,
                isValid: validation.isValid,
                validationMessage: validation.message,
                registeredName: validation.registeredName
              }
            : r
        )
      );

      if (!validation.isValid) {
        toast({
          title: "Name Validation Failed",
          description: validation.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      setRecipients(prev =>
        prev.map(r => 
          r.id === id 
            ? { ...r, isValidating: false, isValid: false, validationMessage: 'Validation failed' }
            : r
        )
      );
    }
  };

  const addRecipient = () => {
    const newRecipient: Recipient = {
      id: Date.now().toString(),
      name: '',
      phoneNumber: '',
      amount: 0
    };
    setRecipients(prev => [...prev, newRecipient]);
  };

  const removeRecipient = (id: string) => {
    if (recipients.length > 1) {
      setRecipients(prev => prev.filter(r => r.id !== id));
    }
  };

  const validateAllRecipients = async () => {
    const validRecipients = recipients.filter(r => r.name && r.phoneNumber);
    
    for (const recipient of validRecipients) {
      if (recipient.isValid === undefined) {
        await handleValidateRecipient(recipient.id);
      }
    }
  };

  useEffect(() => {
    onRecipientsChange(recipients);
    const allValid = recipients.length > 0 && 
      recipients.every(r => r.name && r.phoneNumber && r.amount > 0 && r.isValid === true);
    onValidationComplete(allValid);
  }, [recipients, onRecipientsChange, onValidationComplete]);

  const getTotalAmount = () => {
    return recipients.reduce((sum, r) => sum + (r.amount || 0), 0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Bulk Payment Recipients</span>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {recipients.length} recipient{recipients.length !== 1 ? 's' : ''}
            </Badge>
            <Badge variant="secondary">
              Total: UGX {getTotalAmount().toLocaleString()}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recipients.map((recipient, index) => (
          <div key={recipient.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Recipient {index + 1}</h4>
              <div className="flex items-center gap-2">
                {recipient.isValid === true && (
                  <Badge variant="secondary" className="text-green-700">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
                {recipient.isValid === false && (
                  <Badge variant="destructive">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Invalid
                  </Badge>
                )}
                {recipients.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRecipient(recipient.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  placeholder="Enter full name"
                  value={recipient.name}
                  onChange={(e) => handleRecipientChange(recipient.id, 'name', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Phone Number</label>
                <Input
                  placeholder="256XXXXXXXXX"
                  value={recipient.phoneNumber}
                  onChange={(e) => handleRecipientChange(recipient.id, 'phoneNumber', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Amount (UGX)</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={recipient.amount || ''}
                  onChange={(e) => handleRecipientChange(recipient.id, 'amount', parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={() => handleValidateRecipient(recipient.id)}
                  disabled={!recipient.name || !recipient.phoneNumber || recipient.isValidating}
                  className="w-full"
                >
                  {recipient.isValidating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    'Validate'
                  )}
                </Button>
              </div>
            </div>

            {recipient.validationMessage && (
              <div className={`p-3 rounded-lg text-sm ${
                recipient.isValid 
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                <div className="flex items-center gap-2">
                  {recipient.isValid ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                  <span>{recipient.validationMessage}</span>
                </div>
                {recipient.registeredName && recipient.registeredName !== recipient.name && (
                  <div className="mt-2">
                    <strong>Network Registration:</strong> {recipient.registeredName}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        <div className="flex gap-2">
          <Button variant="outline" onClick={addRecipient}>
            Add Recipient
          </Button>
          <Button onClick={validateAllRecipients}>
            Validate All Recipients
          </Button>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="text-sm text-muted-foreground mb-2">
            <strong>Important:</strong> All recipient names will be verified against network provider registrations.
            Payments with name mismatches will be rejected to prevent errors.
          </div>
          <div className="text-sm">
            <strong>Demo Numbers for Testing:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>256701234567 - John Doe</li>
              <li>256781234567 - Jane Smith</li>
              <li>256771234567 - Bob Wilson</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkRecipientValidation;