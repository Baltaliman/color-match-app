import React, { useState } from "react";

// Simple utility functions
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
  // colors: [{h,s,v}, ...]
  let score = 100;
  const hues = colors.map(c => c.h);
  const sats = colors.map(c => c.s);
  const vals = colors.map(c => c.v);

  // Hue spread
  const maxHue = Math.max(...hues);
  const minHue = Math.min(...hues);
  const spread = maxHue - minHue;

  if (spread < 15) score -= 30;          // muddy / too similar
  else if (spread > 200) score -= 20;    // harsh contrast

  // Saturation balance
  const avgSat = sats.reduce((a,b)=>a+b,0)/sats.length;
  if (avgSat > 0.85) score -= 15;

  // Brightness balance
  const maxV = Math.max(...vals);
  const minV = Math.min(...vals);
  if (maxV - minV < 0.15) score -= 10;

  return Math.max(0, Math.min(100, score));
}

function verdict(score) {
  if (score >= 75) return "✅ Works well together";
  if (score >= 50) return "⚠️ Borderline match";
  return "❌ Likely clashes";
}

export default function ColorMatchApp() {
  const [images, setImages] = useState([null, null, null]);
  const [colors, setColors] = useState([]);
  const [score, setScore] = useState(null);

  function resetOutfit() {
    setImages([null, null, null]);
    setColors([]);
    setScore(null);
  }

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
      r=Math.round(r/count); g=Math.round(g/count); b=Math.round(b/count);
      const hsv = rgbToHsv(r,g,b);

      const newColors = [...colors];
      newColors[index] = hsv;
      setColors(newColors);
    };
  }

  function analyze() {
    if (colors.length === 3) {
      const s = harmonyScore(colors);
      setScore(s);
    }
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">Clothing Color Match (3 Items)</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[0,1,2].map(i => (
          <input key={i} type="file" accept="image/*"
            onChange={e => handleUpload(i, e.target.files[0])}
            className="p-2 border rounded" />
        ))}
      </div>

      <div className="flex gap-4">
      <button onClick={analyze}
        className="px-4 py-2 bg-black text-white rounded">
        Analyze Outfit
      </button>

      <button onClick={resetOutfit}
        className="px-4 py-2 bg-gray-200 text-black rounded">
        Start New Outfit
      </button>
    </div>

      {score !== null && (
        <div className="mt-6">
          <p className="text-xl font-semibold">Score: {score}/100</p>
          <p className="mt-2">{verdict(score)}</p>
        </div>
      )}
    </div>
  );
}
