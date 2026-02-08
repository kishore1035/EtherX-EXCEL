/**
 * Font Verification Component
 * Use this to test if fonts are loading correctly
 */

import React, { useEffect, useState } from 'react';
import { FONT_REGISTRY, isFontLoaded, getComputedFontFamily, getFontCSS } from '../../config/fonts';

export function FontVerification() {
  const [fontStatus, setFontStatus] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const checkFonts = async () => {
      const status: { [key: string]: boolean } = {};
      
      for (const font of FONT_REGISTRY) {
        try {
          const loaded = await isFontLoaded(font.css);
          status[font.name] = loaded;
        } catch (e) {
          status[font.name] = false;
        }
      }
      
      setFontStatus(status);
      console.log('📊 Font Loading Status:', status);
    };
    
    // Check after document fonts are loaded
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(checkFonts);
    } else {
      // Fallback for older browsers
      setTimeout(checkFonts, 1000);
    }
  }, []);

  return (
    <div style={{
      position: 'fixed',
      bottom: 10,
      right: 10,
      background: 'white',
      border: '2px solid #FFD700',
      borderRadius: '8px',
      padding: '16px',
      maxHeight: '400px',
      overflowY: 'auto',
      zIndex: 10000,
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
    }}>
      <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 'bold' }}>
        Font Verification
      </h3>
      
      <div style={{ fontSize: '12px' }}>
        {FONT_REGISTRY.map((font) => {
          const testRef = React.useRef<HTMLDivElement>(null);
          
          React.useEffect(() => {
            if (testRef.current) {
              const computedFont = getComputedFontFamily(testRef.current);
              console.log(`Font Test - ${font.name}:`, {
                expected: font.css,
                computed: computedFont
              });
            }
          }, [fontStatus]);
          
          return (
            <div key={font.name} style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: fontStatus[font.name] === true ? '#00FF00' : 
                             fontStatus[font.name] === false ? '#FF0000' : 
                             '#FFFF00',
                  display: 'inline-block'
                }} />
                <strong>{font.name}</strong>
                {font.googleFont && <span style={{ fontSize: '10px', color: '#666' }}>(Google)</span>}
              </div>
              <div 
                ref={testRef}
                style={{ 
                  fontFamily: font.css,
                  fontSize: '16px',
                  marginTop: '4px',
                  padding: '4px',
                  background: '#f5f5f5',
                  borderRadius: '4px'
                }}
              >
                The quick brown fox jumps over the lazy dog 1234567890
              </div>
            </div>
          );
        })}
      </div>
      
      <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #ddd', fontSize: '10px', color: '#666' }}>
        <div>🟢 Green = Loaded</div>
        <div>🔴 Red = Failed</div>
        <div>🟡 Yellow = Checking...</div>
      </div>
    </div>
  );
}
