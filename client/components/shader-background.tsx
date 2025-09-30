"use client";

import { useEffect, useRef } from "react";

export function ShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  let gl: WebGLRenderingContext | null = null;
  let program: WebGLProgram | null = null;
  let positionBuffer: WebGLBuffer | null = null;
  let positionLocation: number | null = null;
  let timeLocation: WebGLUniformLocation | null = null;
  let resolutionLocation: WebGLUniformLocation | null = null;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // @ts-ignore
    gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) {
      console.warn("WebGL not supported, falling back to matrix background");
      return;
    }

    // Vertex shader source
    const vertexShaderSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // Fragment shader source
    const fragmentShaderSource = `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      
      // WebGL-compatible tanh approximation
      float tanh_approx(float x) {
        float x2 = x * x;
        return x * (27.0 + x2) / (27.0 + 9.0 * x2);
      }
      
      vec4 tanh_approx(vec4 x) {
        return vec4(tanh_approx(x.x), tanh_approx(x.y), tanh_approx(x.z), tanh_approx(x.w));
      }
      
      // WebGL-compatible round function
      float round_approx(float x) {
        return floor(x + 0.5);
      }
      
      vec3 round_approx(vec3 x) {
        return vec3(round_approx(x.x), round_approx(x.y), round_approx(x.z));
      }
      
      void main() {
        vec2 FC = gl_FragCoord.xy;
        vec2 r = u_resolution;
        float t = u_time * 0.5;
        vec4 o = vec4(0.0);
        
        // Accelerator math implementation - fixed for WebGL
        for(float i = 0.0; i < 80.0; i++) {
          float z = i * 0.1;
          float d = 2.0;
          float s = 0.0;
          
          // Fixed: use proper vector construction instead of FC.rgb
          vec3 p = z * normalize(vec3(FC.xy * 2.0 - r.xy, 0.0));
          vec3 a = vec3(0.0);
          p.z += 9.0;
          
          // Simplified cross product calculation
          a += vec3(0.57);
          vec3 crossed = cross(a, p);
          a = dot(a, p) * crossed;
          s = sqrt(length(a.xz - vec2(a.y + 0.8)));
          
          for(float j = 2.0; j < 9.0; j++) {
            // Fixed: use round_approx and proper vector swizzling
            vec3 rounded = round_approx(a * j) - vec3(t);
            a += sin(rounded).yzx / j;
          }
          
          z = length(sin(a * 10.0)) * s * 0.05;
          d = max(z, 0.001); // Prevent division by zero
          o += vec4(s, 2.0, z, 1.0) / (s + 0.001) / (d + 0.001);
        }
        
        // Fixed: use tanh_approx instead of tanh
        o = tanh_approx(o * 0.00025);
        
        // Apply blue color theme and blend with background
        vec3 baseColor = vec3(0.02, 0.05, 0.15);
        vec3 accentColor = vec3(0.2, 0.5, 1.0);
        vec3 color = mix(baseColor, accentColor, clamp(o.rgb, 0.0, 1.0));
        
        gl_FragColor = vec4(color * 0.4, 0.6);
      }
    `;

    function createShader(type: number, source: string) {
      const shader = gl?.createShader(type);
      if (!shader) return null;

      gl?.shaderSource(shader, source);
      gl?.compileShader(shader);

      if (!gl?.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl?.getShaderInfoLog(shader));
        gl?.deleteShader(shader);
        return null;
      }

      return shader;
    }

    function createProgram(
      vertexShader: WebGLShader,
      fragmentShader: WebGLShader
    ) {
      const program = gl?.createProgram();
      if (!program) return null;

      gl?.attachShader(program, vertexShader);
      gl?.attachShader(program, fragmentShader);
      gl?.linkProgram(program);

      if (!gl?.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("Program link error:", gl?.getProgramInfoLog(program));
        gl?.deleteProgram(program);
        return null;
      }

      return program;
    }

    const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(
      gl.FRAGMENT_SHADER,
      fragmentShaderSource
    );

    if (!vertexShader || !fragmentShader) return;

    program = createProgram(vertexShader, fragmentShader);
    if (!program) return;

    // Set up geometry
    positionBuffer = gl?.createBuffer();
    gl?.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl?.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    positionLocation = gl?.getAttribLocation(program, "a_position");
    timeLocation = gl?.getUniformLocation(program, "u_time");
    resolutionLocation = gl?.getUniformLocation(program, "u_resolution");

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl?.viewport(0, 0, canvas.width, canvas.height);
    }

    function render(time: number) {
      if (!canvas || !program) return;

      gl?.clearColor(0.02, 0.05, 0.1, 1.0);
      gl?.clear(gl.COLOR_BUFFER_BIT);

      if (positionLocation !== null) {
        gl?.enableVertexAttribArray(positionLocation);
        gl?.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl?.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
      }

      gl?.uniform1f(timeLocation, time * 0.001);
      gl?.uniform2f(resolutionLocation, canvas.width, canvas.height);

      gl?.enable(gl.BLEND);
      gl?.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      gl?.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      animationRef.current = requestAnimationFrame(render);
    }

    resize();
    window.addEventListener("resize", resize);
    animationRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (gl && program) {
        gl.deleteProgram(program);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0 shader-background"
      style={{
        background: "linear-gradient(135deg, #020510 0%, #0a1628 100%)",
      }}
    />
  );
}
