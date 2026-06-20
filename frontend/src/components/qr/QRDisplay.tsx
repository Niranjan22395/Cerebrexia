import React, { useRef } from 'react';
import QRCode from 'qrcode.react';
import Button from '../common/Button';
import { Download, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { QRCode as QRCodeType } from '../../types';

interface QRDisplayProps {
  qrCode: QRCodeType;
  showDownload?: boolean;
  size?: number;
}

export const QRDisplay: React.FC<QRDisplayProps> = ({
  qrCode,
  showDownload = true,
  size = 256,
}) => {
  const qrRef = useRef<HTMLDivElement>(null);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const isValidToday = (): boolean => {
    const today = new Date().toDateString();
    const validDate = new Date(qrCode.validDate).toDateString();
    return today === validDate;
  };

  const getStatusInfo = () => {
    if (qrCode.isUsed) {
      return {
        icon: <XCircle className="w-6 h-6 text-red-500" />,
        text: 'Used',
        color: 'red',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-700',
      };
    }

    if (!isValidToday()) {
      return {
        icon: <Clock className="w-6 h-6 text-yellow-500" />,
        text: 'Not Valid Today',
        color: 'yellow',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-700',
      };
    }

    return {
      icon: <CheckCircle className="w-6 h-6 text-green-500" />,
      text: 'Valid',
      color: 'green',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700',
    };
  };

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;

    // Create a temporary link element
    const link = document.createElement('a');
    link.download = `qr-code-${qrCode.event?.name || 'event'}-${formatDate(qrCode.validDate)}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const status = getStatusInfo();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      {/* Status Badge */}
      <div className={`flex items-center justify-center p-4 rounded-lg ${status.bgColor} border ${status.borderColor}`}>
        <div className="flex items-center space-x-3">
          {status.icon}
          <div>
            <p className={`text-lg font-semibold ${status.textColor}`}>
              {status.text}
            </p>
            {qrCode.isUsed && qrCode.usedAt && (
              <p className="text-sm text-gray-600">
                Scanned on {formatDate(qrCode.usedAt)} at {formatTime(qrCode.usedAt)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Event Info */}
      {qrCode.event && (
        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold text-gray-900">{qrCode.event.name}</h3>
          <div className="flex items-center justify-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Valid for: {formatDate(qrCode.validDate)}</span>
          </div>
        </div>
      )}

      {/* QR Code Display */}
      <div className="flex justify-center" ref={qrRef}>
        <div className="p-4 bg-white border-4 border-gray-200 rounded-lg">
          <QRCode
            value={qrCode.code}
            size={size}
            level="H"
            includeMargin={true}
            renderAs="canvas"
          />
        </div>
      </div>

      {/* QR Code ID */}
      <div className="text-center">
        <p className="text-xs text-gray-500 font-mono">
          ID: {qrCode.id.substring(0, 8).toUpperCase()}
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">Instructions:</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Show this QR code at the entry gate</li>
          <li>QR code is valid only for {formatDate(qrCode.validDate)}</li>
          <li>Single-use only - cannot be reused after scanning</li>
          <li>Keep your phone charged or take a screenshot</li>
        </ul>
      </div>

      {/* Download Button */}
      {showDownload && !qrCode.isUsed && isValidToday() && (
        <Button
          variant="primary"
          fullWidth
          leftIcon={<Download className="w-4 h-4" />}
          onClick={downloadQR}
        >
          Download QR Code
        </Button>
      )}

      {/* Warning for Used QR */}
      {qrCode.isUsed && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800 text-center">
            This QR code has already been used and cannot be scanned again.
          </p>
        </div>
      )}

      {/* Warning for Invalid Date */}
      {!qrCode.isUsed && !isValidToday() && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800 text-center">
            This QR code is not valid for today. Please check your registration details.
          </p>
        </div>
      )}
    </div>
  );
};

// Made with Bob
