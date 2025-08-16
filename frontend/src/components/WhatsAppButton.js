import React, { useState } from 'react';
import { useMutation } from 'react-query';
import api from '../api/client';

const WhatsAppButton = ({ candidateName, skills, resumeId }) => {
  const [phone, setPhone] = useState('');
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [shareLink, setShareLink] = useState(null);
  const [error, setError] = useState('');

  const createShareLinkMutation = useMutation(
    () => api.shareLinks.create(resumeId, 1440), // 24 hours
    {
      onSuccess: (data) => {
        setShareLink(data.shareLink);
        setError('');
      },
      onError: (error) => {
        setError(error.message);
      }
    }
  );

  const handleWhatsAppClick = () => {
    if (!shareLink) {
      // First create a share link
      createShareLinkMutation.mutate();
      return;
    }

    if (!phone.trim()) {
      setShowPhoneInput(true);
      return;
    }

    // Create WhatsApp message
    const skillsText = skills ? skills.split(',').slice(0, 3).join(', ') : 'Various skills';
    const message = `Hi! Please review this candidate: ${candidateName}. Skills: ${skillsText}. Resume: ${shareLink.url}`;
    
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
  };

  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    if (phone.trim()) {
      setShowPhoneInput(false);
      handleWhatsAppClick();
    }
  };

  if (showPhoneInput) {
    return (
      <div className="whatsapp-phone-input" style={{ display: 'inline-block' }}>
        <form onSubmit={handlePhoneSubmit} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <input
            type="text"
            placeholder="+91XXXXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{ 
              width: '150px', 
              padding: '5px', 
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '12px'
            }}
            autoFocus
          />
          <button
            type="submit"
            className="btn-small whatsapp-btn"
            disabled={!phone.trim()}
          >
            <i className="material-icons">send</i>
          </button>
          <button
            type="button"
            className="btn-small red"
            onClick={() => setShowPhoneInput(false)}
          >
            <i className="material-icons">close</i>
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ display: 'inline-block' }}>
      {error && (
        <div style={{ fontSize: '10px', color: 'red', marginBottom: '5px' }}>
          {error}
        </div>
      )}
      
      <button
        className="btn-flat btn-small whatsapp-btn"
        onClick={handleWhatsAppClick}
        disabled={createShareLinkMutation.isLoading}
        title="Share on WhatsApp"
      >
        {createShareLinkMutation.isLoading ? (
          <div className="preloader-wrapper tiny active">
            <div className="spinner-layer spinner-white-only">
              <div className="circle-clipper left">
                <div className="circle"></div>
              </div>
              <div className="gap-patch">
                <div className="circle"></div>
              </div>
              <div className="circle-clipper right">
                <div className="circle"></div>
              </div>
            </div>
          </div>
        ) : (
          <i className="material-icons">chat</i>
        )}
      </button>
    </div>
  );
};

export default WhatsAppButton;