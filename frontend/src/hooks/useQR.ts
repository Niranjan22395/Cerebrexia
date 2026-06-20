import { useState, useCallback } from 'react';
import axios from '../lib/axios';
import { QRCode, QRScanResult } from '../types';

interface UseQRReturn {
  qrCodes: QRCode[];
  loading: boolean;
  error: string | null;
  getMyQRCodes: () => Promise<QRCode[]>;
  getQRForEvent: (eventId: string) => Promise<QRCode>;
  generateQR: (eventId: string) => Promise<QRCode>;
  validateQR: (code: string) => Promise<boolean>;
  scanQR: (code: string) => Promise<QRScanResult>;
  downloadQR: (qrCode: QRCode) => void;
  refreshQRCodes: () => Promise<void>;
}

export const useQR = (): UseQRReturn => {
  const [qrCodes, setQRCodes] = useState<QRCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get user's QR codes
  const getMyQRCodes = useCallback(async (): Promise<QRCode[]> => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get('/qr/my');
      const codes: QRCode[] = response.data.data;
      
      setQRCodes(codes);
      return codes;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch QR codes';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get QR code for specific event
  const getQRForEvent = useCallback(async (eventId: string): Promise<QRCode> => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`/qr/${eventId}`);
      const qrCode: QRCode = response.data.data;

      // Update local state
      setQRCodes(prev => {
        const exists = prev.find(qr => qr.id === qrCode.id);
        if (exists) {
          return prev.map(qr => qr.id === qrCode.id ? qrCode : qr);
        }
        return [...prev, qrCode];
      });

      return qrCode;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch QR code';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Generate new QR code
  const generateQR = useCallback(async (eventId: string): Promise<QRCode> => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post('/qr/generate', { eventId });
      const qrCode: QRCode = response.data.data;

      // Add to local state
      setQRCodes(prev => [...prev, qrCode]);

      return qrCode;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to generate QR code';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Validate QR code
  const validateQR = useCallback(async (code: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`/qr/validate/${code}`);
      return response.data.data.valid;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to validate QR code';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Scan QR code (gate staff)
  const scanQR = useCallback(async (code: string): Promise<QRScanResult> => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post('/qr/scan', { code });
      const result: QRScanResult = response.data.data;

      // Update local state if QR was successfully scanned
      if (result.success && result.qrCode) {
        setQRCodes(prev => prev.map(qr =>
          qr.id === result.qrCode?.id
            ? { ...qr, isUsed: true, usedAt: new Date().toISOString() }
            : qr
        ));
      }

      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to scan QR code';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Download QR code as image
  const downloadQR = useCallback((qrCode: QRCode) => {
    try {
      // Create a canvas element
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');

      // Set canvas size
      canvas.width = 512;
      canvas.height = 512;

      // Draw white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Note: In a real implementation, you would use a QR code library here
      // For now, we'll create a placeholder
      ctx.fillStyle = 'black';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('QR Code', canvas.width / 2, canvas.height / 2);
      ctx.fillText(qrCode.code, canvas.width / 2, canvas.height / 2 + 30);

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (!blob) return;
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `qr-${qrCode.event?.name || 'code'}-${new Date().toISOString().split('T')[0]}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      });
    } catch (err: any) {
      console.error('Failed to download QR code:', err);
      setError('Failed to download QR code');
    }
  }, []);

  // Refresh QR codes
  const refreshQRCodes = useCallback(async () => {
    await getMyQRCodes();
  }, [getMyQRCodes]);

  return {
    qrCodes,
    loading,
    error,
    getMyQRCodes,
    getQRForEvent,
    generateQR,
    validateQR,
    scanQR,
    downloadQR,
    refreshQRCodes,
  };
};

// Made with Bob