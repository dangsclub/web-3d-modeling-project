// --- 1. 변수 및 튜토리얼 데이터 준비 ---
const refContainer = document.getElementById('ref-canvas-container');
const workContainer = document.getElementById('work-canvas-container');

// 튜토리얼 단계 데이터 (왼쪽: 목표 모델 / 오른쪽: 기본 가이드)
const tutorialSteps = [
  {
    title: "📌 Step 1. 인체 머리/얼굴 기본형 잡기",
    desc: "왼쪽 목표 모델(두상)을 360도로 돌려보세요. 오른쪽 작업 공간의 구(Sphere) 형태를 와콤 펜으로 눌러 당기면서 기초 얼굴 윤곽을 잡아봅니다.",
    refType: 'head',
    workColor: 0x3b82f6
  },
  {
    title: "📌 Step 2. 몸통(체스트) 블록킹 다듬기",
    desc: "목표 모델이 상반신 형태로 발전합니다. 와콤 펜의 필압을 조절하며 턱 아래 목과 가슴 라인의 굴곡을 다듬어 보세요.",
    refType: 'torso',
    workColor: 0xec4899
  },
  {
    title: "📌 Step 3. 세부 굴곡 스컬프팅 및 관찰",
    desc: "완성된 인체 모델의 각 부위 비율을 관찰하며 와콤 펜으로 디테일한 표현을 다듬어 나가는 최종 단계입니다.",
    refType: 'full',
    workColor: 0x10b981
  }
];

let currentStep = 0;
let activeMode = 'deform'; // 'deform' 또는 'rotate'

// --- 2. 왼쪽 레퍼런스 씬 (목표 3D 모델) 설정 ---
const refScene = new THREE.Scene();
refScene.background = new THREE.Color(0x09090b);

const refCamera = new THREE.PerspectiveCamera(50, refContainer.clientWidth / refContainer.clientHeight, 0.1, 1000);
refCamera.position.set(0, 1.5, 4);

const refRenderer = new THREE.WebGLRenderer({ antialias: true });
refRenderer.setSize(refContainer.clientWidth, refContainer.clientHeight);
refRenderer.setPixelRatio(window.devicePixelRatio);
refContainer.appendChild(refRenderer.domElement);

// 왼쪽 조명
refScene.add(new THREE.AmbientLight(0xffffff, 0.7));
const refLight = new THREE.DirectionalLight(0xffffff, 0.8);
refLight.position.set(3, 5, 4);
refScene.add(refLight);

const refControls = new THREE.OrbitControls(refCamera, refRenderer.domElement);
refControls.enableDamping = true;

let currentRefMesh = null;

// 목표 모델 생성 함수 (인체 파츠 가상 생성)
function createReferenceModel(type) {
  if (currentRefMesh) refScene.remove(currentRefMesh);

  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4, metalness: 0.1 });

  if (type === 'head') {
    // 머리
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.8, 32, 32), mat);
    head.scale.set(0.85, 1.1, 0.9);
    group.add(head);
  } else if (type === 'torso') {
    // 머리 + 목 + 몸통
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.7, 32, 32), mat);
    head.position.y = 0.9;
    head.scale.set(0.85, 1.1, 0.9);

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 0.5, 16), mat);
    neck.position.y = 0.3;

    const chest = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.0, 0.7), mat);
    chest.position.y = -0.4;

    group.add(head, neck, chest);
  } else {
    // 풀 모델
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.65, 32, 32), mat);
    head.position.y = 1.2;
    head.scale.set(0.85, 1.1, 0.9);

    const chest = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.2, 0.6), mat);
    chest.position.y = 0.2;

    const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.15, 1.2, 16), mat);
    armL.position.set(-0.8, 0.1, 0);
    armL.rotation.z = 0.2;

    const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.15, 1.2, 16), mat);
    armR.position.set(0.8, 0.1, 0);
    armR.rotation.z = -0.2;

    group.add(head, chest, armL, armR);
  }

  currentRefMesh = group;
  refScene.add(currentRefMesh);
}

// --- 3. 오른쪽 작업 씬 (와콤 펜 실습 공간) 설정 ---
const workScene = new THREE.Scene();
workScene.background = new THREE.Color(0x09090b);

const workCamera = new THREE.PerspectiveCamera(50, workContainer.clientWidth / workContainer.clientHeight, 0.1, 1000);
workCamera.position.set(0, 1.5, 4);

const workRenderer = new THREE.WebGLRenderer({ antialias: true });
workRenderer.setSize(workContainer.clientWidth, workContainer.clientHeight);
workRenderer.setPixelRatio(window.devicePixelRatio);
workContainer.appendChild(workRenderer.domElement);

// 오른쪽 조명
workScene.add(new THREE.AmbientLight(0xffffff, 0.6));
const workLight = new THREE.DirectionalLight(0x60a5fa, 0.9);
workLight.position.set(2, 4, 3);
workScene.add(workLight);

const workControls = new THREE.OrbitControls(workCamera, workRenderer.domElement);
workControls.enableDamping = true;

// 작업용 스컬프팅 Mesh (변형 가능한 Vertex 정점 포함)
let workGeo = new THREE.SphereGeometry(0.9, 32, 32);
let workMat = new THREE.MeshStandardMaterial({
  color: 0x3b82f6,
  roughness: 0.3,
  wireframe: false
});
let workMesh = new THREE.Mesh(workGeo, workMat);
workScene.add(workMesh);

// --- 4. 와콤 펜 연동 및 변형(Deform) 인터랙션 로직 ---
const raycaster = new THREE.Raycaster();
const mouseVec = new THREE.Vector2();
let isPenDown = false;

function updatePointerPos(e) {
  const rect = workContainer.getBoundingClientRect();
  mouseVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouseVec.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
}

// 와콤 펜 이벤트 등록 (PointerEvent API)
const domElem = workRenderer.domElement;

domElem.addEventListener('pointerdown', (e) => {
  if (activeMode !== 'deform') return;
  isPenDown = true;
  updatePointerPos(e);

  // 필압 감지 (와콤 펜 지원)
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

// 펜 클릭/드래그 위치의 3D 정점(Vertex) 당기기 (스컬프팅 효과)
function deformMesh(pressure) {
  raycaster.setFromCamera(mouseVec, workCamera);
  const intersects = raycaster.intersectObject(workMesh);

  if (intersects.length > 0) {
    const hitPoint = intersects[0].point;
    const positionAttr = workGeo.attributes.position;
    const radius = 0.4 + pressure * 0.3; // 필압에 따른 영향 범위
    const pushStrength = 0.03 * (pressure + 0.2); // 필압에 따른 변형 강도

    for (let i = 0; i < positionAttr.count; i++) {
      const vx = positionAttr.getX(i);
      const vy = positionAttr.getY(i);
      const vz = positionAttr.getZ(i);

      const vWorld = new THREE.Vector3(vx, vy, vz).applyMatrix4(workMesh.matrixWorld);
      const dist = vWorld.distanceTo(hitPoint);

      if (dist < radius) {
        // 히트 지점 방향으로 정점 이동
        const factor = (1 - dist / radius) * pushStrength;
        const dir = vWorld.clone().sub(hitPoint).negate().normalize();

        positionAttr.setXYZ(
          i,
          vx + dir.x * factor,
          vy + dir.y * factor,
          vz + dir.z * factor
        );
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

// --- 5. UI 버튼 조작 및 Step 변경 ---
function updateStepUI(stepIdx) {
  const data = tutorialSteps[stepIdx];
  createReferenceModel(data.refType);
  workMat.color.setHex(data.workColor);

  document.getElementById('step-title').innerText = data.title;
  document.getElementById('step-desc').innerText = data.desc;
  document.getElementById('step-indicator').innerText = `${stepIdx + 1} / ${tutorialSteps.length} 단계`;

  document.getElementById('prev-btn').disabled = (stepIdx === 0);
  document.getElementById('next-btn').disabled = (stepIdx === tutorialSteps.length - 1);
}

// 툴바 버튼 이벤트
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
  if (currentStep < tutorialSteps.length - 1) {
    currentStep++;
    updateStepUI(currentStep);
  }
});

document.getElementById('prev-btn').addEventListener('click', () => {
  if (currentStep > 0) {
    currentStep--;
    updateStepUI(currentStep);
  }
});

// 초기화 실행
workControls.enabled = false; // 기본 변형 모드로 시작
updateStepUI(currentStep);

// --- 6. 애니메이션 루프 및 반응형 ---
function animate() {
  requestAnimationFrame(animate);

  if (currentRefMesh) {
    currentRefMesh.rotation.y += 0.003; // 목표 모델 천천히 자동 회전
  }

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
