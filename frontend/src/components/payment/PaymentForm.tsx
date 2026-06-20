import React, { useState } from 'react';
import Button from '../common/Button';
import { CreditCard, Wallet, DollarSign, Tag } from 'lucide-react';
import { PromoCodeInput } from './PromoCodeInput';

interface PaymentFormProps {
  amount: number;
  eventName?: string;
  onSubmit: (paymentData: PaymentData) => void;
  onCancel?: () => void;
  loading?: boolean;
  showPromoCode?: boolean;
}

export interface PaymentData {
  amount: number;
  paymentMethod: 'razorpay' | 'cash';
  promoCode?: string;
  discountedAmount?: number;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  eventName,
  onSubmit,
  onCancel,
  loading = false,
  showPromoCode = true,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cash'>('razorpay');
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(amount);

  const handlePromoCodeApply = (code: string, discountAmount: number) => {
    setPromoCode(code);
    setDiscount(discountAmount);
    setFinalAmount(amount - discountAmount);
  };

  const handlePromoCodeRemove = () => {
    setPromoCode('');
    setDiscount(0);
    setFinalAmount(amount);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      amount: finalAmount,
      paymentMethod,
      promoCode: promoCode || undefined,
      discountedAmount: discount > 0 ? discount : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Event Info */}
      {eventName && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Payment for</h3>
          <p className="text-gray-700">{eventName}</p>
        </div>
      )}

      {/* Amount Summary */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Original Amount</span>
          <span className="text-lg font-semibold text-gray-900">₹{amount.toFixed(2)}</span>
        </div>

        {discount > 0 && (
          <>
            <div className="flex justify-between items-center text-green-600">
              <span className="flex items-center">
                <Tag className="w-4 h-4 mr-2" />
                Discount ({promoCode})
              </span>
              <span className="font-semibold">-₹{discount.toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-300 pt-3 flex justify-between items-center">
              <span className="text-gray-900 font-semibold">Final Amount</span>
              <span className="text-2xl font-bold text-blue-600">₹{finalAmount.toFixed(2)}</span>
            </div>
          </>
        )}

        {discount === 0 && (
          <div className="border-t border-gray-300 pt-3 flex justify-between items-center">
            <span className="text-gray-900 font-semibold">Total Amount</span>
            <span className="text-2xl font-bold text-blue-600">₹{finalAmount.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Promo Code */}
      {showPromoCode && (
        <PromoCodeInput
          amount={amount}
          onApply={handlePromoCodeApply}
          onRemove={handlePromoCodeRemove}
          appliedCode={promoCode}
        />
      )}

      {/* Payment Method Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select Payment Method
        </label>

        {/* Razorpay Option */}
        <div
          className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
            paymentMethod === 'razorpay'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => setPaymentMethod('razorpay')}
        >
          <div className="flex items-center">
            <input
              type="radio"
              name="paymentMethod"
              value="razorpay"
              checked={paymentMethod === 'razorpay'}
              onChange={() => setPaymentMethod('razorpay')}
              className="w-4 h-4 text-blue-600"
            />
            <div className="ml-3 flex-1">
              <div className="flex items-center">
                <CreditCard className="w-5 h-5 text-blue-600 mr-2" />
                <span className="font-medium text-gray-900">Online Payment</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Pay securely using Credit/Debit Card, UPI, Net Banking, or Wallet
              </p>
            </div>
          </div>
        </div>

        {/* Cash Option */}
        <div
          className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
            paymentMethod === 'cash'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => setPaymentMethod('cash')}
        >
          <div className="flex items-center">
            <input
              type="radio"
              name="paymentMethod"
              value="cash"
              checked={paymentMethod === 'cash'}
              onChange={() => setPaymentMethod('cash')}
              className="w-4 h-4 text-blue-600"
            />
            <div className="ml-3 flex-1">
              <div className="flex items-center">
                <Wallet className="w-5 h-5 text-green-600 mr-2" />
                <span className="font-medium text-gray-900">Cash Payment</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Pay in cash at the registration desk
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <DollarSign className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            {paymentMethod === 'razorpay' ? (
              <p>
                You will be redirected to Razorpay's secure payment gateway to complete your
                transaction. Your payment information is encrypted and secure.
              </p>
            ) : (
              <p>
                Please bring the exact amount in cash to the registration desk. A receipt will be
                provided upon payment.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          disabled={loading || finalAmount <= 0}
          isLoading={loading}
          className="flex-1"
        >
          {paymentMethod === 'razorpay' ? 'Proceed to Payment' : 'Confirm Registration'}
        </Button>
      </div>

      {/* Terms */}
      <p className="text-xs text-gray-500 text-center">
        By proceeding, you agree to our{' '}
        <a href="/terms" className="text-blue-600 hover:underline">
          Terms & Conditions
        </a>{' '}
        and{' '}
        <a href="/refund-policy" className="text-blue-600 hover:underline">
          Refund Policy
        </a>
      </p>
    </form>
  );
};

// Made with Bob
