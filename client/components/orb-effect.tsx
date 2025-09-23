"use client";
import { useRef, useEffect } from "react";
import * as THREE from "three";
import { Canvas, useFrame, extend } from "@react-three/fiber";

const fragmentShader = `
uniform float iTime;
uniform vec2 iResolution;

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * iResolution.xy) / iResolution.y;
    float t = iTime;

    // ---------------- ORB ----------------
    float orb = exp(-dot(uv, uv) * 8.0);

    // ---------------- RADIAL BEAMS ----------------
    float angle = atan(uv.x, uv.y);   // angle around orb
    float radius = length(uv);

    // fan only in bottom half
    float maskBottom = step(uv.y, 0.0);

    float beams = sin(angle * 20.0 + t * 2.0);
    beams = smoothstep(0.7, 1.0, beams);       // sharpen streaks
    beams *= exp(-radius * 2.0);               // fade outward
    beams *= maskBottom;

    // ---------------- LASER BEAM (TOP) ----------------
    float laser = exp(-uv.x * uv.x * 200.0);   // narrow in x
    laser *= smoothstep(0.0, 0.2, uv.y);       // only top half
    laser *= exp(-uv.y * 1.5);                 // fade upward

    // ---------------- COMBINE ----------------
    vec3 col = vec3(0.0);
    col += orb * vec3(0.1, 0.3, 1.0);     // bluish orb
    col += beams * vec3(0.2, 0.6, 1.0);   // fan beams
    col += laser * vec3(0.5, 0.8, 1.0);   // laser beam

    gl_FragColor = vec4(col, 1.0);
}
`;

const vertexShader = `
void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

function OrbShader() {
  const materialRef = useRef<THREE.ShaderMaterial>(null!);

  useFrame(({ clock, size }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.iTime.value = clock.getElapsedTime();
      materialRef.current.uniforms.iResolution.value.set(
        size.width,
        size.height
      );
    }
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={{
          iTime: { value: 0 },
          iResolution: {
            value: new THREE.Vector2(window.innerWidth, window.innerHeight),
          },
        }}
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
      />
    </mesh>
  );
}

export default function OrbEffect() {
  return (
    <div className="w-screen h-screen">
      <Canvas orthographic camera={{ position: [0, 0, 1], zoom: 1 }}>
        <OrbShader />
      </Canvas>
    </div>
  );
}
