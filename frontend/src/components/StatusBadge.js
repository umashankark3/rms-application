import React from 'react';

const StatusBadge = ({ status }) => {
  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'new':
        return 'status-new';
      case 'reviewing':
        return 'status-reviewing';
      case 'assigned':
        return 'status-assigned';
      case 'shortlisted':
        return 'status-shortlisted';
      case 'rejected':
        return 'status-rejected';
      default:
        return 'status-new';
    }
  };

  return (
    <span className={`status-badge ${getStatusClass(status)}`}>
      {status}
    </span>
  );
};

export default StatusBadge;