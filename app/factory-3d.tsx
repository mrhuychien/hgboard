"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import * as THREE from "three";

type Factory3DProps = {
  focus?: number;
  mode?: "hero" | "journey";
};

type MovingBean = THREE.Mesh & {
  userData: { offset: number; speed: number; branch: "bean" | "sugar" };
};

const STATIONS = [
  new THREE.Vector3(-10.2, 0, 4.2),
  new THREE.Vector3(-7.1, 0, 4.1),
  new THREE.Vector3(-3.8, 0, 4.1),
  new THREE.Vector3(-0.4, 0, 4.1),
  new THREE.Vector3(3.1, 0, 4.1),
  new THREE.Vector3(6.6, 0, 4.1),
  new THREE.Vector3(2.8, 0, -2.4),
  new THREE.Vector3(6.6, 0, -2.4),
  new THREE.Vector3(10.1, 0, -2.4),
];

const STATION_NAMES = ["LUỘC", "RANG", "Ủ NGUỘI", "VỠ ĐỖ", "XAY NGHIỀN", "ĐƯỜNG HOÁN", "PHỐI TRỘN", "Ủ · CÁN", "ĐÓNG GÓI"];

function material(color: number, roughness = 0.46, metalness = 0.08) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

function box(
  size: [number, number, number],
  position: [number, number, number],
  mat: THREE.Material,
  radius = 0,
) {
  const geometry = radius
    ? new THREE.BoxGeometry(size[0], size[1], size[2], 2, 2, 2)
    : new THREE.BoxGeometry(...size);
  const mesh = new THREE.Mesh(geometry, mat);
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function cylinder(
  radius: number,
  height: number,
  position: [number, number, number],
  mat: THREE.Material,
  radial = 32,
) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, radial), mat);
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function pipeBetween(a: THREE.Vector3, b: THREE.Vector3, mat: THREE.Material, radius = 0.12) {
  const delta = new THREE.Vector3().subVectors(b, a);
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, delta.length(), 18), mat);
  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.clone().normalize());
  mesh.castShadow = true;
  return mesh;
}

function addPipeRoute(group: THREE.Group, points: THREE.Vector3[], mat: THREE.Material) {
  points.slice(0, -1).forEach((point, index) => {
    group.add(pipeBetween(point, points[index + 1], mat));
    const joint = new THREE.Mesh(new THREE.SphereGeometry(0.18, 18, 18), mat);
    joint.position.copy(points[index + 1]);
    joint.castShadow = true;
    group.add(joint);
  });
}

function labelSprite(text: string, color: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 144;
  const context = canvas.getContext("2d")!;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "rgba(249,252,248,.94)";
  context.beginPath();
  context.roundRect(4, 4, 504, 136, 42);
  context.fill();
  context.fillStyle = color;
  context.font = "700 32px Arial";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text.toUpperCase(), 256, 73);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }));
  sprite.scale.set(3.2, 0.9, 1);
  return sprite;
}

function boiler(silver: THREE.Material, dark: THREE.Material) {
  const group = new THREE.Group();
  const bowl = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.05, 1.55, 38, 1, true), silver);
  bowl.position.y = 1;
  bowl.castShadow = true;
  group.add(bowl, cylinder(1.28, 0.12, [0, 1.78, 0], dark));
  const liquid = cylinder(1.03, 0.05, [0, 1.7, 0], material(0xb98934, 0.32));
  group.add(liquid);
  for (let i = 0; i < 9; i += 1) {
    const bubble = new THREE.Mesh(new THREE.SphereGeometry(0.07 + (i % 3) * 0.025, 12, 12), material(0xf4d77b));
    bubble.position.set(Math.sin(i * 2.3) * 0.72, 1.75, Math.cos(i * 1.7) * 0.68);
    bubble.userData.bubble = i;
    group.add(bubble);
  }
  return group;
}

function roaster(silver: THREE.Material, dark: THREE.Material, orange: THREE.Material) {
  const group = new THREE.Group();
  group.add(box([2.7, 1.7, 1.75], [0, 1.15, 0], silver));
  const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.76, 0.76, 2.25, 32), dark);
  drum.rotation.z = Math.PI / 2;
  drum.position.set(0, 1.45, 0);
  drum.castShadow = true;
  drum.userData.spin = "drum";
  group.add(drum);
  group.add(box([0.88, 0.6, 0.08], [0, 1.45, 0.92], orange));
  group.add(box([1.2, 0.85, 1.1], [-0.45, 2.45, 0], silver));
  return group;
}

function woodenBin(wood: THREE.Material) {
  const group = new THREE.Group();
  group.add(box([2.35, 1.55, 2.2], [0, 0.95, 0], wood));
  group.add(box([2.48, 0.14, 0.16], [0, 1.73, 1.05], material(0x80512d)));
  group.add(box([2.48, 0.14, 0.16], [0, 1.73, -1.05], material(0x80512d)));
  const cloth = box([2.1, 0.1, 1.95], [0, 1.82, 0], material(0xd9d5bd, 0.85));
  cloth.userData.breathe = true;
  group.add(cloth);
  return group;
}

function breaker(red: THREE.Material, dark: THREE.Material) {
  const group = new THREE.Group();
  group.add(box([2.25, 1.75, 1.7], [0, 1.1, 0], red));
  const hopper = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.42, 1.05, 4), red);
  hopper.position.set(0, 2.48, 0);
  hopper.rotation.y = Math.PI / 4;
  group.add(hopper);
  group.add(cylinder(0.46, 0.18, [0.92, 1.22, 0], dark));
  const fan = new THREE.Group();
  for (let i = 0; i < 5; i += 1) {
    const blade = box([0.12, 0.62, 0.12], [0, 0.26, 0], dark);
    blade.rotation.z = (i / 5) * Math.PI * 2;
    fan.add(blade);
  }
  fan.position.set(1.17, 1.24, 0);
  fan.rotation.y = Math.PI / 2;
  fan.userData.spin = "fan";
  group.add(fan);
  return group;
}

function grinder(silver: THREE.Material, blue: THREE.Material) {
  const group = new THREE.Group();
  group.add(box([2.5, 0.15, 1.9], [0, 0.16, 0], silver));
  group.add(cylinder(1.02, 2.7, [0, 1.6, 0], silver));
  const cone = new THREE.Mesh(new THREE.ConeGeometry(1.02, 1.25, 32), silver);
  cone.rotation.z = Math.PI;
  cone.position.y = 0.55;
  group.add(cone);
  group.add(box([1.25, 1.1, 1.45], [1.55, 0.78, 0], blue));
  return group;
}

function sugarPan(silver: THREE.Material, yellow: THREE.Material) {
  const group = new THREE.Group();
  group.add(cylinder(1.25, 0.85, [0, 0.78, 0], silver));
  group.add(cylinder(1.08, 0.08, [0, 1.22, 0], yellow));
  const shaft = cylinder(0.09, 2.25, [0, 1.95, 0], material(0x59635f, 0.32, 0.55));
  group.add(shaft);
  const paddle = box([1.45, 0.1, 0.16], [0, 1.08, 0], material(0x59635f));
  paddle.userData.spin = "paddle";
  group.add(paddle);
  group.add(box([1.3, 0.62, 1.3], [0.9, 2.82, 0], silver));
  return group;
}

function mixer(silver: THREE.Material, green: THREE.Material) {
  const group = new THREE.Group();
  group.add(box([2.8, 1.45, 2], [0, 1.1, 0], silver));
  const chamber = box([2.45, 0.95, 1.75], [0, 1.5, 0], green);
  chamber.userData.pulse = true;
  group.add(chamber);
  const shaft = new THREE.Group();
  for (let i = 0; i < 4; i += 1) {
    const paddle = box([0.15, 0.72, 0.12], [0, 0.34, 0], silver);
    paddle.rotation.z = (i / 4) * Math.PI * 2;
    shaft.add(paddle);
  }
  shaft.position.set(0, 1.55, 1.02);
  shaft.rotation.y = Math.PI / 2;
  shaft.userData.spin = "mixer";
  group.add(shaft);
  return group;
}

function roller(silver: THREE.Material, green: THREE.Material) {
  const group = new THREE.Group();
  group.add(box([2.45, 2.05, 1.75], [0, 1.2, 0], silver));
  group.add(box([2, 0.7, 1.45], [0, 2.28, 0], green));
  [-0.48, 0.48].forEach((x) => {
    const roll = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 1.65, 28), material(0xa5b4ae, 0.25, 0.72));
    roll.rotation.x = Math.PI / 2;
    roll.position.set(x, 1.22, 0);
    roll.userData.spin = "roll";
    group.add(roll);
  });
  return group;
}

function packer(silver: THREE.Material, dark: THREE.Material, orange: THREE.Material) {
  const group = new THREE.Group();
  group.add(box([2.7, 2.65, 2], [0, 1.5, 0], silver));
  group.add(box([1.55, 1.05, 0.1], [0, 1.72, 1.02], dark));
  group.add(box([0.92, 0.5, 0.08], [0, 1.72, 1.08], orange));
  group.add(box([3.9, 0.22, 1.05], [1.95, 0.58, 0], dark));
  return group;
}

function buildFactory(scene: THREE.Scene) {
  const root = new THREE.Group();
  root.name = "factory";
  scene.add(root);

  const silver = material(0xd7e2df, 0.25, 0.55);
  const silverDark = material(0x65736f, 0.28, 0.62);
  const green = material(0x276d5f, 0.45);
  const greenDark = material(0x163b35, 0.42);
  const orange = material(0xed7142, 0.42);
  const red = material(0xd84e38, 0.46);
  const blue = material(0x3b6f82, 0.48);
  const wood = material(0xb87942, 0.88);
  const yellow = material(0xf1cf66, 0.5);
  const pipe = material(0xf2f6f3, 0.22, 0.25);

  const floor = box([27, 0.35, 12], [0, -0.25, 0], material(0xeaf0ec, 0.88));
  floor.receiveShadow = true;
  root.add(floor);

  const grid = new THREE.GridHelper(26, 26, 0xc9d6d0, 0xdce5e1);
  grid.position.y = -0.06;
  root.add(grid);

  const stations = [
    boiler(silver, silverDark),
    roaster(silver, silverDark, orange),
    woodenBin(wood),
    breaker(red, silverDark),
    grinder(silver, blue),
    sugarPan(silver, yellow),
    mixer(silver, green),
    roller(silver, green),
    packer(silver, greenDark, orange),
  ];
  stations.forEach((station, index) => {
    station.position.copy(STATIONS[index]);
    station.userData.station = index;
    root.add(station);
    const label = labelSprite(STATION_NAMES[index], "#16322e");
    label.position.copy(STATIONS[index]).add(new THREE.Vector3(0, 3.8, 0));
    label.userData.stationLabel = index;
    root.add(label);
  });

  const beanRoute = [
    new THREE.Vector3(-11.8, 0.48, 4.2),
    new THREE.Vector3(-10.1, 0.48, 4.2),
    new THREE.Vector3(-7.1, 0.48, 4.2),
    new THREE.Vector3(-3.8, 0.48, 4.2),
    new THREE.Vector3(-0.4, 0.48, 4.2),
    new THREE.Vector3(3.1, 0.48, 4.2),
    new THREE.Vector3(5.2, 0.48, 4.2),
    new THREE.Vector3(5.2, 0.48, -2.4),
    new THREE.Vector3(6.6, 0.48, -2.4),
    new THREE.Vector3(10.1, 0.48, -2.4),
    new THREE.Vector3(12, 0.48, -2.4),
  ];
  const sugarRoute = [
    new THREE.Vector3(2.8, 0.52, -5.1),
    new THREE.Vector3(2.8, 0.52, -2.4),
    new THREE.Vector3(6.6, 0.52, -2.4),
  ];
  addPipeRoute(root, beanRoute, pipe);
  addPipeRoute(root, sugarRoute, material(0xf5d164, 0.36));

  const beanCurve = new THREE.CatmullRomCurve3(beanRoute, false, "catmullrom", 0.08);
  const sugarCurve = new THREE.CatmullRomCurve3(sugarRoute, false, "catmullrom", 0.08);
  const beans: MovingBean[] = [];
  for (let i = 0; i < 34; i += 1) {
    const bean = new THREE.Mesh(new THREE.SphereGeometry(0.13, 15, 12), i < 27 ? yellow : orange) as MovingBean;
    bean.scale.set(1.35, 0.72, 0.92);
    bean.userData = { offset: i / 34, speed: 0.018 + (i % 4) * 0.0014, branch: i < 27 ? "bean" : "sugar" };
    bean.castShadow = true;
    root.add(bean);
    beans.push(bean);
  }

  const trolley = new THREE.Group();
  trolley.add(box([1.3, 0.22, 1], [0, 0.48, 0], silverDark));
  trolley.add(box([1.12, 0.75, 0.82], [0, 0.94, 0], silver));
  [[-.48,.25], [.48,.25], [-.48,-.25], [.48,-.25]].forEach(([x,z]) => {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.1, 14), greenDark);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, 0.28, z);
    trolley.add(wheel);
  });
  trolley.userData.trolley = true;
  root.add(trolley);

  return { root, beans, beanCurve, sugarCurve, trolley };
}

export default function Factory3D({ focus = 0, mode = "hero" }: Factory3DProps) {
  const mount = useRef<HTMLDivElement>(null);
  const focusRef = useRef(focus);
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    focusRef.current = focus;
  }, [focus]);

  useEffect(() => {
    const container = mount.current;
    if (!container) return;
    container.dataset.status = "loading";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const webglProbe = document.createElement("canvas");
    if (!webglProbe.getContext("webgl2") && !webglProbe.getContext("webgl")) {
      container.dataset.status = "fallback";
      return;
    }
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(mode === "hero" ? 0xf2f6f2 : 0x102f2a);
    scene.fog = new THREE.Fog(scene.background, mode === "hero" ? 29 : 24, 47);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    } catch {
      container.dataset.status = "fallback";
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.65));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    container.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(36, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(mode === "hero" ? 16 : 9, mode === "hero" ? 17 : 11, mode === "hero" ? 20 : 14);
    camera.lookAt(0, 0.6, 0);

    scene.add(new THREE.HemisphereLight(0xffffff, mode === "hero" ? 0xd8e3dc : 0x173c35, 2.8));
    const key = new THREE.DirectionalLight(0xffffff, 4.2);
    key.position.set(-9, 18, 12);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.left = -22;
    key.shadow.camera.right = 22;
    key.shadow.camera.top = 16;
    key.shadow.camera.bottom = -16;
    scene.add(key);
    const rim = new THREE.DirectionalLight(mode === "hero" ? 0xc8efc5 : 0x6ed9b5, 2.2);
    rim.position.set(12, 8, -10);
    scene.add(rim);

    const { root, beans, beanCurve, sugarCurve, trolley } = buildFactory(scene);
    if (mode === "journey") root.position.set(0, 0, 0);
    container.dataset.status = "ready";

    let frame = 0;
    let isVisible = true;
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => { isVisible = entry.isIntersecting; },
      { rootMargin: "220px" },
    );
    visibilityObserver.observe(container);
    const clock = new THREE.Clock();
    const targetCamera = camera.position.clone();
    const targetLook = new THREE.Vector3();
    const currentLook = new THREE.Vector3();

    const animate = () => {
      if (!isVisible) {
        frame = requestAnimationFrame(animate);
        return;
      }
      const t = clock.getElapsedTime();
      const active = Math.min(Math.max(focusRef.current, 0), STATIONS.length - 1);
      const station = STATIONS[active];

      if (mode === "hero") {
        targetCamera.set(16 + pointer.current.x * 1.3, 17 - pointer.current.y * 0.8, 20 + pointer.current.x * 0.4);
        targetLook.set(0.2, 0.5, 0.7);
        root.rotation.y = Math.sin(t * 0.18) * 0.025;
      } else {
        const offset = active < 6 ? new THREE.Vector3(3.9, 7.4, 8.8) : new THREE.Vector3(4.8, 7.1, 8.3);
        targetCamera.copy(station).add(offset).add(new THREE.Vector3(pointer.current.x * 0.45, -pointer.current.y * 0.25, 0));
        targetLook.copy(station).add(new THREE.Vector3(0, 1.2, 0));
      }
      camera.position.lerp(targetCamera, reduced ? 1 : 0.045);
      currentLook.lerp(targetLook, reduced ? 1 : 0.065);
      camera.lookAt(currentLook);

      if (!reduced) {
        beans.forEach((bean) => {
          const curve = bean.userData.branch === "bean" ? beanCurve : sugarCurve;
          const progress = (bean.userData.offset + t * bean.userData.speed) % 1;
          bean.position.copy(curve.getPointAt(progress));
          bean.rotation.x = t * 2.2 + bean.userData.offset * 5;
          bean.rotation.z = t * 1.4;
        });
        const trolleyPoint = beanCurve.getPointAt((t * 0.027 + 0.11) % 1);
        trolley.position.copy(trolleyPoint).add(new THREE.Vector3(0, 0.08, 0.72));

        root.traverse((object) => {
          if (object.userData.spin === "drum") object.rotation.x += 0.014;
          if (object.userData.spin === "fan") object.rotation.z -= 0.085;
          if (object.userData.spin === "paddle") object.rotation.y += 0.055;
          if (object.userData.spin === "mixer") object.rotation.z += 0.06;
          if (object.userData.spin === "roll") object.rotation.z += 0.055;
          if (object.userData.breathe) object.position.y = 1.82 + Math.sin(t * 1.5) * 0.035;
          if (object.userData.pulse) object.scale.y = 1 + Math.sin(t * 2.5) * 0.012;
          if (typeof object.userData.bubble === "number") {
            const index = object.userData.bubble as number;
            object.position.y = 1.74 + ((t * (0.2 + index * 0.008) + index / 9) % 1) * 1.45;
            object.scale.setScalar(0.65 + ((t * 0.4 + index * 0.17) % 1) * 0.45);
          }
          if (typeof object.userData.station === "number") {
            const selected = object.userData.station === active;
            const desired = mode === "journey" && selected ? 1.09 : 1;
            object.scale.lerp(new THREE.Vector3(desired, desired, desired), 0.08);
          }
          if (typeof object.userData.stationLabel === "number") {
            const selected = object.userData.stationLabel === active;
            (object as THREE.Sprite).material.opacity = mode === "hero" ? 1 : selected ? 1 : 0.28;
          }
        });
      }
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    animate();

    const resize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    const move = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      pointer.current.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      pointer.current.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    window.addEventListener("resize", resize);
    container.addEventListener("pointermove", move, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      visibilityObserver.disconnect();
      window.removeEventListener("resize", resize);
      container.removeEventListener("pointermove", move);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const mats = Array.isArray(object.material) ? object.material : [object.material];
          mats.forEach((mat) => mat.dispose());
        }
        if (object instanceof THREE.Sprite) {
          object.material.map?.dispose();
          object.material.dispose();
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [mode]);

  return (
    <div className={`factory3d factory3d-${mode}`} ref={mount} aria-label="Mô hình 3D dây chuyền sản xuất bánh đậu xanh">
      <div className="factory3d-fallback">
          <Image fill sizes={mode === "hero" ? "(max-width: 760px) 100vw, 55vw" : "55vw"} priority={mode === "hero"} src="/factory/process-machines.jpg" alt="Thiết bị thực tế trong dây chuyền sản xuất bánh đậu xanh" />
          <div>
            <span>CHẾ ĐỘ DỰ PHÒNG</span>
            <strong>{STATION_NAMES[Math.min(Math.max(focus, 0), STATION_NAMES.length - 1)]}</strong>
            <p>Thiết bị này không hỗ trợ WebGL. Nội dung và thông số quy trình vẫn hoạt động đầy đủ.</p>
          </div>
      </div>
      <div className="factory3d-loading"><span />Đang dựng xưởng 3D</div>
    </div>
  );
}
