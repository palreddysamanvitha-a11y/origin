import React, { useEffect, useRef, useState } from 'react';

interface Props {
  imageSrc: string;
  onDetected: (skinTone: string, rgb: { r: number; g: number; b: number }) => void;
}

export const SkinToneDetector: React.FC<Props> = ({ imageSrc, onDetected }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (!imageSrc) return;

    const analyze = async () => {
      setIsAnalyzing(true);
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageSrc;

      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        // Set canvas size to a small manageable size for analysis
        canvas.width = 100;
        canvas.height = 100;
        ctx.drawImage(img, 0, 0, 100, 100);

        const imageData = ctx.getImageData(0, 0, 100, 100).data;
        let r = 0, g = 0, b = 0, count = 0;

        // Simple skin tone detection algorithm
        // We look for pixels that fall within typical skin color ranges
        for (let i = 0; i < imageData.length; i += 4) {
          const pr = imageData[i];
          const pg = imageData[i + 1];
          const pb = imageData[i + 2];

          // Basic skin color heuristic (R > G > B and specific ratios)
          if (pr > 60 && pg > 40 && pb > 20 && pr > pg && pr > pb && (pr - pg) > 15) {
            r += pr;
            g += pg;
            b += pb;
            count++;
          }
        }

        if (count > 0) {
          const avgR = Math.round(r / count);
          const avgG = Math.round(g / count);
          const avgB = Math.round(b / count);

          // Classify based on brightness/hue
          let category = "Medium";
          const brightness = (avgR + avgG + avgB) / 3;

          if (brightness > 200) category = "Fair";
          else if (brightness > 150) category = "Medium";
          else if (brightness > 100) category = "Olive";
          else category = "Deep";

          onDetected(category, { r: avgR, g: avgG, b: avgB });
        } else {
          // Fallback to center area average if no skin-like pixels found
          const centerData = ctx.getImageData(40, 40, 20, 20).data;
          let cr = 0, cg = 0, cb = 0;
          for (let i = 0; i < centerData.length; i += 4) {
            cr += centerData[i];
            cg += centerData[i + 1];
            cb += centerData[i + 2];
          }
          const avgR = Math.round(cr / (centerData.length / 4));
          const avgG = Math.round(cg / (centerData.length / 4));
          const avgB = Math.round(cb / (centerData.length / 4));
          onDetected("Medium", { r: avgR, g: avgG, b: avgB });
        }
        setIsAnalyzing(false);
      };
    };

    analyze();
  }, [imageSrc, onDetected]);

  return (
    <div className="hidden">
      <canvas ref={canvasRef} />
    </div>
  );
};
