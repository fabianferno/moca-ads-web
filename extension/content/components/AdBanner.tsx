import React from 'react';
import type { AdData } from '../utils/ads';

interface AdBannerProps {
    ad: AdData;
    variant?: 'banner' | 'inline' | 'sidebar';
    onClose?: () => void;
    onAdClick?: (adId: string) => void;
}

export const AdBanner: React.FC<AdBannerProps> = ({
    ad,
    variant = 'banner',
    onClose,
    onAdClick
}) => {
    const handleAdClick = () => {
        if (onAdClick) {
            onAdClick(ad.id);
        }
        // Open ad target URL
        if (ad.targetUrl !== '#') {
            window.open(ad.targetUrl, '_blank', 'noopener,noreferrer');
        }
    };

    const handleClose = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onClose) {
            onClose();
        }
    };

    if (variant === 'banner') {
        return (
            <div className="moca-ad-banner">
                {/* AD PREVIEW Header */}
                <div style={{
                    backgroundColor: '#000',
                    color: '#fff',
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    textAlign: 'left',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    borderBottom: '2px solid #000'
                }}>
                    AD PREVIEW
                </div>

                <div style={{
                    position: 'relative',
                    backgroundColor: '#f5f5f5',
                    border: '3px solid #000',
                    borderTop: 'none',
                    padding: '20px',
                    margin: '20px 0',
                    cursor: 'pointer',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                }}
                    onClick={handleAdClick}>

                    {/* Close button */}
                    <button
                        onClick={handleClose}
                        style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            background: '#ff4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 10
                        }}
                    >
                        ✕
                    </button>

                    <div style={{
                        backgroundColor: '#fff',
                        border: '2px solid #000',
                        padding: '16px',
                        borderRadius: '0'
                    }}>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            {/* Ad image */}
                            <div style={{ flexShrink: 0 }}>
                                <img
                                    src={ad.imageUrl}
                                    alt={ad.title}
                                    style={{
                                        width: '200px',
                                        height: '120px',
                                        objectFit: 'cover',
                                        border: '1px solid #ccc'
                                    }}
                                    onError={(e) => {
                                        // Fallback to gradient background if image fails
                                        (e.target as HTMLImageElement).style.display = 'none';
                                        const parent = (e.target as HTMLElement).parentElement;
                                        if (parent) {
                                            parent.style.background = 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)';
                                            parent.style.display = 'flex';
                                            parent.style.alignItems = 'center';
                                            parent.style.justifyContent = 'center';
                                            parent.style.color = 'white';
                                            parent.style.fontSize = '12px';
                                            parent.style.fontWeight = 'bold';
                                            parent.textContent = ad.category.toUpperCase();
                                        }
                                    }}
                                />
                            </div>

                            {/* Ad content */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <h3 style={{
                                    margin: '0 0 12px 0',
                                    fontSize: '18px',
                                    fontWeight: 'bold',
                                    color: '#000',
                                    lineHeight: '1.3'
                                }}>
                                    {ad.title}
                                </h3>

                                <p style={{
                                    margin: '0 0 16px 0',
                                    fontSize: '14px',
                                    color: '#333',
                                    lineHeight: '1.5'
                                }}>
                                    {ad.description}
                                </p>

                                <button
                                    style={{
                                        background: '#007bff',
                                        color: 'white',
                                        border: 'none',
                                        padding: '10px 20px',
                                        borderRadius: '4px',
                                        fontSize: '14px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer'
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleAdClick();
                                    }}
                                >
                                    {ad.ctaText}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (variant === 'inline') {
        return (
            <div className="moca-ad-inline">
                {/* AD PREVIEW Header */}
                <div style={{
                    backgroundColor: '#000',
                    color: '#fff',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    textAlign: 'left',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    borderBottom: '2px solid #000'
                }}>
                    AD PREVIEW
                </div>

                <div style={{
                    position: 'relative',
                    backgroundColor: '#f5f5f5',
                    border: '2px solid #000',
                    borderTop: 'none',
                    padding: '16px',
                    margin: '16px 0',
                    cursor: 'pointer',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                }}
                    onClick={handleAdClick}>

                    {/* Close button */}
                    <button
                        onClick={handleClose}
                        style={{
                            position: 'absolute',
                            top: '6px',
                            right: '6px',
                            background: '#ff4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '18px',
                            height: '18px',
                            fontSize: '10px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        ✕
                    </button>

                    <div style={{
                        backgroundColor: '#fff',
                        border: '1px solid #000',
                        padding: '12px'
                    }}>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <img
                                src={ad.imageUrl}
                                alt={ad.title}
                                style={{
                                    width: '80px',
                                    height: '80px',
                                    objectFit: 'cover',
                                    border: '1px solid #ccc',
                                    flexShrink: 0
                                }}
                            />

                            <div style={{ flex: 1, minWidth: 0 }}>
                                <h4 style={{
                                    margin: '0 0 8px 0',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    color: '#000'
                                }}>
                                    {ad.title}
                                </h4>

                                <p style={{
                                    margin: '0 0 12px 0',
                                    fontSize: '13px',
                                    color: '#333',
                                    lineHeight: '1.4'
                                }}>
                                    {ad.description}
                                </p>

                                <button
                                    style={{
                                        background: '#007bff',
                                        color: 'white',
                                        border: 'none',
                                        padding: '6px 16px',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer'
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleAdClick();
                                    }}
                                >
                                    {ad.ctaText}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (variant === 'sidebar') {
        return (
            <div className="moca-ad-sidebar">
                {/* AD PREVIEW Header */}
                <div style={{
                    backgroundColor: '#000',
                    color: '#fff',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    textAlign: 'left',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    borderBottom: '2px solid #000'
                }}>
                    AD PREVIEW
                </div>

                <div style={{
                    position: 'relative',
                    backgroundColor: '#f5f5f5',
                    border: '2px solid #000',
                    borderTop: 'none',
                    padding: '16px',
                    margin: '12px 0',
                    width: '280px',
                    cursor: 'pointer',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                }}
                    onClick={handleAdClick}>

                    {/* Close button */}
                    <button
                        onClick={handleClose}
                        style={{
                            position: 'absolute',
                            top: '6px',
                            right: '6px',
                            background: '#ff4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '18px',
                            height: '18px',
                            fontSize: '10px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        ✕
                    </button>

                    <div style={{
                        backgroundColor: '#fff',
                        border: '1px solid #000',
                        padding: '12px'
                    }}>
                        {/* Ad image */}
                        <img
                            src={ad.imageUrl}
                            alt={ad.title}
                            style={{
                                width: '100%',
                                height: '120px',
                                objectFit: 'cover',
                                border: '1px solid #ccc',
                                marginBottom: '12px'
                            }}
                        />

                        {/* Ad content */}
                        <h3 style={{
                            margin: '0 0 8px 0',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            color: '#000',
                            lineHeight: '1.2'
                        }}>
                            {ad.title}
                        </h3>

                        <p style={{
                            margin: '0 0 12px 0',
                            fontSize: '13px',
                            color: '#333',
                            lineHeight: '1.4'
                        }}>
                            {ad.description}
                        </p>

                        <button
                            style={{
                                width: '100%',
                                background: '#007bff',
                                color: 'white',
                                border: 'none',
                                padding: '8px',
                                borderRadius: '4px',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleAdClick();
                            }}
                        >
                            {ad.ctaText}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}; 