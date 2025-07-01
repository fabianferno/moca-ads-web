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
                <div style={{
                    position: 'relative',
                    backgroundColor: '#f4c430',
                    border: '3px solid #000',
                    borderRadius: '8px',
                    padding: '24px',
                    margin: '20px 0',
                    cursor: 'pointer',
                    fontFamily: 'Monaco, Consolas, "Lucida Console", "Courier New", monospace',
                    boxShadow: '4px 4px 0px #000'
                }}
                    onClick={handleAdClick}>

                    {/* Close button */}
                    <button
                        onClick={handleClose}
                        style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            background: '#ff4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            fontSize: '14px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 10
                        }}
                    >
                        ✕
                    </button>

                    {/* Image */}
                    <div style={{
                        width: '100px',
                        height: '100px',
                        border: '2px solid #000',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '20px',
                        overflow: 'hidden'
                    }}>
                        <img
                            src={ad.imageUrl}
                            alt={ad.title}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                            onError={(e) => {
                                // Fallback to gradient background if image fails
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                    parent.style.background = 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)';
                                    parent.style.color = 'white';
                                    parent.style.fontSize = '12px';
                                    parent.style.fontWeight = 'bold';
                                    parent.textContent = ad.category.toUpperCase();
                                }
                            }}
                        />
                    </div>

                    {/* Title */}
                    <h3 style={{
                        margin: '0 0 16px 0',
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color: '#000',
                        lineHeight: '1.2',
                        fontFamily: 'Monaco, Consolas, "Lucida Console", "Courier New", monospace',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                    }}>
                        {ad.title}
                    </h3>

                    {/* Description */}
                    <p style={{
                        margin: '0 0 24px 0',
                        fontSize: '16px',
                        color: '#333',
                        lineHeight: '1.5',
                        fontFamily: 'Monaco, Consolas, "Lucida Console", "Courier New", monospace'
                    }}>
                        {ad.description}
                    </p>

                    {/* CTA Button */}
                    <button
                        style={{
                            background: '#000',
                            color: 'white',
                            border: '2px solid #000',
                            padding: '12px 24px',
                            borderRadius: '4px',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            fontFamily: 'Monaco, Consolas, "Lucida Console", "Courier New", monospace',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            transition: 'all 0.2s ease'
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleAdClick();
                        }}
                        onMouseEnter={(e) => {
                            (e.target as HTMLButtonElement).style.background = 'white';
                            (e.target as HTMLButtonElement).style.color = '#000';
                        }}
                        onMouseLeave={(e) => {
                            (e.target as HTMLButtonElement).style.background = '#000';
                            (e.target as HTMLButtonElement).style.color = 'white';
                        }}
                    >
                        {ad.ctaText}
                    </button>
                </div>
            </div>
        );
    }

    if (variant === 'inline') {
        return (
            <div className="moca-ad-inline">
                <div style={{
                    position: 'relative',
                    backgroundColor: '#f4c430',
                    border: '3px solid #000',
                    borderRadius: '6px',
                    padding: '20px',
                    margin: '16px 0',
                    cursor: 'pointer',
                    fontFamily: 'Monaco, Consolas, "Lucida Console", "Courier New", monospace',
                    boxShadow: '3px 3px 0px #000'
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

                    <div style={{ display: 'flex', gap: '16px' }}>
                        {/* Image */}
                        <div style={{
                            width: '100px',
                            height: '100px',
                            border: '2px solid #000',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            flexShrink: 0
                        }}>
                            <img
                                src={ad.imageUrl}
                                alt={ad.title}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                }}
                                onError={(e) => {
                                    // Fallback to gradient background if image fails
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent) {
                                        parent.style.background = 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)';
                                        parent.style.color = 'white';
                                        parent.style.fontSize = '12px';
                                        parent.style.fontWeight = 'bold';
                                        parent.textContent = ad.category.toUpperCase();
                                    }
                                }}
                            />
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <h4 style={{
                                margin: '0 0 8px 0',
                                fontSize: '18px',
                                fontWeight: 'bold',
                                color: '#000',
                                lineHeight: '1.2',
                                fontFamily: 'Monaco, Consolas, "Lucida Console", "Courier New", monospace',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                {ad.title}
                            </h4>

                            <p style={{
                                margin: '0 0 12px 0',
                                fontSize: '14px',
                                color: '#333',
                                lineHeight: '1.4',
                                fontFamily: 'Monaco, Consolas, "Lucida Console", "Courier New", monospace'
                            }}>
                                {ad.description}
                            </p>

                            <button
                                style={{
                                    background: '#000',
                                    color: 'white',
                                    border: '2px solid #000',
                                    padding: '8px 16px',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    fontFamily: 'Monaco, Consolas, "Lucida Console", "Courier New", monospace',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    transition: 'all 0.2s ease'
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleAdClick();
                                }}
                                onMouseEnter={(e) => {
                                    (e.target as HTMLButtonElement).style.background = 'white';
                                    (e.target as HTMLButtonElement).style.color = '#000';
                                }}
                                onMouseLeave={(e) => {
                                    (e.target as HTMLButtonElement).style.background = '#000';
                                    (e.target as HTMLButtonElement).style.color = 'white';
                                }}
                            >
                                {ad.ctaText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (variant === 'sidebar') {
        return (
            <div className="moca-ad-sidebar">
                <div style={{
                    position: 'relative',
                    backgroundColor: '#f4c430',
                    border: '3px solid #000',
                    borderRadius: '6px',
                    padding: '20px',
                    margin: '12px 0',
                    width: '280px',
                    cursor: 'pointer',
                    fontFamily: 'Monaco, Consolas, "Lucida Console", "Courier New", monospace',
                    boxShadow: '3px 3px 0px #000'
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

                    {/* Image */}
                    <div style={{
                        width: '100px',
                        height: '100px',
                        border: '2px solid #000',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '16px',
                        overflow: 'hidden'
                    }}>
                        <img
                            src={ad.imageUrl}
                            alt={ad.title}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                            onError={(e) => {
                                // Fallback to gradient background if image fails
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                    parent.style.background = 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)';
                                    parent.style.color = 'white';
                                    parent.style.fontSize = '12px';
                                    parent.style.fontWeight = 'bold';
                                    parent.textContent = ad.category.toUpperCase();
                                }
                            }}
                        />
                    </div>

                    {/* Title */}
                    <h3 style={{
                        margin: '0 0 12px 0',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: '#000',
                        lineHeight: '1.2',
                        fontFamily: 'Monaco, Consolas, "Lucida Console", "Courier New", monospace',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}>
                        {ad.title}
                    </h3>

                    {/* Description */}
                    <p style={{
                        margin: '0 0 16px 0',
                        fontSize: '13px',
                        color: '#333',
                        lineHeight: '1.4',
                        fontFamily: 'Monaco, Consolas, "Lucida Console", "Courier New", monospace'
                    }}>
                        {ad.description}
                    </p>

                    {/* CTA Button */}
                    <button
                        style={{
                            width: '100%',
                            background: '#000',
                            color: 'white',
                            border: '2px solid #000',
                            padding: '10px',
                            borderRadius: '4px',
                            fontSize: '13px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            fontFamily: 'Monaco, Consolas, "Lucida Console", "Courier New", monospace',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            transition: 'all 0.2s ease'
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleAdClick();
                        }}
                        onMouseEnter={(e) => {
                            (e.target as HTMLButtonElement).style.background = 'white';
                            (e.target as HTMLButtonElement).style.color = '#000';
                        }}
                        onMouseLeave={(e) => {
                            (e.target as HTMLButtonElement).style.background = '#000';
                            (e.target as HTMLButtonElement).style.color = 'white';
                        }}
                    >
                        {ad.ctaText}
                    </button>
                </div>
            </div>
        );
    }

    return null;
}; 