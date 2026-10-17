// --- 1. 상태 및 데이터 정의 ---
const refContainer = document.getElementById('ref-canvas-container');
const workContainer = document.getElementById('work-canvas-container');

// 검색어별 맞춤 튜토리얼 데이터베이스
const modelDatabase = {
  "활 쏘는 장군": {
    name: "활 쏘는 장군 모델",
    steps: [
      {
        title: "📌 Step 1. 상체 및 활시위 기본 포지션 잡기",
        desc: "<strong>[정밀 코칭]</strong> 펜을 중앙 하단에 대고, <strong>필압 0.4</strong>로 바깥쪽을 향해 <strong>0.5cm</strong> 정도 밀어내어 상체의 기본 볼륨을 만드세요.",
        color: 0x3b82f6
      },
      {
        title: "📌 Step 2. 활을 겨누는 팔 라인 늘리기",
        desc: "<strong>[정밀 코칭]</strong> 왼쪽 측면에 펜을 대고, <strong>필압 0.7</strong>의 강도로 쭉 당겨 활을 뻗은 팔의 실루엣을 정확히 만드세요.",
        color: 0xec4899
      },
      {
        title: "📌 Step 3. 자세 다듬기 및 세부 디테일 완성",
        desc: "<strong>[정밀 코칭]</strong> 전체적인 균형을 확인하며 펜을 가볍게(필압 0.2) 터치하여 표면의 각진 부분을 부드럽게 깎아 장군의 자세를 완성합니다.",
        color: 0x10b981
      }
    ]
  },
  "기본": {
    name: "기본 인체 모델",
    steps: [
      {
        title: "📌 Step 1. 두상 형태 잡기",
        desc: "<strong>[정밀 코칭]</strong> 상단 구 형태에 펜을 대고 필압 0.3으로 가볍게 밀어 두개골의 기초 윤곽을 잡으세요.",
        color: 0x3b82f6
      },
      {
        title: "📌 Step 2. 어깨와 몸통 확장",
        desc: "<strong>[정밀 코칭]</strong> 중앙 부위에 펜을 누르고 필압 0.6으로 좌우를 넓혀 상체 볼륨을 만드세요.",
        color: 0xec4899
      }
    ]
  }
};

let currentSearchKey = "활 쏘는 장군";
let currentStep = 0;
let activeMode = 'deform';

// --- 2. 레퍼런스 뷰어 (왼쪽) ---
const refScene = new THREE.Scene();
refScene.background = new THREE.Color(0x09090b);

const refCamera = new THREE.PerspectiveCamera(50, refContainer.clientWidth / refContainer.clientHeight, 0.1, 1000);
refCamera.position.set(0, 1.5, 4);

const refRenderer = new THREE.WebGLRenderer({ antialias: true });
refRenderer.setSize(refContainer.clientWidth, refContainer.clientHeight);
refRenderer.setPixelRatio(window.devicePixelRatio);
refContainer.appendChild(refRenderer.domElement);

refScene.add(new THREE.AmbientLight(0xffffff, 0.7));
const refLight = new THREE.DirectionalLight(0xffffff, 0.8);
refLight.position.set(3, 5, 4);
refScene.add(refLight);

const refControls = new THREE.OrbitControls(refCamera, refRenderer.domElement);
refControls.enableDamping = true;

let currentRefMesh = null;

function loadReferenceModel(keyword) {
  if (currentRefMesh) refScene.remove(currentRefMesh);

  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4 });

  if (keyword.includes("활") || keyword.includes("장군") || keyword.includes("전사")) {
    // 활 쏘는 장군 형태 모형 가상 생성
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.4, 0.7), mat);
    body.position.y = 0.1;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.45, 32, 32), mat);
    head.position.y = 1.0;
    const bowArm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 1.3, 16), mat);
    bowArm.position.set(-0.7, 0.2, 0.2);
    bowArm.rotation.z = 0.5;

    group.add(body, head, bowArm);
  } else {
    // 기본 인체
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.6, 32, 32), mat);
    head.position.y = 0.8;
    const chest = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.2, 0.7), mat);
    chest.position.y = -0.2;
    group.add(head, chest);
  }

  currentRefMesh = group;
  refScene.add(currentRefMesh);
}

// --- 3. 작업 공간 뷰어 (오른쪽) ---
const workScene = new THREE.Scene();
workScene.background = new THREE.Color(0x09090b);

const workCamera = new THREE.PerspectiveCamera(50, workContainer.clientWidth / workContainer.clientHeight, 0.1, 1000);
workCamera.position.set(0, 1.5, 4);

const workRenderer = new THREE.WebGLRenderer({ antialias: true });
workRenderer.setSize(workContainer.clientWidth, workContainer.clientHeight);
workRenderer.setPixelRatio(window.devicePixelRatio);
workContainer.appendChild(workRenderer.domElement);

workScene.add(new THREE.AmbientLight(0xffffff, 0.6));
const workLight = new THREE.DirectionalLight(0x60a5fa, 0.9);
workLight.position.set(2, 4, 3);
workScene.add(workLight);

const workControls = new THREE.OrbitControls(workCamera, workRenderer.domElement);
workControls.enableDamping = true;

let workGeo = new THREE.SphereGeometry(0.9, 32, 32);
let workMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.3 });
let workMesh = new THREE.Mesh(workGeo, workMat);
workScene.add(workMesh);

// --- 4. 펜 필압 및 변형 로직 ---
const raycaster = new THREE.Raycaster();
const mouseVec = new THREE.Vector2();
let isPenDown = false;

function updatePointerPos(e) {
  const rect = workContainer.getBoundingClientRect();
  mouseVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouseVec.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
}

const domElem = workRenderer.domElement;

domElem.addEventListener('pointerdown', (e) => {
  if (activeMode !== 'deform') return;
  isPenDown = true;
  updatePointerPos(e);
  const pressure = e.pressure !== undefined && e.pressure > 0 ? e.pressure : 0.5;
  updatePressureUI(pressure);
  deformMesh(pressure);
});

domElem.addEventListener('pointermove', (e) => {
  if (e.pointerType === 'pen' || e.buttons === 1) {
    const pressure = e.pressure !== undefined ? e.pressure : 0.5;
    updatePressureUI(pressure);
  }
  if (!isPenDown || activeMode !== 'deform') return;
  updatePointerPos(e);
  const pressure = e.pressure !== undefined && e.pressure > 0 ? e.pressure : 0.5;
  deformMesh(pressure);
});

window.addEventListener('pointerup', () => {
  isPenDown = false;
  updatePressureUI(0);
});

function deformMesh(pressure) {
  raycaster.setFromCamera(mouseVec, workCamera);
  const intersects = raycaster.intersectObject(workMesh);

  if (intersects.length > 0) {
    const hitPoint = intersects[0].point;
    const positionAttr = workGeo.attributes.position;
    const radius = 0.35 + pressure * 0.3;
    const pushStrength = 0.025 * (pressure + 0.3);

    for (let i = 0; i < positionAttr.count; i++) {
      const vx = positionAttr.getX(i);
      const vy = positionAttr.getY(i);
      const vz = positionAttr.getZ(i);

      const vWorld = new THREE.Vector3(vx, vy, vz).applyMatrix4(workMesh.matrixWorld);
      const dist = vWorld.distanceTo(hitPoint);

      if (dist < radius) {
        const factor = (1 - dist / radius) * pushStrength;
        const dir = vWorld.clone().sub(hitPoint).negate().normalize();
        positionAttr.setXYZ(i, vx + dir.x * factor, vy + dir.y * factor, vz + dir.z * factor);
      }
    }
    positionAttr.needsUpdate = true;
    workGeo.computeVertexNormals();
  }
}

function updatePressureUI(val) {
  document.getElementById('pressure-val').innerText = val.toFixed(2);
  document.getElementById('pressure-bar').style.width = `${val * 100}%`;
}

// --- 5. 검색 및 튜토리얼 시스템 연동 ---
function applySearchKeyword(keyword) {
  let matchedKey = "기본";
  for (let key in modelDatabase) {
    if (keyword.includes(key) || key.includes(keyword)) {
      matchedKey = key;
      break;
    }
  }

  currentSearchKey = matchedKey;
  currentStep = 0;

  loadReferenceModel(currentSearchKey);
  updateStepUI();

  document.getElementById('ref-title').innerText = `🎯 목표 모델: ${modelDatabase[currentSearchKey].name}`;
}

function updateStepUI() {
  const steps = modelDatabase[currentSearchKey].steps;
  const data = steps[currentStep];

  workMat.color.setHex(data.color);

  document.getElementById('step-title').innerText = data.title;
  document.getElementById('step-desc').innerHTML = data.desc;
  document.getElementById('step-indicator').innerText = `${currentStep + 1} / ${steps.length} 단계`;

  document.getElementById('prev-btn').disabled = (currentStep === 0);
  document.getElementById('next-btn').disabled = (currentStep === steps.length - 1);
}

// 이벤트 리스너 연결
document.getElementById('search-btn').addEventListener('click', () => {
  const val = document.getElementById('search-input').value.trim();
  if (val) applySearchKeyword(val);
});

document.getElementById('search-input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const val = document.getElementById('search-input').value.trim();
    if (val) applySearchKeyword(val);
  }
});

const modeDeformBtn = document.getElementById('mode-deform');
const modeRotateBtn = document.getElementById('mode-rotate');

modeDeformBtn.addEventListener('click', () => {
  activeMode = 'deform';
  workControls.enabled = false;
  modeDeformBtn.classList.add('active');
  modeRotateBtn.classList.remove('active');
});

modeRotateBtn.addEventListener('click', () => {
  activeMode = 'rotate';
  workControls.enabled = true;
  modeRotateBtn.classList.add('active');
  modeDeformBtn.classList.remove('active');
});

document.getElementById('reset-btn').addEventListener('click', () => {
  workScene.remove(workMesh);
  workGeo = new THREE.SphereGeometry(0.9, 32, 32);
  workMesh = new THREE.Mesh(workGeo, workMat);
  workScene.add(workMesh);
});

document.getElementById('next-btn').addEventListener('click', () => {
  const steps = modelDatabase[currentSearchKey].steps;
  if (currentStep < steps.length - 1) {
    currentStep++;
    updateStepUI();
  }
});

document.getElementById('prev-btn').addEventListener('click', () => {
  if (currentStep > 0) {
    currentStep--;
    updateStepUI();
  }
});

// 초기 실행
workControls.enabled = false;
applySearchKeyword("활 쏘는 장군");

// --- 6. 애니메이션 루프 ---
function animate() {
  requestAnimationFrame(animate);
  if (currentRefMesh) currentRefMesh.rotation.y += 0.003;
  refControls.update();
  workControls.update();
  refRenderer.render(refScene, refCamera);
  workRenderer.render(workScene, workCamera);
}
animate();

window.addEventListener('resize', () => {
  const refW = refContainer.clientWidth;
  const refH = refContainer.clientHeight;
  refCamera.aspect = refW / refH;
  refCamera.updateProjectionMatrix();
  refRenderer.setSize(refW, refH);

  const workW = workContainer.clientWidth;
  const workH = workContainer.clientHeight;
  workCamera.aspect = workW / workH;
  workCamera.updateProjectionMatrix();
  workRenderer.setSize(workW, workH);
});
