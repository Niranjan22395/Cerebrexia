import React, { useState } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import { Tag, X, CheckCircle, AlertCircle } from 'lucide-react';
import axios from '../../lib/axios';

interface PromoCodeInputProps {
  amount: number;
  onApply: (code: string, discountAmount: number) => void;
  onRemove: () => void;
  appliedCode?: string;
  eventId?: string;
}

export const PromoCodeInput: React.FC<PromoCodeInputProps> = ({
  amount,
  onApply,
  onRemove,
  appliedCode,
  eventId,
}) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validatePromoCode = async () => {
    if (!code.trim()) {
      setError('Please enter a promo code');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('/promo-codes/validate', {
        code: code.trim().toUpperCase(),
        amount,
        eventId,
      });

      if (response.data.success && response.data.data.valid) {
        const { discountAmount, message } = response.data.data;
        setSuccess(message || 'Promo code applied successfully!');
        onApply(code.trim().toUpperCase(), discountAmount);
        setCode('');
      } else {
        setError(response.data.data.message || 'Invalid promo code');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Failed to validate promo code. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setCode('');
    setError('');
    setSuccess('');
    onRemove();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      validatePromoCode();
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Have a Promo Code?
      </label>

      {appliedCode ? (
        // Applied Promo Code Display
        <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-semibold text-green-900">{appliedCode}</p>
              <p className="text-xs text-green-700">Promo code applied successfully!</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="text-green-600 hover:text-green-800 transition-colors"
            aria-label="Remove promo code"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        // Promo Code Input
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Enter promo code"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setError('');
                  setSuccess('');
                }}
                onKeyPress={handleKeyPress}
                leftIcon={<Tag className="w-4 h-4 text-gray-400" />}
                disabled={loading}
                className="uppercase"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={validatePromoCode}
              disabled={loading || !code.trim()}
              isLoading={loading}
              className="px-6"
            >
              Apply
            </Button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-start p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800">{success}</p>
            </div>
          )}

          {/* Helper Text */}
          <p className="text-xs text-gray-500">
            Enter your promo code to get a discount on your registration
          </p>
        </div>
      )}
    </div>
  );
};

// Made with Bob