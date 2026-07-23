import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function NeuralField() {
  const mountRef = useRef(null)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return undefined

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(55, container.clientWidth / container.clientHeight, 0.1, 100)
    camera.position.set(0, 2.5, 9)

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
    renderer.setSize(container.clientWidth, container.clientHeight)
    container.appendChild(renderer.domElement)

    const geometry = new THREE.PlaneGeometry(18, 12, 72, 48)
    const base = Float32Array.from(geometry.attributes.position.array)
    const material = new THREE.PointsMaterial({
      color: 0xd8d8d3,
      size: 0.035,
      transparent: true,
      opacity: 0.55,
    })
    const points = new THREE.Points(geometry, material)
    points.rotation.x = -1.08
    points.position.y = -1.4
    scene.add(points)

    const clock = new THREE.Clock()
    let frame
    const render = () => {
      const time = clock.getElapsedTime()
      const positions = geometry.attributes.position.array
      for (let index = 0; index < positions.length; index += 3) {
        const x = base[index]
        const y = base[index + 1]
        positions[index + 2] = Math.sin(x * 0.72 + time * 0.28) * 0.32 + Math.cos(y * 0.8 - time * 0.22) * 0.26
      }
      geometry.attributes.position.needsUpdate = true
      points.rotation.z = Math.sin(time * 0.08) * 0.025
      renderer.render(scene, camera)
      frame = window.requestAnimationFrame(render)
    }
    render()

    const resize = () => {
      camera.aspect = container.clientWidth / container.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth, container.clientHeight)
    }
    window.addEventListener('resize', resize)

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return <div className="neural-field" ref={mountRef} aria-hidden="true" data-marketing-three="true" />
}
