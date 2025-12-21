import React, { useState } from 'react';
import { FaHistory, FaCheckCircle, FaExclamationTriangle, FaCar, FaShieldAlt, FaFileAlt } from 'react-icons/fa';

interface CarHistoryReportProps {
  vin?: string;
  className?: string;
}

interface HistoryRecord {
  type: 'accident' | 'ownership' | 'service' | 'recall' | 'theft';
  date: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export default function CarHistoryReport({ vin = '1HGCM82633A123456', className = '' }: CarHistoryReportProps) {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Mock data - in real app, this would come from a VIN lookup service
  const mockReport = {
    vin: vin,
    make: 'Toyota',
    model: 'Corolla',
    year: 2018,
    mileage: 85000,
    accidents: 0,
    owners: 2,
    records: [
      {
        type: 'ownership' as const,
        date: '2023-01-15',
        description: 'Title transferred to current owner',
        severity: 'low' as const
      },
      {
        type: 'service' as const,
        date: '2022-08-20',
        description: 'Regular maintenance service completed',
        severity: 'low' as const
      },
      {
        type: 'ownership' as const,
        date: '2021-03-10',
        description: 'Previous owner transfer',
        severity: 'low' as const
      },
      {
        type: 'service' as const,
        date: '2020-11-05',
        description: 'Oil change and tire rotation',
        severity: 'low' as const
      }
    ] as HistoryRecord[],
    score: 85,
    status: 'clean'
  };

  const generateReport = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setReportData(mockReport);
      setLoading(false);
    }, 2000);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'accident': return <FaExclamationTriangle className="text-red-500" />;
      case 'ownership': return <FaFileAlt className="text-blue-500" />;
      case 'service': return <FaShieldAlt className="text-green-500" />;
      case 'recall': return <FaExclamationTriangle className="text-orange-500" />;
      case 'theft': return <FaExclamationTriangle className="text-red-500" />;
      default: return <FaHistory className="text-gray-500" />;
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <FaHistory className="text-blue-600" />
        <h3 className="text-lg font-semibold">Vehicle History Report</h3>
      </div>

      {!reportData ? (
        <div className="text-center py-8">
          <FaCar className="text-4xl text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-700 mb-2">Get Vehicle History Report</h4>
          <p className="text-gray-600 mb-4">
            Check accident history, ownership records, service history, and more for complete peace of mind.
          </p>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              VIN Number
            </label>
            <input
              type="text"
              value={vin}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
            />
          </div>
          <button
            onClick={generateReport}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Generating Report...' : 'Generate Report - $9.99'}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Vehicle Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-3">Vehicle Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">VIN:</span> {reportData.vin}
              </div>
              <div>
                <span className="font-medium">Vehicle:</span> {reportData.year} {reportData.make} {reportData.model}
              </div>
              <div>
                <span className="font-medium">Mileage:</span> {reportData.mileage.toLocaleString()} km
              </div>
              <div>
                <span className="font-medium">Owners:</span> {reportData.owners}
              </div>
            </div>
          </div>

          {/* Safety Score */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-2">
              <span className="text-2xl font-bold text-green-600">{reportData.score}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <FaCheckCircle className="text-green-600" />
              <span className="font-semibold text-green-600">{reportData.status.toUpperCase()} RECORD</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">No accidents reported</p>
          </div>

          {/* History Records */}
          <div>
            <h4 className="font-semibold mb-3">History Records</h4>
            <div className="space-y-3">
              {reportData.records.map((record: HistoryRecord, index: number) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="mt-1">
                    {getTypeIcon(record.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium capitalize">{record.type}</span>
                      <span className={`text-sm ${getSeverityColor(record.severity)}`}>
                        {record.severity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{record.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{record.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Report Summary */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Report Summary</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• No accidents or damage reported</li>
              <li>• {reportData.owners} previous owner{reportData.owners !== 1 ? 's' : ''}</li>
              <li>• Service history available</li>
              <li>• No outstanding recalls</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}