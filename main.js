// 1. Scene, Camera, Renderer 준비
const container = document.getElementById('canvas-container');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1e1e24);

const camera = new THREE.PerspectiveCamera(
  60,
  container.clientWidth / container.clientHeight,
  0.1,
  1000
);
camera.position.set(2, 2, 3);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

// 2. 조명(Light) 추가
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 7);
scene.add(directionalLight);

// 3. 3D 모델(Cube) 생성
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({
  color: 0x4cc9f0,
  roughness: 0.3,
  metalness: 0.2,
});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// 4. 마우스 인터랙션 (OrbitControls)
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // 부드러운 감쇄 효과

// 5. 애니메이션 루프
function animate() {
  requestAnimationFrame(animate);

  // 기본 자동 회전
  cube.rotation.x += 0.005;
  cube.rotation.y += 0.005;

  controls.update();
  renderer.render(scene, camera);
}
animate();

// 6. 창 크기 조절 대응 (반응형)
window.addEventListener('resize', () => {
  const width = container.clientWidth;
  const height = container.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
});
