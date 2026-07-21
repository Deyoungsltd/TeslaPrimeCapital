import React from 'react';

export const EmailHeader: React.FC<{ title?: string }> = ({ title = 'Enterprise Notification' }) => (
  <div style={{ backgroundColor: '#0B0F19', padding: '24px', textAlign: 'center', borderBottom: '2px solid #D4AF37' }}>
    <h1 style={{ color: '#D4AF37', fontSize: '24px', fontWeight: 'bold', margin: 0, letterSpacing: '2px' }}>
      TESLAPRIME CAPITAL
    </h1>
    <p style={{ color: '#9CA3AF', fontSize: '11px', textTransform: 'uppercase', margin: '4px 0 0 0', letterSpacing: '1px' }}>
      {title}
    </p>
  </div>
);
