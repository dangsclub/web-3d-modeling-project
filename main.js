// 1. Scene, Camera, Renderer 기본 설정
const container = document.getElementById('canvas-container');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1e1e24);

const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(3, 3, 4);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

// 조명 추가
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 7);
scene.add(directionalLight);

// 2. 단계별 튜토리얼 데이터 정의
const tutorialSteps = [
  {
    title: "📌 Step 1. 기본형(Cube) 이해하기",
    desc: "와콤 펜으로 패드 위를 가볍게 터치하듯, 3D 공간 속 기본 정육면체의 면과 모서리를 살펴봅니다.",
    geometry: new THREE.BoxGeometry(1.2, 1.2, 1.2),
    color: 0x4cc9f0
  },
  {
    title: "📌 Step 2. 형태 늘리기 (Extrude/Scale)",
    desc: "와콤 펜으로 드래그하듯 오브젝트의 높낮이를 조절하여 기둥 형태로 변형하는 단계입니다.",
    geometry: new THREE.BoxGeometry(1, 2.2, 1),
    color: 0xf72585
  },
  {
    title: "📌 Step 3. 곡선 다듬기 (Smoothing)",
    desc: "각진 모서리를 둥글게 깎아내어 부드러운 유기적 형태(구 또는 실린더)로 다듬는 과정입니다.",
    geometry: new THREE.SphereGeometry(1, 32, 32),
    color: 0x43aa8b
  }
];

let currentStep = 0;
let currentMesh = null;

// 머티리얼 설정
const material = new THREE.MeshStandardMaterial({
  roughness: 0.3,
  metalness: 0.2,
});

// 모델 교체 함수
function updateModel(stepIndex) {
  if (currentMesh) {
    scene.remove(currentMesh); // 이전 도형 삭제
  }

  const stepData = tutorialSteps[stepIndex];
  material.color.setHex(stepData.color);
  
  currentMesh = new THREE.Mesh(stepData.geometry, material);
  scene.add(currentMesh);

  // UI 텍스트 업데이트
  document.getElementById('step-title').innerText = stepData.title;
  document.getElementById('step-desc').innerText = stepData.desc;

  // 버튼 활성/비활성 처리
  document.getElementById('prev-btn').disabled = (stepIndex === 0);
  document.getElementById('next-btn').disabled = (stepIndex === tutorialSteps.length - 1);
  document.getElementById('next-btn').innerText = (stepIndex === tutorialSteps.length - 1) ? "완료!" : "다음 단계로 가기 ➔";
}

// 초기 모델 로드
updateModel(currentStep);

// 마우스/와콤 펜 컨트롤
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// 버튼 이벤트 연결
document.getElementById('next-btn').addEventListener('click', () => {
  if (currentStep < tutorialSteps.length - 1) {
    currentStep++;
    updateModel(currentStep);
  }
});

document.getElementById('prev-btn').addEventListener('click', () => {
  if (currentStep > 0) {
    currentStep--;
    updateModel(currentStep);
  }
});

// 애니메이션 루프
function animate() {
  requestAnimationFrame(animate);

  if (currentMesh) {
    currentMesh.rotation.y += 0.005;
  }

  controls.update();
  renderer.render(scene, camera);
}
animate();

// 반응형 대응
window.addEventListener('resize', () => {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
});
