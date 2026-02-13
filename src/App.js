import React, { useState } from "react";

function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, v = max;
  const d = max - min;
  s = max === 0 ? 0 : d / max;
  if (max === min) h = 0;
  else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: h = 0;
    }
    h /= 6;
  }
  return { h: h * 360, s, v };
}

function harmonyScore(colors) {
  let score = 100;
  const hues = colors.map(c => c.h);
  const sats = colors.map(c => c.s);
  const vals = colors.map(c => c.v);

  const spread = Math.max(...hues) - Math.min(...hues);
  if (spread < 15) score -= 30;
  else if (spread > 200) score -= 20;

  const avgSat = sats.reduce((a,b)=>a+b,0)/sats.length;
  if (avgSat > 0.85) score -= 15;

  if (Math.max(...vals) - Math.min(...vals) < 0.15) score -= 10;

  return Math.max(0, Math.min(100, score));
}

function verdict(score) {
  if (score >= 75) return "✅ Works well together";
  if (score >= 50) return "⚠️ Borderline match";
  return "❌ Likely clashes";
}

export default function App() {
  const [colors, setColors] = useState([]);
  const [resetKey, setResetKey] = useState(0);
  const [score, setScore] = useState(null);

  function handleUpload(index, file) {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = 100;
      canvas.height = 100;
      ctx.drawImage(img, 0, 0, 100, 100);
      const data = ctx.getImageData(0,0,100,100).data;

      let r=0,g=0,b=0,count=0;
      for (let i=0;i<data.length;i+=4) {
        r+=data[i]; g+=data[i+1]; b+=data[i+2]; count++;
      }
      const hsv = rgbToHsv(r/count, g/count, b/count);
      const newColors = [...colors];
      newColors[index] = hsv;
      setColors(newColors);
    };
  }

  function analyze() {
    if (colors.length === 3) {
      setScore(harmonyScore(colors));
    }
  }

 function reset() {
  setColors([]);
  setScore(null);
  setResetKey(prev => prev + 1);
}


  return (
    <div style={{ padding: 20 }}>
      <h2>Clothing Color Match (3 Items)</h2>

      {[0,1,2].map(i => (
        <input
          key={resetKey + "-" + i}
          type="file"
          accept="image/*"
          onChange={e => handleUpload(i, e.target.files[0])}
        />
      ))}

      <div style={{ marginTop: 20 }}>
        <button onClick={analyze}>Analyze Outfit</button>
        <button onClick={reset} style={{ marginLeft: 10 }}>
          Start New Outfit
        </button>
      </div>

      {score !== null && (
        <div style={{ marginTop: 20 }}>
          <strong>Score: {score}/100</strong>
          <p>{verdict(score)}</p>
        </div>
      )}
    </div>
  );
}
