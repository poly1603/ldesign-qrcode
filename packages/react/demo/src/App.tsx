import { useState, useRef } from 'react';
import { QRCode, useQRCode, QRCodeRef } from '@ldesign/qrcode-react';
import './App.css';

function App() {
  // State
  const [content, setContent] = useState('https://github.com/ldesign/qrcode');
  const [dotStyle, setDotStyle] = useState<'square' | 'rounded' | 'dots' | 'diamond' | 'liquid'>('square');
  const [size, setSize] = useState(250);
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [animated, setAnimated] = useState(false);

  // Component ref
  const qrcodeRef = useRef<QRCodeRef>(null);

  // Hook demo
  const { containerRef: hookContainerRef } = useQRCode({
    content,
    style: {
      size: 250,
      dotStyle: 'dots',
      fgColor: '#059669',
      bgColor: '#ffffff'
    }
  }, {
    immediate: true
  });

  // Event handlers
  const handleDownload = () => {
    qrcodeRef.current?.download('qrcode', 'png');
  };

  return (
    <div className="app">
      <h1>🎨 QRCode React Demo</h1>

      <div className="controls">
        <h2>QR Code Generator</h2>
        <div className="form-group">
          <label>Content:</label>
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter content for QR code"
          />
        </div>
        <div className="form-group">
          <label>Dot Style:</label>
          <select value={dotStyle} onChange={(e) => setDotStyle(e.target.value as any)}>
            <option value="square">Square</option>
            <option value="rounded">Rounded</option>
            <option value="dots">Dots</option>
            <option value="diamond">Diamond</option>
            <option value="liquid">Liquid</option>
          </select>
        </div>
        <div className="form-group">
          <label>Size:</label>
          <input
            type="range"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            min="100"
            max="500"
            step="10"
          />
          <span>{size}px</span>
        </div>
        <div className="form-group">
          <label>Foreground Color:</label>
          <input
            type="color"
            value={fgColor}
            onChange={(e) => setFgColor(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Background Color:</label>
          <input
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={animated}
              onChange={(e) => setAnimated(e.target.checked)}
            />
            Enable Animation
          </label>
        </div>
        <button onClick={handleDownload}>Download QR Code</button>
      </div>

      <div className="demo-grid">
        {/* Component Demo */}
        <div className="demo-card">
          <h2>📦 Component Usage</h2>
          <p>Using the QRCode component with props</p>
          <div className="qrcode-container">
            <QRCode
              ref={qrcodeRef}
              content={content}
              size={size}
              fgColor={fgColor}
              bgColor={bgColor}
              dotStyle={dotStyle}
              animated={animated}
              onReady={(instance) => {
                console.log('QR code ready:', instance);
              }}
            />
          </div>
        </div>

        {/* Hook Demo */}
        <div className="demo-card">
          <h2>🎯 Hook Usage</h2>
          <p>Using useQRCode hook</p>
          <div className="qrcode-container">
            <div ref={hookContainerRef} />
          </div>
        </div>

        {/* Gradient Demo */}
        <div className="demo-card">
          <h2>🌈 Gradient QR Code</h2>
          <p>QR code with gradient colors</p>
          <div className="qrcode-container">
            <QRCode
              content={content}
              size={250}
              gradient={{
                type: 'radial',
                colors: ['#667eea', '#764ba2']
              }}
              bgColor="#ffffff"
            />
          </div>
        </div>

        {/* Styled Demo */}
        <div className="demo-card">
          <h2>✨ Styled QR Code</h2>
          <p>QR code with rounded style</p>
          <div className="qrcode-container">
            <QRCode
              content={content}
              size={250}
              dotStyle="rounded"
              fgColor="#2563eb"
              bgColor="#ffffff"
              cornerRadius={0.5}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

