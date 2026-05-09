import React, { useState, useEffect } from 'react';

interface SecurityModalProps {
    isOpen: boolean;
    onSuccess: () => void;
    onCancel: () => void;
    mode: 'pin' | 'faceid';
}

export default function SecurityModal({ isOpen, onSuccess, onCancel, mode }: SecurityModalProps) {
    const [pin, setPin] = useState('');
    const [isFaceScanning, setIsFaceScanning] = useState(false);
    const [scanComplete, setScanComplete] = useState(false);

    useEffect(() => {
        if (isOpen && mode === 'faceid') {
            setIsFaceScanning(true);
            setTimeout(() => {
                setScanComplete(true);
                setIsFaceScanning(false);
                setTimeout(onSuccess, 800);
            }, 2500);
        }
    }, [isOpen, mode, onSuccess]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
            zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div className="glass animate-fade-up" style={{
                width: '100%', maxWidth: '380px', padding: '40px', textAlign: 'center',
                background: '#1a202c', color: 'white', border: '1px solid var(--indigo-glow)'
            }}>
                {mode === 'faceid' ? (
                    <div>
                        <div style={{ fontSize: '3rem', marginBottom: '24px' }}>
                            {scanComplete ? '✅' : '🤳'}
                        </div>
                        <h3 style={{ color: 'white' }}>{scanComplete ? 'Signature Verified' : 'Scanning Face Signature'}</h3>
                        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                            {scanComplete ? 'Credora biometric vault unlocked.' : 'Authenticating through the global security bridge...'}
                        </p>
                        
                        {isFaceScanning && (
                            <div className="scanning-bar" style={{
                                height: '2px', background: 'var(--indigo)', width: '100%',
                                marginTop: '24px', animation: 'pulse 1s infinite'
                            }} />
                        )}
                    </div>
                ) : (
                    <div>
                        <div style={{ fontSize: '2.5rem', marginBottom: '20px' }}>🔐</div>
                        <h3 style={{ color: 'white' }}>Authorization PIN Required</h3>
                        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.82rem', marginBottom: '24px' }}>Enter your private Credora PIN to confirm dispatch.</p>
                        
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '32px' }}>
                            {[1, 2, 3, 4].map((_, i) => (
                                <div key={i} style={{
                                    width: '16px', height: '16px', borderRadius: '50%',
                                    background: pin.length > i ? 'var(--indigo)' : 'rgba(255,255,255,0.1)',
                                    border: '1px solid rgba(255,255,255,0.2)'
                                }} />
                            ))}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(n => (
                                <button key={n} className="btn-pin" onClick={() => {
                                    if (pin.length < 4) {
                                        const newPin = pin + n;
                                        setPin(newPin);
                                        if (newPin.length === 4) {
                                            setTimeout(onSuccess, 500);
                                        }
                                    }
                                }} style={{
                                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                    color: 'white', padding: '15px', borderRadius: '8px', fontWeight: 600, fontSize: '1.2rem',
                                    cursor: 'pointer'
                                }}>{n}</button>
                            ))}
                            <button className="btn-pin" onClick={() => setPin('')} style={{
                                gridColumn: 'span 2', background: 'rgba(225, 29, 72, 0.1)', color: '#e11d48',
                                border: '1px solid rgba(225, 29, 72, 0.2)', borderRadius: '8px'
                            }}>Clear</button>
                        </div>
                    </div>
                )}
                
                <button 
                  onClick={onCancel}
                  style={{ marginTop: '24px', background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                    Cancel Transaction
                </button>
            </div>
        </div>
    );
}
