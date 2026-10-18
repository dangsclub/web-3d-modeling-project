// --- 1. 모의 이미지 데이터베이스 (검색어별 팝업 목록) ---
const mockImageDatabase = {
  "활 쏘는 장군": [
    { name: "궁수 전사 포즈 1", url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=400&auto=format&fit=crop&q=80" },
    { name: "활 시위 당기는 실루엣", url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&auto=format&fit=crop&q=80" },
    { name: "중세 장군 캐릭터", url: "https://images.unsplash.com/photo-1563089145-599997674d42?w=400&auto=format&fit=crop&q=80" }
  ],
  "전사": [
    { name: "갑옷 입은 전사", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80" },
    { name: "검투사 스타일", url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&auto=format&fit=crop&q=80" }
  ],
  "로봇": [
    { name: "메카닉 안드로이드", url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&auto=format&fit=crop&q=80" },
    { name: "사이버네틱 3D", url: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=400&auto=format&fit=crop&q=80" }
  ]
};

// 검색어별 상세 튜토리얼 스텝 데이터 (최종 완성까지 쭉 나열)
const tutorialStepsData = {
  "활 쏘는 장군": [
    { title: "Step 1. 상체 기본 볼륨 잡기", desc: "중앙에 펜을 대고 필압 0.4로 밀어내어 기본 기둥을 만드세요.", color: 0x3b82f6 },
    { title: "Step 2. 어깨 및 팔 확장", desc: "좌우 측면에 필압 0.6을 주어 팔 뻗는 기초 실루엣을 확장하세요.", color: 0xec4899 },
    { title: "Step 3. 활 시위 방향 각도 조절", desc: "왼쪽 부위에 필압 0.8을 주어 활을 쥔 손목 각도를 정확히 빼냅니다.", color: 0xf59e0b },
    { title: "Step 4. 표면 스무딩 및 디테일 완성", desc: "전체적으로 필압 0.2로 부드럽게 쓸어내려 최종 장군 모델을 완성합니다.", color: 0x10b981 }
  ],
  "기본": [
    { title: "Step 1. 기본 구형 윤곽 잡기", desc: "상단 구에 펜을 대고 필압 0.3으로 밀어 두개골을 만드세요.", color: 0x3b82f6 },
    { title: "Step 2. 목과 턱선 다듬기", desc: "하단에 필압 0.5를 주어 턱 라인을 세밀하게 깎아냅니다.", color: 0x10b981 }
  ]
};

let currentKey = "활 쏘는 장군";
let currentStepIdx = 0;
let activeMode = 'deform';

// --- 2. 3D 작업 캔버스 세팅 ---
const workContainer = document.getElementById('work-canvas-container');
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

// --- 3. 팝업창 및 이미지 검색 제어 ---
const modal = document.getElementById('image-modal');
const popupBtn = document.getElementById('search-popup-btn');
const closeBtn = document.getElementById('modal-close-btn');
const imageGrid = document.getElementById('image-grid');

popupBtn.addEventListener('click', () => {
  const keyword = document.getElementById('search-input').value.trim();
  openImageModal(keyword);
});

closeBtn.addEventListener('click', () => {
  modal.style.display = 'none';
});

function openImageModal(keyword) {
  imageGrid.innerHTML = '';
  let list = mockImageDatabase[keyword] || mockImageDatabase["활 쏘는 장군"];

  list.forEach(item => {
    const card = document.createElement('div');
    card.className = 'image-card';
    card.innerHTML = `<img src="${item.url}" alt="${item.name}"><span>${item.name}</span>`;
    card.addEventListener('click', () => {
      selectReferenceImage(item.url, keyword);
      modal.style.display = 'none';
    });
    imageGrid.appendChild(card);
  });

  modal.style.display = 'flex';
}

function selectReferenceImage(url, keyword) {
  const imgElem = document.getElementById('selected-ref-img');
  const canvasElem = document.getElementById('ref-canvas-container');
  
  imgElem.src = url;
  imgElem.style.display = 'block';
  canvasElem.style.display = 'none';

  currentKey = tutorialStepsData[keyword] ? keyword : "활 쏘는 장군";
  currentStepIdx = 0;
  updateTutorialUI();
}

// --- 4. 튜토리얼 스텝 및 전체 리스트 렌더링 ---
function updateTutorialUI() {
  const steps = tutorialStepsData[currentKey] || tutorialStepsData["활 쏘는 장군"];
  const stepData = steps[currentStepIdx];

  workMat.color.setHex(stepData.color);

  document.getElementById('step-title').innerText = stepData.title;
  document.getElementById('step-desc').innerHTML = `<strong>[정밀 가이드]</strong> ${stepData.desc}`;
  document.getElementById('step-indicator').innerText = `${currentStepIdx + 1} / ${steps.length} 단계`;

  document.getElementById('prev-btn').disabled = (currentStepIdx === 0);
  document.getElementById('next-btn').disabled = (currentStepIdx === steps.length - 1);

  renderStepList(steps);
}

function renderStepList(steps) {
  const container = document.getElementById('step-list-items');
  container.innerHTML = '';
  steps.forEach((st, idx) => {
    const pill = document.createElement('div');
    pill.className = `step-pill ${idx === currentStepIdx ? 'active' : ''}`;
    pill.innerText = `Step ${idx + 1}`;
    pill.addEventListener('click', () => {
      currentStepIdx = idx;
      updateTutorialUI();
    });
    container.appendChild(pill);
  });
}

// --- 5. 펜 필압 및 스컬프팅 변형 로직 ---
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

// 버튼 이벤트
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
  const steps = tutorialStepsData[currentKey] || tutorialStepsData["활 쏘는 장군"];
  if (currentStepIdx < steps.length - 1) {
    currentStepIdx++;
    updateTutorialUI();
  }
});

document.getElementById('prev-btn').addEventListener('click', () => {
  if (currentStepIdx > 0) {
    currentStepIdx--;
    updateTutorialUI();
  }
});

// 초기 실행 (첫 번째 이미지 기본 선택)
workControls.enabled = false;
selectReferenceImage(mockImageDatabase["활 쏘는 장군"][0].url, "활 쏘는 장군");

// --- 6. 애니메이션 루프 ---
function animate() {
  requestAnimationFrame(animate);
  workControls.update();
  workRenderer.render(workScene, workCamera);
}
animate();

window.addEventListener('resize', () => {
  const workW = workContainer.clientWidth;
  const workH = workContainer.clientHeight;
  workCamera.aspect = workW / workH;
  workCamera.updateProjectionMatrix();
  workRenderer.setSize(workW, workH);
});
