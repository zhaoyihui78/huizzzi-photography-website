'use client';

import { useMemo, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MapControls, Image, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { seriesList } from '@/data/series';
import Slideshow from '@/components/Slideshow';

// 根据照片长宽比确定尺寸
const getDimensions = (width?: number, height?: number) => {
  if (!width || !height) return [3, 2];
  const aspect = width / height;
  if (aspect > 1) {
    return [3, 3 / aspect];
  } else {
    return [3 * aspect, 3];
  }
};

// 画布内的单张照片组件
function AtlasImage({ 
  photo, 
  position, 
  index,
  onClick
}: { 
  photo: any; 
  position: [number, number, number];
  index: number;
  onClick: (index: number) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [w, h] = getDimensions(photo.width, photo.height);
  const ref = useRef<any>(null);

  useFrame((state, delta) => {
    if (!ref.current) return;
    // 平滑插值动画：悬浮时放大并稍微前移
    const targetScale = hovered ? 1.05 : 1;
    const targetZ = hovered ? 0.5 : position[2];
    
    ref.current.scale.x = THREE.MathUtils.lerp(ref.current.scale.x, targetScale, 0.1);
    ref.current.scale.y = THREE.MathUtils.lerp(ref.current.scale.y, targetScale, 0.1);
    ref.current.position.z = THREE.MathUtils.lerp(ref.current.position.z, targetZ, 0.1);
    
    // 悬浮时降低透明度（或者高亮），这里使用材质上的 color 属性控制亮度
    if (ref.current.material) {
      const targetColor = hovered ? new THREE.Color('#ffffff') : new THREE.Color('#cccccc');
      ref.current.material.color.lerp(targetColor, 0.1);
    }
  });

  return (
    <group 
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
        setHovered(true);
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
        setHovered(false);
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(index);
      }}
    >
      <Image
        ref={ref}
        url={photo.thumb || photo.src}
        transparent
        scale={[w, h]}
      />
    </group>
  );
}

export default function AtlasCanvas() {
  const [slideshowOpen, setSlideshowOpen] = useState(false);
  const [slideshowIndex, setSlideshowIndex] = useState(0);

  // 将所有照片打平并赋予随机位置
  const { allPhotos, positions } = useMemo(() => {
    const photos = seriesList.flatMap(s => s.photos);
    const seen = new Set<string>();
    const uniquePhotos = photos.filter((p) => {
      if (seen.has(p.src)) return false;
      seen.add(p.src);
      return true;
    });

    // 简单的分布算法：在一个圆环区域内随机分布
    const pos: [number, number, number][] = [];
    const radiusStep = 1.5;
    const angleStep = 0.5;
    
    let currentRadius = 2;
    let currentAngle = 0;

    uniquePhotos.forEach((_, i) => {
      // 增加一点随机抖动
      const jitterX = (Math.random() - 0.5) * 2;
      const jitterY = (Math.random() - 0.5) * 2;
      
      const x = Math.cos(currentAngle) * currentRadius + jitterX;
      const y = Math.sin(currentAngle) * currentRadius + jitterY;
      const z = (Math.random() - 0.5) * 1; // 轻微的 Z 轴错落

      pos.push([x, y, z]);

      currentAngle += angleStep + (Math.random() * 0.2);
      if (currentAngle > Math.PI * 2) {
        currentAngle -= Math.PI * 2;
        currentRadius += radiusStep;
      }
    });

    return { allPhotos: uniquePhotos, positions: pos };
  }, []);

  const handlePhotoClick = (index: number) => {
    setSlideshowIndex(index);
    setSlideshowOpen(true);
  };

  return (
    <>
      <div className="absolute inset-0 z-0">
        <Canvas 
          camera={{ position: [0, 0, 15], fov: 45 }}
          gl={{ antialias: true, alpha: false }}
        >
          <color attach="background" args={['#050505']} />
          
          <fog attach="fog" args={['#050505', 10, 30]} />
          
          <ambientLight intensity={0.5} />
          
          <group>
            {allPhotos.map((photo, i) => (
              <AtlasImage 
                key={photo.src} 
                index={i}
                photo={photo} 
                position={positions[i]} 
                onClick={handlePhotoClick}
              />
            ))}
          </group>

          {/* MapControls 提供拖拽平移和滚动缩放 */}
          <MapControls 
            enableRotate={false} // 禁用旋转，保持 2D 俯视感
            enableDamping={true}
            dampingFactor={0.05}
            minDistance={2}
            maxDistance={25}
          />
        </Canvas>
      </div>

      <Slideshow
        photos={allPhotos}
        labels={allPhotos.map((i) => i.caption || i.alt)}
        initialIndex={slideshowIndex}
        isOpen={slideshowOpen}
        onClose={() => setSlideshowOpen(false)}
      />
    </>
  );
}