'use client';

import { useQuoteStore, getCurrentProductType, getCurrentColor } from '@/stores/quoteStore';
import { getPreviewProfileColors } from './WindowPreviewColors';

export default function WindowPreview() {
  const store = useQuoteStore();
  const productType = getCurrentProductType(store);
  const color = getCurrentColor(store);
  const { profileColor, detailColor, outerBorderColor } = getPreviewProfileColors(color?.hexValue);

  if (!productType) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Seleccione un tipo de producto
      </div>
    );
  }

  const code = productType.code;
  const aspect = store.widthMm / Math.max(store.heightMm, 1);

  const vbW = 320;
  const vbH = Math.round(320 / Math.max(aspect, 0.3));
  const margin = 30;
  const frameW = vbW - margin * 2;
  const frameH = vbH - margin * 2 - 20;
  const frameX = margin;
  const frameY = margin;
  const profileWidth = Math.max(6, Math.round(8 * (300 / Math.max(vbW, 200))));

  const renderFrame = () => {
    return (
      <g>
        {outerBorderColor && (
          <rect
            x={frameX - profileWidth / 2 - 0.5}
            y={frameY - profileWidth / 2 - 0.5}
            width={frameW + profileWidth + 1}
            height={frameH + profileWidth + 1}
            fill="none"
            stroke={outerBorderColor}
            strokeWidth={1}
            rx={2}
          />
        )}
        <rect
          x={frameX}
          y={frameY}
          width={frameW}
          height={frameH}
          fill="none"
          stroke={profileColor}
          strokeWidth={profileWidth}
          rx={2}
        />
      </g>
    );
  };

  const renderSliding = () => {
    const panels = store.panelCount;
    const panelWidth = frameW / panels;
    const overlap = 6; // Overlap between panels

    return (
      <g>
        {renderFrame()}
        {/* Panels */}
        {Array.from({ length: panels }).map((_, i) => {
          const x = frameX + i * panelWidth;
          // Glass fill
          return (
            <g key={i}>
              {/* Glass */}
              <rect
                x={x + profileWidth / 2 + 2}
                y={frameY + profileWidth / 2 + 2}
                width={panelWidth - profileWidth - 4}
                height={frameH - profileWidth - 4}
                fill="#E8F4FD"
                stroke={profileColor}
                strokeWidth={1.5}
                opacity={0.6 + i * 0.1}
              />
              {/* Panel frame (right side of each panel) */}
              {i < panels - 1 && (
                <line
                  x1={x + panelWidth}
                  y1={frameY + profileWidth / 2}
                  x2={x + panelWidth}
                  y2={frameY + frameH - profileWidth / 2}
                  stroke={profileColor}
                  strokeWidth={4}
                />
              )}
              {/* Handle */}
              <rect
                x={x + panelWidth - 14}
                y={frameY + frameH / 2 - 12}
                width={4}
                height={24}
                rx={2}
                fill={detailColor}
                stroke="#333"
                strokeWidth={0.5}
              />
            </g>
          );
        })}
        {/* Bottom rail */}
        <line
          x1={frameX + profileWidth / 2}
          y1={frameY + frameH - 3}
          x2={frameX + frameW - profileWidth / 2}
          y2={frameY + frameH - 3}
          stroke={detailColor}
          strokeWidth={1}
          strokeDasharray="4,3"
          opacity={0.5}
        />
        {/* Arrow indicators for sliding direction */}
        {panels > 1 && (
          <g opacity={0.4}>
            <line
              x1={frameX + frameW * 0.3}
              y1={frameY + frameH / 2}
              x2={frameX + frameW * 0.5}
              y2={frameY + frameH / 2}
              stroke={detailColor}
              strokeWidth={1.5}
              markerEnd="url(#arrowhead)"
            />
            <line
              x1={frameX + frameW * 0.7}
              y1={frameY + frameH / 2}
              x2={frameX + frameW * 0.5}
              y2={frameY + frameH / 2}
              stroke={detailColor}
              strokeWidth={1.5}
              markerEnd="url(#arrowhead)"
            />
          </g>
        )}
      </g>
    );
  };

  const renderHinged = () => {
    const panels = store.panelCount;
    const panelWidth = frameW / panels;

    return (
      <g>
        {renderFrame()}
        {Array.from({ length: panels }).map((_, i) => {
          const x = frameX + i * panelWidth;
          return (
            <g key={i}>
              {/* Glass */}
              <rect
                x={x + profileWidth / 2 + 2}
                y={frameY + profileWidth / 2 + 2}
                width={panelWidth - profileWidth - 4}
                height={frameH - profileWidth - 4}
                fill="#E8F4FD"
                stroke={profileColor}
                strokeWidth={1.5}
              />
              {/* Hinge line (vertical divider) */}
              {i < panels - 1 && (
                <line
                  x1={x + panelWidth}
                  y1={frameY + profileWidth / 2}
                  x2={x + panelWidth}
                  y2={frameY + frameH - profileWidth / 2}
                  stroke={profileColor}
                  strokeWidth={4}
                />
              )}
              {/* Hinge dots */}
              <circle cx={x + profileWidth / 2 + 4} cy={frameY + 30} r={3} fill={detailColor} />
              <circle cx={x + profileWidth / 2 + 4} cy={frameY + frameH - 30} r={3} fill={detailColor} />
              {/* Handle */}
              <rect
                x={x + panelWidth - 14}
                y={frameY + frameH / 2 - 12}
                width={4}
                height={24}
                rx={2}
                fill={detailColor}
                stroke="#333"
                strokeWidth={0.5}
              />
            </g>
          );
        })}
        {/* Opening arc */}
        <path
          d={`M${frameX + profileWidth / 2 + 2},${frameY + profileWidth / 2 + 2} Q${frameX + frameW * 0.15},${frameY + frameH * 0.3} ${frameX + profileWidth / 2 + 2},${frameY + frameH * 0.6}`}
          fill="none"
          stroke={detailColor}
          strokeWidth={1}
          strokeDasharray="3,3"
          opacity={0.4}
        />
      </g>
    );
  };

  const renderDoor = () => {
    const panels = store.panelCount;
    const panelWidth = frameW / panels;

    return (
      <g>
        {renderFrame()}
        {Array.from({ length: panels }).map((_, i) => {
          const x = frameX + i * panelWidth;
          return (
            <g key={i}>
              {/* Glass / panel */}
              <rect
                x={x + profileWidth / 2 + 2}
                y={frameY + profileWidth / 2 + 2}
                width={panelWidth - profileWidth - 4}
                height={frameH - profileWidth - 4}
                fill="#E8F4FD"
                stroke={profileColor}
                strokeWidth={1.5}
              />
              {/* Divider between panels */}
              {i < panels - 1 && (
                <line
                  x1={x + panelWidth}
                  y1={frameY + profileWidth / 2}
                  x2={x + panelWidth}
                  y2={frameY + frameH - profileWidth / 2}
                  stroke={profileColor}
                  strokeWidth={5}
                />
              )}
              {/* Door handle (larger) */}
              <rect
                x={x + panelWidth - 16}
                y={frameY + frameH / 2 - 18}
                width={5}
                height={36}
                rx={2.5}
                fill={detailColor}
                stroke="#333"
                strokeWidth={0.5}
              />
              {/* Keyhole */}
              <circle
                cx={x + panelWidth - 14}
                cy={frameY + frameH / 2 + 6}
                r={2}
                fill="#333"
              />
            </g>
          );
        })}
        {/* Threshold line */}
        <line
          x1={frameX - 5}
          y1={frameY + frameH}
          x2={frameX + frameW + 5}
          y2={frameY + frameH}
          stroke={profileColor}
          strokeWidth={3}
        />
      </g>
    );
  };

  const renderFixed = () => {
    return (
      <g>
        {renderFrame()}
        {/* Single glass pane */}
        <rect
          x={frameX + profileWidth / 2 + 2}
          y={frameY + profileWidth / 2 + 2}
          width={frameW - profileWidth - 4}
          height={frameH - profileWidth - 4}
          fill="#E8F4FD"
          stroke={profileColor}
          strokeWidth={1.5}
        />
        {/* Center cross (optional decorative) */}
        <line
          x1={frameX + frameW / 2}
          y1={frameY + profileWidth / 2 + 2}
          x2={frameX + frameW / 2}
          y2={frameY + frameH - profileWidth / 2 - 2}
          stroke={detailColor}
          strokeWidth={0.5}
          strokeDasharray="6,4"
          opacity={0.2}
        />
      </g>
    );
  };

  const renderProduct = () => {
    switch (code) {
      case 'corredera': return renderSliding();
      case 'abatible': return renderHinged();
      case 'puerta': return renderDoor();
      case 'fijo': return renderFixed();
      default: return renderFixed();
    }
  };

  return (
    <svg
      viewBox={`0 0 ${vbW} ${vbH}`}
      className="w-full h-auto"
      style={{ maxHeight: '240px' }}
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="8"
          markerHeight="6"
          refX="8"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 8 3, 0 6" fill={detailColor} opacity={0.4} />
        </marker>
      </defs>

      {/* Background */}
      <rect width={vbW} height={vbH} fill="#F9FAFB" rx={8} />

      {renderProduct()}

      {/* Dimension labels */}
      {/* Width label */}
      <g>
        <line x1={frameX} y1={frameY + frameH + 14} x2={frameX + frameW} y2={frameY + frameH + 14} stroke="#9CA3AF" strokeWidth={1} />
        <line x1={frameX} y1={frameY + frameH + 10} x2={frameX} y2={frameY + frameH + 18} stroke="#9CA3AF" strokeWidth={1} />
        <line x1={frameX + frameW} y1={frameY + frameH + 10} x2={frameX + frameW} y2={frameY + frameH + 18} stroke="#9CA3AF" strokeWidth={1} />
        <text x={frameX + frameW / 2} y={frameY + frameH + 24} textAnchor="middle" className="text-[10px]" fill="#6B7280" fontWeight="500">
          {(store.widthMm / 1000).toFixed(2)} m
        </text>
      </g>
      {/* Height label */}
      <g>
        <line x1={frameX - 14} y1={frameY} x2={frameX - 14} y2={frameY + frameH} stroke="#9CA3AF" strokeWidth={1} />
        <line x1={frameX - 18} y1={frameY} x2={frameX - 10} y2={frameY} stroke="#9CA3AF" strokeWidth={1} />
        <line x1={frameX - 18} y1={frameY + frameH} x2={frameX - 10} y2={frameY + frameH} stroke="#9CA3AF" strokeWidth={1} />
        <text x={frameX - 16} y={frameY + frameH / 2} textAnchor="middle" transform={`rotate(-90, ${frameX - 16}, ${frameY + frameH / 2})`} className="text-[10px]" fill="#6B7280" fontWeight="500">
          {(store.heightMm / 1000).toFixed(2)} m
        </text>
      </g>
    </svg>
  );
}
