import React from 'react';

export interface ISecurityAlertProps {
  ipAddress?: string;
  device?: string;
  timestamp?: string;
}

export const SecurityAlertBox: React.FC<ISecurityAlertProps> = ({ ipAddress = 'Unknown IP', device = 'Unknown Device', timestamp = new Date().toISOString() }) => (
  <div style={{ backgroundColor: '#1F2937', borderLeft: '4px solid #D4AF37', padding: '16px', margin: '20px 0', color: '#E5E7EB', fontSize: '13px' }}>
    <strong style={{ color: '#D4AF37', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Security Diagnostic Summary:</strong>
    <div style={{ margin: '4px 0' }}><strong>IP Address:</strong> {ipAddress}</div>
    <div style={{ margin: '4px 0' }}><strong>Device Fingerprint:</strong> {device}</div>
    <div style={{ margin: '4px 0' }}><strong>Timestamp (UTC):</strong> {timestamp}</div>
  </div>
);
