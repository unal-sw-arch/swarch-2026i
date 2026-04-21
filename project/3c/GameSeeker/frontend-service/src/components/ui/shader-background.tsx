'use client';

/**
 * ShaderBackground — WebGL plasma wave effect adapted for the Digital Sanctuary.
 *
 * Sourced from: https://21st.dev/community/components/thanh/shader-background/default
 * Adapted: warm espresso palette, section-scoped canvas, proper cleanup,
 *          prefers-reduced-motion fallback, SSR-safe.
 *
 * Colors tuned to Digital Sanctuary:
 *   Background gradient: #140c0c (warm espresso) → #1c0f0e (slightly warmer)
 *   Line color:          #ff9a5d (sunset orange) with lavender #9b7ec8 tint
 */

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Shaders
// ---------------------------------------------------------------------------

const VS_SOURCE = `
  attribute vec4 aVertexPosition;
  void main() {
    gl_Position = aVertexPosition;
  }
`;

// Fragment shader — warm sanctuary plasma wave
const FS_SOURCE = `
  precision highp float;
  uniform vec2 iResolution;
  uniform float iTime;

  const float overallSpeed      = 0.15;
  const float gridSmoothWidth   = 0.015;
  const float axisWidth         = 0.05;
  const float majorLineWidth    = 0.025;
  const float minorLineWidth    = 0.0125;
  const float majorLineFrequency = 5.0;
  const float minorLineFrequency = 1.0;
  const float scale             = 5.0;

  // Warm sunset orange line color
  const vec4 lineColor = vec4(1.0, 0.60, 0.36, 1.0);

  const float minLineWidth      = 0.008;
  const float maxLineWidth      = 0.18;
  const float lineSpeed         = 1.0 * overallSpeed;
  const float lineAmplitude     = 1.0;
  const float lineFrequency     = 0.2;
  const float warpSpeed         = 0.2 * overallSpeed;
  const float warpFrequency     = 0.5;
  const float warpAmplitude     = 1.0;
  const float offsetFrequency   = 0.5;
  const float offsetSpeed       = 1.33 * overallSpeed;
  const float minOffsetSpread   = 0.6;
  const float maxOffsetSpread   = 2.0;
  const int   linesPerGroup     = 14;

  #define drawCircle(pos, radius, coord) smoothstep(radius + gridSmoothWidth, radius, length(coord - (pos)))
  #define drawSmoothLine(pos, halfWidth, t) smoothstep(halfWidth, 0.0, abs(pos - (t)))
  #define drawCrispLine(pos, halfWidth, t) smoothstep(halfWidth + gridSmoothWidth, halfWidth, abs(pos - (t)))
  #define drawPeriodicLine(freq, width, t) drawCrispLine(freq / 2.0, width, abs(mod(t, freq) - (freq) / 2.0))

  float drawGridLines(float axis) {
    return drawCrispLine(0.0, axisWidth, axis)
      + drawPeriodicLine(majorLineFrequency, majorLineWidth, axis)
      + drawPeriodicLine(minorLineFrequency, minorLineWidth, axis);
  }

  float drawGrid(vec2 space) {
    return min(1.0, drawGridLines(space.x) + drawGridLines(space.y));
  }

  float random(float t) {
    return (cos(t) + cos(t * 1.3 + 1.3) + cos(t * 1.4 + 1.4)) / 3.0;
  }

  float getPlasmaY(float x, float horizontalFade, float offset) {
    return random(x * lineFrequency + iTime * lineSpeed) * horizontalFade * lineAmplitude + offset;
  }

  void main() {
    vec2 fragCoord = gl_FragCoord.xy;
    vec2 uv        = fragCoord.xy / iResolution.xy;
    vec2 space     = (fragCoord - iResolution.xy / 2.0) / iResolution.x * 2.0 * scale;

    float horizontalFade = 1.0 - (cos(uv.x * 6.28) * 0.5 + 0.5);
    float verticalFade   = 1.0 - (cos(uv.y * 6.28) * 0.5 + 0.5);

    space.y += random(space.x * warpFrequency + iTime * warpSpeed) * warpAmplitude * (0.5 + horizontalFade);
    space.x += random(space.y * warpFrequency + iTime * warpSpeed + 2.0) * warpAmplitude * horizontalFade;

    vec4 lines = vec4(0.0);

    // Warm espresso background — #140c0c → #200f0d
    vec4 bgColor1 = vec4(0.078, 0.047, 0.047, 1.0);
    vec4 bgColor2 = vec4(0.125, 0.059, 0.051, 1.0);

    for (int l = 0; l < linesPerGroup; l++) {
      float normalizedLineIndex = float(l) / float(linesPerGroup);
      float offsetTime     = iTime * offsetSpeed;
      float offsetPosition = float(l) + space.x * offsetFrequency;
      float rand = random(offsetPosition + offsetTime) * 0.5 + 0.5;
      float halfWidth = mix(minLineWidth, maxLineWidth, rand * horizontalFade) / 2.0;
      float offset = random(offsetPosition + offsetTime * (1.0 + normalizedLineIndex))
                      * mix(minOffsetSpread, maxOffsetSpread, horizontalFade);

      float linePosition = getPlasmaY(space.x, horizontalFade, offset);
      float line = drawSmoothLine(linePosition, halfWidth, space.y) / 2.0
                 + drawCrispLine(linePosition, halfWidth * 0.15, space.y);

      float circleX = mod(float(l) + iTime * lineSpeed, 25.0) - 12.0;
      vec2 circlePosition = vec2(circleX, getPlasmaY(circleX, horizontalFade, offset));
      float circle = drawCircle(circlePosition, 0.01, space) * 4.0;

      line = line + circle;

      // Blend between sunset orange and lavender based on line index
      float t = normalizedLineIndex;
      vec4 warmColor = mix(
        vec4(1.0, 0.60, 0.36, 1.0),   // sunset orange #ff9a5d
        vec4(0.61, 0.49, 0.78, 1.0),  // lavender #9b7ec8
        t * 0.6
      );
      lines += line * warmColor * rand * 0.8;
    }

    vec4 fragColor = mix(bgColor1, bgColor2, uv.x + uv.y * 0.3);
    fragColor *= verticalFade;
    fragColor.a = 1.0;
    fragColor += lines;

    gl_FragColor = fragColor;
  }
`;

// ---------------------------------------------------------------------------
// WebGL helpers
// ---------------------------------------------------------------------------

function loadShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('[ShaderBackground] Compile error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function initShaderProgram(
  gl: WebGLRenderingContext,
  vs: string,
  fs: string,
): WebGLProgram | null {
  const vert = loadShader(gl, gl.VERTEX_SHADER, vs);
  const frag = loadShader(gl, gl.FRAGMENT_SHADER, fs);
  if (!vert || !frag) return null;

  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('[ShaderBackground] Link error:', gl.getProgramInfoLog(program));
    return null;
  }
  return program;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ShaderBackgroundProps {
  className?: string;
  /** Opacity of the canvas — lower = more subtle behind hero content */
  opacity?: number;
}

export function ShaderBackground({ className, opacity = 1 }: ShaderBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Respect reduced motion — skip heavy WebGL animation
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) {
      console.warn('[ShaderBackground] WebGL not supported — falling back to CSS gradient.');
      return;
    }

    const program = initShaderProgram(gl, VS_SOURCE, FS_SOURCE);
    if (!program) return;

    // Full-screen quad
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const vertexLoc   = gl.getAttribLocation(program, 'aVertexPosition');
    const resolutionLoc = gl.getUniformLocation(program, 'iResolution');
    const timeLoc      = gl.getUniformLocation(program, 'iTime');

    const resize = () => {
      const parent = canvas.parentElement;
      canvas.width  = parent ? parent.offsetWidth  : window.innerWidth;
      canvas.height = parent ? parent.offsetHeight : window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);
    resize();

    const startTime = Date.now();
    let rafId: number;

    const render = () => {
      const t = (Date.now() - startTime) / 1000;
      gl.clearColor(0.078, 0.047, 0.047, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);
      gl.uniform2f(resolutionLoc, canvas.width, canvas.height);
      gl.uniform1f(timeLoc, t);

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(vertexLoc, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(vertexLoc);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ opacity }}
      className={cn('absolute inset-0 w-full h-full pointer-events-none', className)}
    />
  );
}
