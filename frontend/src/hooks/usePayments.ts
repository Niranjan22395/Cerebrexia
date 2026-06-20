import { useState, useCallback } from 'react';
import axios from '../lib/axios';
import { Payment, RazorpayOrderResponse, PaymentVerification, PaymentFilters } from '../types';

interface UsePaymentsReturn {
  payments: Payment[];
  loading: boolean;
  error: string | null;
  createOrder: (amount: number, eventId?: string, promoCode?: string) => Promise<RazorpayOrderResponse>;
  verifyPayment: (verification: PaymentVerification) => Promise<Payment>;
  getMyPayments: () => Promise<Payment[]>;
  getPaymentById: (id: string) => Promise<Payment>;
  downloadReceipt: (paymentId: string) => Promise<void>;
  requestRefund: (paymentId: string, reason: string) => Promise<void>;
  fetchPayments: (filters?: PaymentFilters) => Promise<Payment[]>;
}

export const usePayments = (): UsePaymentsReturn => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create Razorpay order
  const createOrder = useCallback(async (
    amount: number,
    eventId?: string,
    promoCode?: string
  ): Promise<RazorpayOrderResponse> => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post('/payments/create-order', {
        amount,
        eventId,
        promoCode,
      });

      return response.data.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create payment order';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Verify Razorpay payment
  const verifyPayment = useCallback(async (
    verification: PaymentVerification
  ): Promise<Payment> => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post('/payments/verify', verification);
      const payment: Payment = response.data.data;

      // Add to local state
      setPayments(prev => [payment, ...prev]);

      return payment;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Payment verification failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get user's payments
  const getMyPayments = useCallback(async (): Promise<Payment[]> => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get('/payments/my');
      const userPayments: Payment[] = response.data.data;
      
      setPayments(userPayments);
      return userPayments;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch payments';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get payment by ID
  const getPaymentById = useCallback(async (id: string): Promise<Payment> => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`/payments/${id}`);
      return response.data.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch payment';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Download receipt
  const downloadReceipt = useCallback(async (paymentId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`/payments/receipt/${paymentId}`, {
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${paymentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to download receipt';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Request refund
  const requestRefund = useCallback(async (paymentId: string, reason: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      await axios.post(`/payments/${paymentId}/refund`, { reason });

      // Update local state
      setPayments(prev => prev.map(payment =>
        payment.id === paymentId
          ? { ...payment, status: 'refunded' as const }
          : payment
      ));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to request refund';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch payments with filters (admin)
  const fetchPayments = useCallback(async (filters?: PaymentFilters): Promise<Payment[]> => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get('/payments', { params: filters });
      const allPayments: Payment[] = response.data.data;
      
      setPayments(allPayments);
      return allPayments;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch payments';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    payments,
    loading,
    error,
    createOrder,
    verifyPayment,
    getMyPayments,
    getPaymentById,
    downloadReceipt,
    requestRefund,
    fetchPayments,
  };
};

// Made with Bob