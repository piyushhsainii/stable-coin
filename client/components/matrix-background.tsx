"use client"

import { useEffect, useState } from "react"

const ACCELERATOR_CODE = `for(float i,z,d,s;i++<8e4;o+=vec4(s,2,z,i))vec3 p=Z*normalize(FC.rgb*2.-rxy);s=p.z*!=9.;a=dot(a+=.57p)*a*cross(a,p);s=sqrt(length(a.xz-a.y-.8));for(d=2;d++<9.;a=sin(round(a*d)-t)yzx/d);z+=d=length(sin(a/a)*s/2e1;)o=tan(h/4e3);`

export function MatrixBackground() {
  const [lines, setLines] = useState<Array<{ id: number; left: number; delay: number; code: string }>>([])

  useEffect(() => {
    const generateLines = () => {
      const newLines = []
      for (let i = 0; i < 20; i++) {
        newLines.push({
          id: i,
          left: Math.random() * 100,
          delay: Math.random() * 15,
          code: ACCELERATOR_CODE.slice(Math.random() * ACCELERATOR_CODE.length),
        })
      }
      setLines(newLines)
    }

    generateLines()
    const interval = setInterval(generateLines, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="matrix-code">
      {lines.map((line) => (
        <div
          key={line.id}
          className="matrix-line"
          style={{
            left: `${line.left}%`,
            animationDelay: `${line.delay}s`,
          }}
        >
          {line.code}
        </div>
      ))}
    </div>
  )
}
