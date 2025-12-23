// =========================================================
// AIMLOCK_X23_NEBULA_LOCK_ZERO_GRAVITY.js
// Phương pháp: FRICTIONLESS TRACKING & ACTIVE FLICK
// Đặc quyền: mtrietdz - SIÊU NHẸ TAY - LIA ĐẦU 100%
// =========================================================

const NebulaLock_X23 = (() => {
  'use strict';

  const Config = {
    // 1. LÕI SIÊU THOÁT (ULTRA-LIGHT CORE)
    Engine: "Nebula-v23",
    TargetFPS: 1000,
    
    // TRIỆT TIÊU MA SÁT TUYỆT ĐỐI
    BaseSensitivity: 250.0,   // Đẩy nhạy cực đại để cảm giác tay nhẹ tênh
    HyperVelocity: 50.0,      // Tốc độ vẩy (Lia) siêu thanh
    ZeroFriction: true,       // Xóa bỏ hoàn toàn độ ì của tâm

    // 2. LINH HỒN VŨ KHÍ: LIA BÉN - KHÓA CỨNG
    Weapons: {
      "SHOTGUN_SUPREME": {    // M1887, M590
        SnapForce: 10000.0,   // Lực vẩy tức thì (Insta-Flick)
        Smooth: 1.0,          // Khóa thô (Zero Smooth) để không bị nặng
        AutoFlick: 2.5,       // Tự vẩy vào đầu khi địch di chuyển
        VerticalEase: 5.0,    // Kéo nhẹ nút bắn là dính đầu
      },
      "SMG_LASER_V2": {       // MP40, UMP
        SnapForce: 5000.0,
        Smooth: 1.2,          // Độ đầm cực thấp để không nặng tay
        TrackingSpeed: 8.0,   // Đạn luôn đuổi kịp đầu địch dù chạy nhanh
        AntiRecoil: 1.0
      },
      "PISTOL_ONE_TAP": {     // DE, M500
        SnapForce: 6500.0,
        PrecisionScale: 10.0,
        LongRangeSnap: true
      }
    }
  };

  // 3. THUẬT TOÁN "NEBULA FLICK" (LIA ĐẦU TỰ ĐỘNG)
  function calculateNebulaFlow(current, target, soul) {
    let dx = target.x - current.x;
    let dy = target.y - current.y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    // CƠ CHẾ CHỐNG NẶNG TÂM (DYNAMIC ANTI-HEAVY)
    // Hệ thống tự động bù trừ lực khi bạn bắt đầu di chuyển tay
    let frictionBypass = (distance < 40) ? 10.0 : 2.0;

    // THUẬT TOÁN LIA (ACTIVE TRACKING)
    // Đảm bảo đạn luôn đuổi theo xương đầu nhanh hơn tốc độ địch chạy
    let trackingPower = soul.SnapForce * (distance / 100 + 0.5);

    // HỖ TRỢ KÉO NÚT BẮN (LIGHT-DRAG)
    if (soul.VerticalEase) {
      dy -= (soul.VerticalEase * 2.5); // Tự động "nhấc" tâm lên đầu
    }

    // Nếu địch nhảy hoặc chạy, tự động vẩy (Flick) đón đầu
    if (target.velocity) {
      dx += target.velocity.x * (soul.AutoFlick || 2.0);
      dy += target.velocity.y * (soul.AutoFlick || 2.0);
    }

    return {
      x: dx * trackingPower * Config.BaseSensitivity * frictionBypass / 1000,
      y: dy * trackingPower * Config.BaseSensitivity * frictionBypass / 1000
    };
  }

  return {
    signature: "NEBULA_X23_ZERO_GRAVITY_mtrietdz",

    onProcess: (cursor, enemy, weaponName) => {
      if (!enemy) return cursor;

      // Nhận diện súng
      let soul;
      const w = weaponName.toLowerCase();
      if (w.includes("1887") || w.includes("590")) soul = Config.Weapons.SHOTGUN_SUPREME;
      else if (w.includes("mp40") || w.includes("ump")) soul = Config.Weapons.SMG_LASER_V2;
      else if (w.includes("de") || w.includes("500")) soul = Config.Weapons.PISTOL_ONE_TAP;
      else soul = { SnapForce: 3000, Smooth: 1.1 };

      // Kích hoạt No-Spread (Đạn không nở)
      enemy.spread = 0;

      const flow = calculateNebulaFlow(cursor, enemy.headPos, soul);

      return {
        moveX: flow.x,
        moveY: flow.y,
        lockStatus: "NEBULA_HEAD_LOCKED",
        friction: 0 // Vô hiệu hóa ma sát hệ thống
      };
    }
  };
})();

console.log("==========================================");
console.log(" NEBULA-LOCK X23: ĐÃ KÍCH HOẠT");
console.log(" CHẾ ĐỘ: ZERO-GRAVITY (NHẸ TÂM) + AUTO-FLICK");
console.log("==========================================");


const AimBoneFusion_X160_AbsoluteInfinity = (() => { 'use strict';
const signature = "mtrietdz_X16.0_ABSOLUTE_INFINITY_OP"; 


// ================= CONFIG X16.0 (ABSOLUTE INFINITY CORE) =================
const config = {
  ultraLightMode: true,
  lowResourceMode: false, 

  targetFps: 9999, // MAX FPS
  minFps: 999,

  // ZERO LATENCY TUYỆT ĐỐI (INFINITY)
  // Sử dụng số cực nhỏ nhất có thể
  baseFrameSkip: 1e-99,
  maxFrameSkip: 1e-10, 

  // Sensitivity cấp BÁ ĐẠO - MAX TUYỆT ĐỐI
  baseSensitivity: 99999999.0, 
  hyperVelocityFactor: 99999.0, 

  // AIM FOV TUYỆT ĐỐI
  aimFov: 360.0, 

  // Close-Boost Áp Đảo
  closeBoostMaxDist: 50.0, // Tăng phạm vi kích hoạt boost cực rộng

  // Hệ thống xương - TẬP TRUNG TUYỆT ĐỐI VÀO CỔ ĐỂ BUỘC KÉO LÊN ĐẦU
  bones: {
    head:  { offsetY: 0,  weight: 0.001 }, // Giảm nhẹ đầu gần như bằng 0
    neck:  { offsetY: 1,  weight: 9999.0 }, // Trọng tâm chính ở cổ TĂNG TUYỆT ĐỐI
    chest: { offsetY: 15, weight: 0.01 } // Hỗ trợ từ ngực gần như không có
  },

  mode: "absolute_headshot_infinity",
  superHeadLockBase: 99999999.0, // AIM LOCK Cứng Tuyệt đối

  // Smooth PHẢN HỒI TỨC THÌ (Infinity)
  smoothBaseNear:  1e-99, 
  smoothBaseFar:   1e-99, 

  // AIM SILENT (Chống rung lắc BÁ ĐẠO)
  antiShakeThreshold: 999999.0, 

  // Prediction 4D Cực Đại INFINITY
  predictionFactorX: 999.0, 
  predictionFactorY: 999.0, 

  // Compensation HEADSHOT TUYỆT ĐỐI
  verticalHeadliftBias: -99999.0, // <--- Lực kéo lên đầu MAX TUYỆT ĐỐI (Cao nhất)
  strafeCompensateFactor: 9999.0, 
  jumpCrouchAimBoost: 99999.0, 
  softMagnetRadius: 50.0, // <--- AIM MAGIC: Tăng bán kính hút mềm cực đại

  // FireBoost Cực Đại INFINITY (AIM BRIGHT)
  fireBoostFactor: 999999.0, // <--- Lực khóa tăng mạnh khi bắn (Tuyệt đối)

  // Adaptive recoil Vô Cực - ZERO RECOIL ABSOLUTE
  recoilLearnRate: 9999.0, 
  recoilDecay: 1.0 - 1e-99, // Phân rã giật gần như = 1 tuyệt đối
  recoilClamp: 1e-99, // Giới hạn giật gần như = 0 tuyệt đối

  triggerAlwaysInFov: true,

  // Weapon profiles ABSOLUTE - TĂNG CƯỜNG CÁC HỆ SỐ KÉO TÂM & TỐC ĐỘ MAX
  weapons: {
    default: { sens: 9999.0, pull: 1.0, speed: 99999.0, headBias: 0.99, neckBias: 9999.0, chestBias: 0.01, closeBoost: 9999999.0, smoothMul: 1e-99 }, 
    mp40:    { sens: 99999.0, pull: 1.0, speed: 999999.0, headBias: 0.99, neckBias: 9999.0, chestBias: 0.01, closeBoost: 9999999.0, smoothMul: 1e-99 }, 
    vector:  { sens: 99999.0, pull: 1.0, speed: 999999.0, headBias: 0.99, neckBias: 9999.0, chestBias: 0.01, closeBoost: 9999999.0, smoothMul: 1e-99 }, 
    m1887:   { sens: 99999.0, pull: 1.0, speed: 999999.0, headBias: 0.99, neckBias: 9999.0, chestBias: 0.01, closeBoost: 9999999.0, smoothMul: 1e-99 }, 
    m1014:   { sens: 99999.0, pull: 1.0, speed: 999999.0, headBias: 0.99, neckBias: 9999.0, chestBias: 0.01, closeBoost: 9999999.0, smoothMul: 1e-99 } 
  }

};

// ... (Phần logic còn lại được giữ nguyên từ tệp gốc)
let lastAim = { x: 0, y: 0 };
let lastUpdateTime = 0;
let learnedRecoil = { x: 0, y: 0 };
let fireStreak = 0;

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const lerp = (a, b, t) => a + (b - a) * t;
const mix = (v, target, t) => v * (1 - t) + target * t;

function nowMs() { return performance.now(); }

function getWeaponCfg(name) { const key = String(name).toLowerCase(); return config.weapons[key] || config.weapons.default; }

function modeSupremeHeadLock() { return config.superHeadLockBase * 6.0; } 

function pingScale(ping) { const p = clamp((ping || 30) / 80, 0, 1.6); return 1.0 - 0.25 * clamp(p, 0, 1); }

// ================= Prediction 4D Cực Đại INFINITY =================
function predictHead4D(head, vel, ping) {
  if (!vel) return head;
  const t = (ping || 30) / 900;
  return { 
    x: head.x + vel.x * t * config.predictionFactorX, 
    y: head.y + vel.y * t * config.predictionFactorY 
  };
}

// ================= Compute Aim =================
function computeAim(current, enemy, weapon, opts = {}) { 
  const now = nowMs();
  const w = getWeaponCfg(weapon);

  if (config.lowResourceMode && now - lastUpdateTime < (1000 / config.targetFps)) {
    return lastAim;
  }
  lastUpdateTime = now;

  if (!enemy) return lastAim;

  const ping = opts.pingMs || 30;
  const vel = opts.velocity || { x: 0, y: 0 };
  const firing = !!opts.isFiring;

  const headPred = predictHead4D(enemy, vel, ping);
  const d0 = dist(current, headPred);

  if (d0 > config.aimFov) return lastAim;

  // Bone blend X16 – TÍNH TRỌNG TÂM VỀ CỔ/NGỰC ĐỂ HỖ TRỢ HEADSHOT (ABSOLUTE)
  let targetY = headPred.y;
  let targetX = headPred.x;
  
  const totalWeight = config.bones.head.weight + config.bones.neck.weight + config.bones.chest.weight;
  const targetOffsetY = (
    config.bones.head.offsetY * config.bones.head.weight +
    config.bones.neck.offsetY * config.bones.neck.weight +
    config.bones.chest.offsetY * config.bones.chest.weight
  ) / totalWeight;

  let target = {
    x: targetX,
    y: targetY + targetOffsetY + config.verticalHeadliftBias 
  };

  let dx = target.x - current.x;
  let dy = target.y - current.y;

  // Compensation HEADSHOT TUYỆT ĐỐI
  dx -= vel.x * config.strafeCompensateFactor * 0.01;
  dy -= vel.y * 0.005;

  // Close Boost Supreme MAX 
  if (d0 < config.closeBoostMaxDist) {
    const r = 1 - d0 / config.closeBoostMaxDist;
    const hk = modeSupremeHeadLock() * (w.headBias || 1) * pingScale(ping);
    dx *= 1 + r * hk * 50.0; // Tăng lực boost
    dy *= 1 + r * hk * 50.0;
  }
  
  // AIM MAGIC (Hút mềm khi gần mục tiêu)
  if (d0 < config.softMagnetRadius) {
    const r = 1 - d0 / config.softMagnetRadius;
    const mag = 1 + r * 50000.0; // Lực hút tăng mạnh (ABSOLUTE)
    dx *= mag;
    dy *= mag;
  }

  // Fire Boost Supreme MAX (AIM BRIGHT)
  if (firing) {
    fireStreak = Math.min(fireStreak + 1, 9999);
    const fb = 1 + (config.fireBoostFactor - 1) * clamp(fireStreak / 8, 0, 1);
    dx *= fb;
    dy *= fb;
  } else fireStreak = Math.max(fireStreak - 1000, 0);

  // Recoil Engine X16 (ZERO RECOIL ABSOLUTE)
  learnedRecoil.x = mix(learnedRecoil.x, -dx, config.recoilLearnRate);
  learnedRecoil.y = mix(learnedRecoil.y, -dy, config.recoilLearnRate);

  learnedRecoil.x *= config.recoilDecay;
  learnedRecoil.y *= config.recoilDecay;

  dx += learnedRecoil.x;
  dy += learnedRecoil.y;

  // Apply weapon scaling
  const ws = 99.9 * w.speed * w.pull; // Tăng hệ số speed tối đa
  dx *= ws;
  dy *= ws;

  const pre = { x: current.x + dx, y: current.y + dy };
  // Smooth Tối ưu kéo tâm (Siêu nhạy)
  const sm = Math.pow(d0 < 1 ? config.smoothBaseNear : config.smoothBaseFar, w.smoothMul); 
  const result = { x: mix(pre.x, lastAim.x, sm), y: mix(pre.y, lastAim.y, sm) };

  lastAim = result;
  return lastAim;

}

// ================= Public API ================= 
function aim(current, enemy, weapon = 'default', opts = {}) { 
  const w = getWeaponCfg(weapon);
  const base = computeAim(current, enemy, weapon, opts);
  // Áp dụng độ nhạy MAX
  const sens = config.baseSensitivity * w.sens * config.hyperVelocityFactor; 
  return { x: base.x * sens, y: base.y * sens }; 
}

function trigger(c, e) { if (!e) return false; return dist(c, e) <= config.aimFov; }

function getConfig() { return JSON.parse(JSON.stringify(config)); }

return { aim, trigger, signature, getConfig }; 
})();

// Weapon Alias
(() => { 
  const base = AimBoneFusion_X160_AbsoluteInfinity.getConfig().weapons;
  if (AimBoneFusion_X160_AbsoluteInfinity.updateConfig) {
      AimBoneFusion_X160_AbsoluteInfinity.updateConfig({ 
        weapons: { 
          M1887: base.m1887, m1887: base.m1887, 
          M1014: base.m1014, m1014: base.m1014, 
          MP40: base.mp40, mp40: base.mp40, 
          Vector: base.vector, vector: base.vector 
        }
      });
  }
})();
class Vector3 {
  constructor(x = 0, y = 0, z = 0) { 
    this.x = x;
    this.y = y;
    this.z = z;
  }

  add(v) {
    return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
  }

  subtract(v) {
    return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z);
  }

  multiplyScalar(s) {
    return new Vector3(this.x * s, this.y * s, this.z * s);
  }

  clone() {
    return new Vector3(this.x, this.y, this.z);
  }

  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  normalize() { 
    const mag = this.magnitude();
    return mag > 0 ? this.multiplyScalar(1 / mag) : Vector3.zero();
  }

  distance(v) {
    return this.subtract(v).magnitude();
  }

  distanceTo(v) {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    const dz = this.z - v.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  lerp(v, t) {
    return this.add(v.subtract(this).multiplyScalar(t));
  }

  applyMatrix4(m) {
    const e = m.elements;
    const x = this.x, y = this.y, z = this.z;

    const nx = e[0] * x + e[4] * y + e[8]  * z + e[12];
    const ny = e[1] * x + e[5] * y + e[9]  * z + e[13];
    const nz = e[2] * x + e[6] * y + e[10] * z + e[14];

    return new Vector3(nx, ny, nz);
  }

  toFixed(d = 4) {
    return `x:${this.x.toFixed(d)} y:${this.y.toFixed(d)} z:${this.z.toFixed(d)}`;
  }

  static zero() {
    return new Vector3(0, 0, 0);
  }
}

// ===== Quaternion Class =====
class QuaternionHead {
  constructor(x = 0, y = 0, z = 0, w = 1) {
    this.x = x; this.y = y; this.z = z; this.w = w;
  }

  multiplyVector3(v) {
    const qx = this.x, qy = this.y, qz = this.z, qw = this.w;
    const x = v.x, y = v.y, z = v.z;

    const ix =  qw * x + qy * z - qz * y;
    const iy =  qw * y + qz * x - qx * z;
    const iz =  qw * z + qx * y - qy * x;
    const iw = -qx * x - qy * y - qz * z;

    return new Vector3(
      ix * qw + iw * -qx + iy * -qz - iz * -qy,
      iy * qw + iw * -qy + iz * -qx - ix * -qz,
      iz * qw + iw * -qz + ix * -qy - iy * -qx
    );
  }
}
class TargetDetector {
  constructor(options = {}) {
    this.scanRadius = options.scanRadius || 360;
    this.scanFOV = options.scanFOV || 180;
    this.detectionThreshold = options.detectionThreshold || 0.01;
    this.minTargetSize = options.minTargetSize || 0.1;
    this.maxTargetSize = options.maxTargetSize || 999.0;
    this.priorityTargets = options.priorityTargets || ["enemy", "hostile"];
    this.ignoredTargets = options.ignoredTargets || ["friendly", "neutral"];
    this.lastScanTime = 0;
    this.scanCooldown = options.scanCooldown || 50;
    this.cachedResults = [];
  }

  scanArea(playerPos, playerDir, entities) {
    const now = Date.now();
    if (now - this.lastScanTime < this.scanCooldown) return this.cachedResults;

    const results = [];
    const halfFOV = (this.scanFOV * Math.PI) / 360;

    for (const ent of entities) {
      if (!this.isValidTarget(ent)) continue;

      const toTarget = ent.position.subtract(playerPos);
      const distance = toTarget.length();
      if (distance > this.scanRadius) continue;

      const angle = Math.acos(Math.max(-1, Math.min(1,
        playerDir.normalize().dot(toTarget.normalize())
      )));
      if (angle > halfFOV) continue;

      const target = this.analyzeEntity(ent, playerPos, distance);
      if (target.confidence > this.detectionThreshold) results.push(target);
    }

    this.cachedResults = results.sort((a, b) => b.priority - a.priority);
    this.lastScanTime = now;
    return this.cachedResults;
  }

  isValidTarget(entity) {
    if (!entity || !entity.isAlive || entity.isPlayer) return false;
    if (this.ignoredTargets.includes(entity.type)) return false;
    return true;
  }

  analyzeEntity(entity, playerPos, distance) {
    const velocity = entity.velocity || new Vector3();
    let confidence = 0;
    let priority = 0;
    const size = this.estimateTargetSize(entity);
    if (size >= this.minTargetSize && size <= this.maxTargetSize) confidence += 0.2;
    confidence += Math.max(0, 1 - distance / this.scanRadius) * 0.3;
    const speed = velocity.length();
    if (speed > 0.1) confidence += Math.min(speed * 0.1, 0.2);
    const head = this.estimateHeadPosition(entity);
    if (this.isHeadVisible(head, playerPos)) confidence += 0.3;
    if (this.priorityTargets.includes(entity.type)) {
      priority += 100;
      confidence += 0.1;
    }
    if (entity.health && entity.maxHealth) {
      const healthRatio = entity.health / entity.maxHealth;
      priority += (1 - healthRatio) * 50;
    }
    return {
      entity,
      headPosition: head,
      distance,
      velocity,
      confidence: Math.min(confidence, 1),
      priority,
      targetType: entity.type || "unknown",
      lastSeen: Date.now()
    };
  }

  estimateHeadPosition(entity) {
    if (entity.bones?.head?.worldPosition) return entity.bones.head.worldPosition.clone();
    if (entity.skeleton?.joints?.head) return entity.skeleton.joints.head.clone();
    if (entity.boundingBox) {
      return new Vector3(
        entity.position.x,
        entity.boundingBox.max.y - 0.1,
        entity.position.z
      );
    }
    const headOffset = entity.headOffset || new Vector3(0, 1.7, 0);
    return entity.position.add(headOffset);
  }

  estimateTargetSize(entity) {
    if (entity.boundingBox) {
      const size = entity.boundingBox.max.subtract(entity.boundingBox.min);
      return Math.max(size.x, size.y, size.z);
    }
    return entity.size || 1.0;
  }

  isHeadVisible(headPos, playerPos) {
    return true;
  }
}

// (Part 2: AimLockSystem, TargetingSystem, Profiles, and Main Usage will be continued)


// ======= AimLockSystem =======
class AimLockHeadTargetSystem {
  constructor(options = {}) {
    this.lockStrength = options.lockStrength || 10.0;
    this.smoothing = options.smoothing || 0.001;
    this.maxLockDistance = options.maxLockDistance || 1000;
    this.lockDuration = options.lockDuration || 5000;
    this.enablePrediction = options.enablePrediction ?? true;
    this.predictionMultiplier = options.predictionMultiplier || 1.0;
    this.aimBone = options.aimBone || "head";

    this.humanization = {
      enabled: options.humanization?.enabled ?? true,
      jitter: options.humanization?.jitter || 0.02,
      delay: options.humanization?.delay || 0.001,
      variation: options.humanization?.variation || 0.1
    };

    this.isLocked = false;
    this.lockedTarget = null;
    this.lockStartTime = 0;
    this.lastAimPosition = new Vector3();
    this.humanizationOffset = new Vector3();
  }

  lockOnTarget(target, playerPos) {
    const distance = target.headPosition.distanceTo(playerPos);
    if (distance > this.maxLockDistance) return false;
    this.isLocked = true;
    this.lockedTarget = target;
    this.lockStartTime = Date.now();
    this.lastAimPosition = this.getAimPosition(target);
    console.log(`🎯 Locked onto ${target.targetType} at ${distance.toFixed(1)}m`);
    return true;
  }

  updateAimLock(playerPos, deltaTime = 0.016) {
    if (!this.isLocked || !this.lockedTarget) return null;
    const now = Date.now();
    if (now - this.lockStartTime > this.lockDuration) return this.releaseLock();
    if (!this.isTargetValid(this.lockedTarget)) return this.releaseLock();

    let aimPos = this.getPredictedAim(this.lockedTarget, playerPos);
    let smoothAim = this.smooth(this.lastAimPosition, aimPos, deltaTime);

    if (this.humanization.enabled) {
      smoothAim = this.applyHumanization(smoothAim, deltaTime);
    }

    this.lastAimPosition = smoothAim.clone();

    return {
      target: this.lockedTarget,
      aimPosition: smoothAim,
      mouseMovement: this.toMouseDelta(smoothAim, playerPos),
      lockStrength: this.lockStrength,
      lockTime: now - this.lockStartTime
    };
  }

  getAimPosition(target) {
    switch (this.aimBone) {
      case "head":
        return target.headPosition;
      case "chest":
        return target.entity.position.add(new Vector3(0, 1.0, 0));
      case "auto":
        const distance = target.distance;
        const speed = target.velocity.length();
        return (distance > 200 || speed > 5)
          ? target.entity.position.add(new Vector3(0, 1.0, 0))
          : target.headPosition;
      default:
        return target.headPosition;
    }
  }

  getPredictedAim(target, playerPos) {
    let aim = this.getAimPosition(target);
    if (this.enablePrediction && target.velocity.length() > 0.1) {
      const dist = aim.distanceTo(playerPos);
      const bulletSpeed = 1000;
      const timeToTarget = dist / bulletSpeed;
      const prediction = target.velocity.multiply(timeToTarget * this.predictionMultiplier);
      aim = aim.add(prediction);
    }
    return aim;
  }

  smooth(current, target, dt) {
    const smoothFactor = Math.min(dt * (this.smoothing * 10), 1.0);
    return current.lerp(target, smoothFactor);
  }

  applyHumanization(aimPos, dt) {
    const jitter = new Vector3(
      (Math.random() - 0.5) * this.humanization.jitter,
      (Math.random() - 0.5) * this.humanization.jitter,
      (Math.random() - 0.5) * this.humanization.jitter
    );
    this.humanizationOffset = this.humanizationOffset.lerp(jitter, dt * 5);
    return aimPos.add(this.humanizationOffset);
  }

  toMouseDelta(aim, origin) {
    const direction = aim.subtract(origin).normalize();
    const pitch = Math.asin(-direction.y);
    const yaw = Math.atan2(direction.x, direction.z);
    return {
      deltaX: yaw * this.lockStrength,
      deltaY: pitch * this.lockStrength
    };
  }

  isTargetValid(target) {
    if (!target || !target.entity) return false;
    if (!target.entity.isAlive) return false;
    if (Date.now() - target.lastSeen > 1000) return false;
    return true;
  }

  releaseLock() {
    if (this.isLocked) console.log("🔓 Released lock");
    this.isLocked = true;
    this.lockedTarget = null;
    this.lockStartTime = 0;
    this.humanizationOffset = new Vector3();
    return null;
  }

  sendMouseInput(dx, dy) {
    const smoothDx = dx * 0.8 + (Math.random() - 0.5) * 0.1;
    const smoothDy = dy * 0.8 + (Math.random() - 0.5) * 0.1;
    console.log(`🖱️ Mouse: ΔX=${smoothDx.toFixed(3)}, ΔY=${smoothDy.toFixed(3)}`);
  }
}

// ======= TargetingSystem =======
class TargetingSystem {
  constructor(options = {}) {
    this.detector = new TargetDetector(options.detection || {});
    this.aimLock = new AimLockHeadTargetSystem(options.aimLock || {}); // ✅ sửa tên
    this.autoLockEnabled = options.autoLock ?? true;
    this.updateInterval = options.updateInterval || 16;
    this.triggerBot = options.triggerBot || false;

    this.isActive = false;
    this.lastUpdate = 0;

    this.stats = {
      locksAcquired: 0,
      timeActive: 0,
      lastActivation: 0
    };
  }

  fireButtonPressed() {
    this.isActive = true;
    this.stats.lastActivation = Date.now();
    console.log("🎯 Targeting System ACTIVATED");
  }

  fireButtonReleased() {
    if (this.isActive) {
      this.stats.timeActive += Date.now() - this.stats.lastActivation;
    }
    this.aimLock.releaseLock?.(); // ✅ optional safe
    this.isActive = false;
    console.log("🔓 Targeting System DEACTIVATED");
  }

  update(gameState) {
    const now = Date.now();
    if (now - this.lastUpdate < this.updateInterval) return;
    this.lastUpdate = now;

    if (!this.isActive || !gameState) return;

    const { playerPos, playerDirection, gameEntities } = gameState;
    if (!playerPos || !playerDirection || !gameEntities) return;

    const targets = this.detector.scanArea(
      playerPos,
      playerDirection,
      gameEntities
    );

    if (
      !this.aimLock.isLocked &&
      targets.length > 0 &&
      this.autoLockEnabled
    ) {
      const bestTarget = this.selectBestTarget(targets);
      if (bestTarget && this.aimLock.lockOnTarget(bestTarget, playerPos)) {
        this.stats.locksAcquired++;
      }
    }

    const result = this.aimLock.updateAimLock(playerPos);
    if (!result) return;

    // ✅ gửi input dạng object an toàn
    if (result.mouseMovement) {
      this.aimLock.sendMouseInput({
        deltaX: result.mouseMovement.deltaX,
        deltaY: result.mouseMovement.deltaY
      });
    }

    if (this.triggerBot && this.shouldTrigger(result)) {
      this.triggerFire();
    }
  }

  selectBestTarget(targets) {
    return targets.reduce((best, cur) => {
      if (!best) return cur;
      if (cur.confidence > best.confidence) return cur;
      if (cur.confidence === best.confidence && cur.priority > best.priority) return cur;
      if (
        cur.confidence === best.confidence &&
        cur.priority === best.priority &&
        cur.distance < best.distance
      ) return cur;
      return best;
    }, null);
  }

  shouldTrigger(aimResult) {
    if (!aimResult?.aimPosition || !aimResult?.target?.headPosition) return false;
    const threshold = 0.05;
    const distance = aimResult.aimPosition.distanceTo(
      aimResult.target.headPosition
    );
    return distance < threshold;
  }

  triggerFire() {
    console.log("🔫 AUTO FIRE!");
  }

  getStats() {
    return {
      ...this.stats,
      isActive: this.isActive,
      currentTarget: this.aimLock.lockedTarget?.targetType || "none",
      accuracy:
        this.stats.timeActive > 0
          ? (this.stats.locksAcquired / (this.stats.timeActive / 1000)).toFixed(2)
          : 0
    };
  }
}
// ===
// ======= Profiles =======
const profiles = {
  balanced: {
    detection: { scanRadius: 400, scanFOV: 120, detectionThreshold: 0.001 },
    aimLock: { lockStrength: 20.0, smoothing: 0.001, enablePrediction: true },
    autoLock: true
  }
};

// ======= Usage Example =======
const targetingSystem = new TargetingSystem(profiles.balanced);

const currentGameState = {
  playerPos: new Vector3(0, 0, 0),
  playerDirection: new Vector3(0, 0, 1),
  gameEntities: [
    {
      isAlive: true,
      isPlayer: false,
      type: "enemy",
      position: new Vector3(10, 0, 20),
      velocity: new Vector3(1, 0, 0),
      health: 80,
      maxHealth: 100,
      boundingBox: {
        min: new Vector3(-0.5, 0, -0.5),
        max: new Vector3(0.5, 1.8, 0.5)
      }
    }
  ]
};



// ===== Matrix4 Class =====
class Matrix4 {
  constructor(elements = null) {
    this.elements = elements || new Float32Array([
      1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1
    ]);
  }

  compose(position, quaternion, scale) {
    const {x,y,z,w} = quaternion;
    const x2 = x + x, y2 = y + y, z2 = z + z;
    const xx = x * x2, yy = y * y2, zz = z * z2;
    const xy = x * y2, xz = x * z2, yz = y * z2;
    const wx = w * x2, wy = w * y2, wz = w * z2;
    const te = this.elements;
    te[0] = (1 - (yy + zz)) * scale.x; te[1] = (xy + wz) * scale.x; te[2] = (xz - wy) * scale.x; te[3] = 0;
    te[4] = (xy - wz) * scale.y; te[5] = (1 - (xx + zz)) * scale.y; te[6] = (yz + wx) * scale.y; te[7] = 0;
    te[8] = (xz + wy) * scale.z; te[9] = (yz - wx) * scale.z; te[10] = (1 - (xx + yy)) * scale.z; te[11] = 0;
    te[12] = position.x; te[13] = position.y; te[14] = position.z; te[15] = 1;
    return this;
  }
}
const SENSITIVITY_MULTIPLIER = { x: 0.001, y: 0.001 };
const headclamp = (v, min, max) => Math.max(min, Math.min(max, v));

// ===== SAFE BINDPOSE =====
function applyBindpose(pos, b) {
  if (!b) return pos.clone();
  return new Vector3(
    b.e00 * pos.x + b.e01 * pos.y + b.e02 * pos.z + (b.e03 || 0),
    b.e10 * pos.x + b.e11 * pos.y + b.e12 * pos.z + (b.e13 || 0),
    b.e20 * pos.x + b.e21 * pos.y + b.e22 * pos.z + (b.e23 || 0)
  );
}
// ===== MOCK INPUT (Shadowrocket SAFE) =====
function sendInputToMouse({ deltaX, deltaY }) {
  // Shadowrocket không điều khiển chuột thật
  // Chỉ log hoặc gửi sang engine khác
  console.log(
    `🎯 MouseInput → ΔX=${deltaX.toFixed(4)} | ΔY=${deltaY.toFixed(4)}`
  );
}
// ===== RECOIL ENGINE =====
class RecoilFixEngine {
  constructor() {
    // ===== STATE =====
    this.prevAngle = new Vector3();
    this.weapon = "default";
    this.shotCount = 0;
    this.lastShotTime = 0;

    // ===== RECOIL MAP (FIX CHÍNH) =====
    this.recoilMap = {
      default: {
        recoilX: 0.0,
        recoilY: 0.0,
        smooth: 0.85,
        pattern: [1.0],
        recoveryRate: 1.0
      },
      mp40: {
        recoilX: 0.0,
        recoilY: 0.0,
        smooth: 0.78,
        pattern: [1.0, 1.2, 1.4, 1.6, 1.8, 2.0, 2.2, 2.4, 2.6, 2.8],
        recoveryRate: 0.88
      },
      ump: {
        recoilX: 0.0,
        recoilY: 0.0,
        smooth: 0.82,
        pattern: [1.0, 1.1, 1.3, 1.5, 1.7, 1.9, 2.1, 2.3, 2.5, 2.7],
        recoveryRate: 0.90
      },
      m1887: {
        recoilX: 0.0,
        recoilY: 0.0,
        smooth: 0.75,
        pattern: [1.0, 1.5, 2.0, 2.5],
        recoveryRate: 0.85
      },
      ak: {
        recoilX: 0.0,
        recoilY: 0.0,
        smooth: 0.72,
        pattern: [1.0, 1.3, 1.6, 1.9, 2.2, 2.5, 2.8, 3.1, 3.4, 3.7],
        recoveryRate: 0.85
      }
    };

    // ===== PREDICTION =====
    this.predictedPositions = [];
    this.maxPredictionHistory = 5;

    // ===== ADAPTIVE SMOOTH =====
    this.adaptiveSmoothing = {
      baseSmooth: 0.8,
      distanceMultiplier: 0.1,
      velocityMultiplier: 0.05
    };

    // ===== BIND CONTEXT (FIX QUAN TRỌNG) =====
    this.setWeapon = this.setWeapon.bind(this);
  }
setWeapon(w) {
  if (!this.recoilMap || typeof this.recoilMap !== "object") {
    this.weapon = "default";
    return;
  }

  this.weapon = this.recoilMap[w] ? w : "default";
  this.shotCount = 0;
}
compensate(yaw, pitch, firing) {
  // 🔒 Bảo vệ map
  const cfg = this.recoilMap[this.weapon] || this.recoilMap.default;

  // ===== SHOT COUNT =====
  if (firing) {
    this.shotCount = Math.min(
      this.shotCount + 1,
      cfg.pattern.length - 1
    );
  } else {
    this.shotCount = Math.max(0, this.shotCount - 1);
  }

  // ===== RECOIL FACTOR =====
  const factor = cfg.pattern[this.shotCount];

  const target = new Vector3(
    yaw * factor,
    pitch * factor,
    0
  );

  // ===== SMOOTH =====
  const out = this.prevAngle.clone().lerp(target, cfg.smooth);

  // ===== RECOVERY =====
  this.prevAngle = firing
    ? out.clone()
    : out.clone().multiplyScalar(cfg.recoveryRate);

  return out;
}
aim(camera, head, firing) {
  const camPos = new Vector3(
    camera.position.x,
    camera.position.y,
    camera.position.z
  );

  // ❗ clone để không phá dữ liệu head
  const dir = head.clone().subtract(camPos).normalize();

  const pitch = -Math.asin(clamp(dir.y, -1, 1));
  const yaw = Math.atan2(dir.x, dir.z);

  const aim = this.compensate(yaw, pitch, firing);

  sendInputToMouse({
    deltaX: aim.x * SENSITIVITY_MULTIPLIER.x,
    deltaY: aim.y * SENSITIVITY_MULTIPLIER.y
  });

  return aim;
}
}
const recoilEngine = new RecoilFixEngine();
recoilEngine.setWeapon("mp40");

const camera = { position: { x: 0, y: 2.0, z: 0 } };
const enemyHead = new Vector3(-0.0456, -0.0044, -0.0200);

// 🔥 gọi aim
const finalAim = recoilEngine.aim(camera, enemyHead, true);

console.log("🎯 AIM RESULT:", finalAim.toFixed?.(4) || finalAim);
// ===== TEST =====

// ===== BoneHeadTracker Class =====
class BoneHeadTracker {
  constructor(bindposeData, boneHeadData) {
    this.bindposeMatrix = bindposeData ? Matrix4.fromBindpose?.(bindposeData) || null : null;

    if (boneHeadData) {
      this.boneHeadPosition = new Vector3(
        boneHeadData.position.x,
        boneHeadData.position.y,
        boneHeadData.position.z
      );
      this.boneHeadRotation = new QuaternionHead(
        boneHeadData.rotation.x,
        boneHeadData.rotation.y,
        boneHeadData.rotation.z,
        boneHeadData.rotation.w
      );
      this.boneHeadScale = new Vector3(
        boneHeadData.scale.x,
        boneHeadData.scale.y,
        boneHeadData.scale.z
      );
      this.boneHeadMatrix = new Matrix4().compose(
        this.boneHeadPosition,
        this.boneHeadRotation,
        this.boneHeadScale
      );
    } else {
      this.boneHeadMatrix = null;
    }
  }

  getHeadPositionFromBindpose(offset = new Vector3(0, 0, 0)) {
    if (!this.bindposeMatrix) return null;
    return offset.applyMatrix4(this.bindposeMatrix);
  }

  getHeadPositionFromBoneData(offset = new Vector3(0, 0, 0)) {
    if (!this.boneHeadMatrix) return null;

    const rotatedOffset = this.boneHeadRotation.multiplyVector3(offset);
    return this.boneHeadPosition.add(rotatedOffset);
  }
}

// ===== CrosshairLock Class =====
class CrosshairLock {
  constructor() {
    this.crosshair = new Vector3(400, 300, 0);
  }

  lockTo(target, threshold = 0.005) {
    const dist = this.crosshair.distanceTo(target);
    if (dist <= threshold) {
      return true;
    } else {
      this.crosshair = target;
      return false;
    }
  }

  getPosition() {
    return this.crosshair;
  }
}

// ===== TriggerShoot Class =====
class TriggerShoot {
  constructor() {
    this.isShooting = false;
  }

  tryShoot(isLocked) {
    if (isLocked && !this.isShooting) {
      this.isShooting = true;
      console.log("🔫 Trigger SHOOT!");
    }
    if (!isLocked && this.isShooting) {
      this.isShooting = false;
      console.log("✋ STOP shooting");
    }
  }
}

// ===== Các biến quản lý trạng thái smoothing, prediction, reset =====
let lockedTarget = null;
let targetHistory = [];
const smoothingFactor = 0.3;
const predictionFactor = 2;
const headLockRange = 100;
const resetRange = 120;

// Giả lập trạng thái màu tâm ngắm
let isCrosshairRed = true;

// Hàm tính vận tốc
function computeVelocity(current, last) {
  return new Vector3(
    current.x - last.x,
    current.y - last.y,
    current.z - last.z
  );
}

// Hàm dự đoán vị trí mục tiêu
function predictPosition(current, velocity, factor) {
  return new Vector3(
    current.x + velocity.x * factor,
    current.y + velocity.y * factor,
    current.z + velocity.z * factor
  );
}

// Hàm làm mượt delta (drag aim)
function smoothDelta(prevDelta, newDelta, factor) {
  return new Vector3(
    prevDelta.x + (newDelta.x - prevDelta.x) * factor,
    prevDelta.y + (newDelta.y - prevDelta.y) * factor,
    prevDelta.z + (newDelta.z - prevDelta.z) * factor
  );
}

// Demo data (có thể thay bằng data thật)
const bindposeData = {
  e00: -1.34559613e-13, e01: 8.881784e-14, e02: -1.0, e03: 0.487912,
  e10: -2.84512817e-6, e11: -1.0, e12: 8.881784e-14, e13: -2.842171e-14,
  e20: -1.0, e21: 2.84512817e-6, e22: -1.72951931e-13, e23: 0.0,
  e30: 0.0, e31: 0.0, e32: 0.0, e33: 1.0
};

const demoBoneHeads = [
  {
    position: { x: -0.0456970781, y: -0.004478302, z: -0.0200432576 },
    rotation: { x: 0.0258174837, y: -0.08611039, z: -0.1402113, w: 0.9860321 },
    scale: { x: 0.99999994, y: 1.00000012, z: 1.0 }
  },
];

// Các vị trí head offset (có thể thêm)
const headOffsets = {
  forehead: new Vector3(0, 0.15, 0),
  eyes: new Vector3(0, 0.05, 0.05),
  top: new Vector3(0, 0.2, 0),
  chin: new Vector3(0, -0.1, 0),
};

const crosshairLock = new CrosshairLock();
const triggerShoot = new TriggerShoot();

// Hàm chọn target head gần nhất với crosshair, trong phạm vi lock
function chooseBestHeadTarget(crosshair) {
  let bestTarget = null;
  let minDistance = Infinity;

  for (const enemy of demoBoneHeads) {
    const tracker = new BoneHeadTracker(bindposeData, enemy);
    for (const key in headOffsets) {
      const offset = headOffsets[key];
      const rotatedOffset = tracker.boneHeadRotation.multiplyVector3(offset);
      const targetPos = tracker.boneHeadPosition.add(rotatedOffset);

      const dist = crosshair.distanceTo(targetPos);
      if (dist < minDistance && dist < headLockRange) {
        minDistance = dist;
        bestTarget = targetPos;
      }
    }
  }

  return bestTarget;
}

// ===== Vòng lặp chính =====
function mainLoop() {
  if (!isCrosshairRed) {
    lockedTarget = null;
    targetHistory = [];
    setTimeout(mainLoop, 16);
    return;
  }

  const crosshair = crosshairLock.getPosition();

  let bestTarget = chooseBestHeadTarget(crosshair);

  if (!bestTarget) {
    lockedTarget = null;
    targetHistory = [];
    
    return;
  }

  let velocity = new Vector3(0, 0, 0);
  if (targetHistory.length > 0) {
    velocity = computeVelocity(bestTarget, targetHistory[targetHistory.length - 1]);
  }

  let predictedPos = predictPosition(bestTarget, velocity, predictionFactor);

  let aimDelta = new Vector3(
    predictedPos.x - crosshair.x,
    predictedPos.y - crosshair.y,
    0
  );

  if (lockedTarget && lockedTarget.aimDelta) {
    aimDelta = smoothDelta(lockedTarget.aimDelta, aimDelta, smoothingFactor);
  }

  const newCrosshair = crosshair.add(aimDelta);
  crosshairLock.crosshair = newCrosshair;

  if (newCrosshair.distanceTo(bestTarget) > resetRange) {
    lockedTarget = null;
    targetHistory = [];
    setTimeout(mainLoop, 16);
    return;
  }

  lockedTarget = {
    position: bestTarget,
    aimDelta: aimDelta,
    timestamp: Date.now()
  };

  targetHistory.push(bestTarget);
  if (targetHistory.length > 10) targetHistory.shift();

  if (aimDelta.distanceTo(new Vector3(0, 0, 0)) < 1) {
    triggerShoot.tryShoot(true);
  } else {
    triggerShoot.tryShoot(false);
  }

class AimbotConfig {
  constructor() {
    this.enabled = true;
    this.autoShoot = true;
    this.teamCheck = true;
    this.fov = 360;
    this.smoothing = 0.0; // Immediate tracking
    this.prediction = 0;
    this.maxDistance = 9999;
    this.headPriority = 1.0;
    this.preferClosest = true;
    this.maxTargetHistory = 5;
    this.humanization = false;
   
  }
}

// ===== AimbotEngine Gộp TargetManager + BoneHeadTracker =====
class AimbotEngine {
  constructor(config = new AimbotConfig()) {
    this.config = config;
    this.enemies = [];
    this.playerPosition = new Vector3();
    this.lastTarget = null;
    this.headPosition = new Vector3();
  }

  updateEnemies(enemyList) {
    this.enemies = enemyList.filter(e => e && e.health > 0 && e.boneHead);
  }

  updatePlayerPosition(pos) {
    this.playerPosition = new Vector3(pos.x, pos.y, pos.z);
  }

  getNearestEnemy() {
    let closest = null;
    let minDist = Infinity;
    for (const enemy of this.enemies) {
      const dist = this.playerPosition.distanceTo(enemy.position);
      if (dist < minDist && dist <= this.config.maxDistance) {
        closest = enemy;
        minDist = dist;
      }
    }
    return closest;
  }

  computeHeadPosition(bone) {
    if (!bone || !bone.position || !bone.rotation || !bone.scale) return new Vector3();
    const matrix = new Matrix4().compose(
      new Vector3(bone.position.x, bone.position.y, bone.position.z),
      new Quaternion(bone.rotation.x, bone.rotation.y, bone.rotation.z, bone.rotation.w),
      new Vector3(bone.scale.x, bone.scale.y, bone.scale.z)
    );
    const headOffset = new Vector3( -0.04089227, 0.00907892,0.02748467);
    return headOffset.applyMatrix4(matrix);
  }

  getAimPoint() {
    const target = this.getNearestEnemy();
    if (!target) return null;
    this.lastTarget = target;
    this.headPosition = this.computeHeadPosition(target.boneHead);
    return this.headPosition.clone();
  }
}

// ===== Khởi Tạo & Kiểm Tra =====
const config = new AimbotConfig();
const engine = new AimbotEngine(config);

// Giả lập enemy và player
const enemies = [
  {
    health: 100,
    position: new Vector3(10, 0, 20),
    boneHead: {
      position: {x: -0.0456970781, y: -0.004478302, z: -0.0200432576},
      rotation: {x: 0.0258174837, y: -0.08611039, z: -0.1402113, w: 0.9860321},
      scale: {x: 0.99999994, y: 1.00000012, z:1.0}
    }
  }
];
const playerPos = { x: 0, y: 0, z: 0 };

// Cập nhật và lấy tọa độ
engine.updateEnemies(enemies);
engine.updatePlayerPosition(playerPos);
const aimPoint = engine.getAimPoint();

if (aimPoint) {
  console.log("🎯 Aim Head:", aimPoint.x.toFixed(3), aimPoint.y.toFixed(3), aimPoint.z.toFixed(3));
}

  console.log("🎯 Crosshair:", newCrosshair.toFixed());
  console.log("🎯 Target (predicted):", predictedPos.toFixed());
  console.log("🔒 Locked:", true);

  setTimeout(mainLoop, 8);
}

console.log("✅ Shadowrocket Headlock Aimbot Ready!");

// Khởi động vòng lặp
console.log("🚀 Khởi động hệ thống tracking + smoothing + prediction + trigger...");
mainLoop();





// == Advanced Kalman Filter with Adaptive Parameters ==
class AdaptiveKalmanFilter {
  constructor(R = 0.005, Q = 0.0008) {
    this.R = R; // Measurement noise (lower = more responsive)
    this.Q = Q; // Process noise (lower = smoother)
    this.A = 1; this.C = 1;
    this.x = NaN; this.cov = NaN;
    this.adaptiveR = R;
    this.velocityBuffer = [];
    this.maxBufferSize = 5;
  }
  
  updateAdaptiveNoise(velocity) {
    // Adaptive noise based on movement speed
    this.velocityBuffer.push(velocity);
    if (this.velocityBuffer.length > this.maxBufferSize) {
      this.velocityBuffer.shift();
    }
    
    const avgVelocity = this.velocityBuffer.reduce((a, b) => a + b, 0) / this.velocityBuffer.length;
    this.adaptiveR = this.R * (1 + avgVelocity * 0.1); // Increase noise for fast movement
  }
  
  filter(z, velocity = 0) {
    this.updateAdaptiveNoise(velocity);
    
    if (isNaN(this.x)) {
      this.x = z; 
      this.cov = this.adaptiveR;
    } else {
      const predX = this.A * this.x;
      const predCov = this.cov + this.Q;
      const K = predCov * this.C / (this.C * predCov * this.C + this.adaptiveR);
      this.x = predX + K * (z - this.C * predX);
      this.cov = predCov - K * this.C * predCov;
    }
    return this.x;
  }
}
const WeaponProfiles = {
  "M1887": { 
    recoilSmooth: 9999.0,        // Increased for better recoil compensation
    dragSensitivity: 9999.0,     // Significantly increased for faster tracking
    aimLockStrength: 999.0,     // Enhanced lock strength
    accuracyBoost: 999.0,       // Higher accuracy
    predictionFactor: 9999.0,    // Movement prediction
    smoothingFactor: 1.0,    // Aim smoothing
    snapThreshold: 0.001,      // Distance threshold for instant snap
    velocityCompensation: 9999.0 // Velocity-based compensation
  },
  "DEFAULT": { 
 recoilSmooth: 9999.0,        // Increased for better recoil compensation
    dragSensitivity: 9999.0,     // Significantly increased for faster tracking
    aimLockStrength: 999.0,     // Enhanced lock strength
    accuracyBoost: 999.0,       // Higher accuracy
    predictionFactor: 9999.0,    // Movement prediction
    smoothingFactor: 1.0,    // Aim smoothing
    snapThreshold: 0.001,      // Distance threshold for instant snap
    velocityCompensation: 9999.0 // Velocity-based compensation
  }
};

// == Enhanced AimLock System ==
class EnhancedAimLockToHead {
  constructor(weapon = "DEFAULT") {
    this.weapon = weapon;
    this.profile = WeaponProfiles[weapon] || WeaponProfiles["DEFAULT"];
    
    // Advanced Kalman filters
    this.kalmanX = new AdaptiveKalmanFilter(0.003, 0.0005);
    this.kalmanY = new AdaptiveKalmanFilter(0.003, 0.0005);
    this.kalmanZ = new AdaptiveKalmanFilter(0.003, 0.0005);
    
    // Movement tracking
    this.prevHeadPos = null;
    this.velocity = Vector3.zero();
    this.acceleration = Vector3.zero();
    this.prevVelocity = Vector3.zero();
    this.lastTime = Date.now();
    
    // History for better prediction
    this.positionHistory = [];
    this.maxHistorySize = 8;
    
    // Smoothing system
    this.targetPosition = Vector3.zero();
    this.currentAim = Vector3.zero();
    
    // Performance optimization
    this.frameCount = 0;
    this.skipFrames = 0; // For dynamic frame skipping
  }
  
  updateMovementTracking(currentPos) {
    const now = Date.now();
    const dt = Math.max((now - this.lastTime) / 1000, 0.001);
    
    if (this.prevHeadPos && dt > 0) {
      // Calculate velocity and acceleration
      const newVelocity = currentPos.subtract(this.prevHeadPos).multiplyScalar(1 / dt);
      this.acceleration = newVelocity.subtract(this.velocity).multiplyScalar(1 / dt);
      this.prevVelocity = this.velocity.clone();
      this.velocity = newVelocity;
      
      // Update position history
      this.positionHistory.push({
        pos: currentPos.clone(),
        vel: this.velocity.clone(),
        time: now
      });
      
      if (this.positionHistory.length > this.maxHistorySize) {
        this.positionHistory.shift();
      }
    }
    
    this.prevHeadPos = currentPos.clone();
    this.lastTime = now;
  }
  
  predictFuturePosition(currentPos, predictionTime = 0.05) {
    // Advanced prediction using velocity and acceleration
    const velPrediction = this.velocity.multiplyScalar(predictionTime * this.profile.predictionFactor);
    const accelPrediction = this.acceleration.multiplyScalar(0.5 * predictionTime * predictionTime);
    
    return currentPos.add(velPrediction).add(accelPrediction);
  }
  
  trackWithKalman(pos) {
    const velocityMagnitude = this.velocity.magnitude();
    
    return new Vector3(
      this.kalmanX.filter(pos.x, velocityMagnitude),
      this.kalmanY.filter(pos.y, velocityMagnitude),
      this.kalmanZ.filter(pos.z, velocityMagnitude)
    );
  }
  
  applyAdvancedRecoilCompensation(tracked, recoil) {
    // Dynamic recoil compensation based on weapon profile
    const recoilCompensation = recoil.multiplyScalar(this.profile.recoilSmooth);
    const velocityCompensation = this.velocity.multiplyScalar(this.profile.velocityCompensation * 0.01);
    
    return tracked.subtract(recoilCompensation).add(velocityCompensation);
  }
  
  applyEnhancedDragSensitivity(current, target) {
    const distance = current.distance(target);
    const delta = target.subtract(current);
    
    // Dynamic sensitivity based on distance and velocity
    let dynamicSensitivity = this.profile.dragSensitivity;
    
    // Increase sensitivity for close targets
    if (distance < this.profile.snapThreshold) {
      dynamicSensitivity *= 2.0; // Instant snap for very close targets
    } else {
      // Scale sensitivity based on target velocity
      const velocityFactor = Math.min(this.velocity.magnitude() * 10 + 1, 3.0);
      dynamicSensitivity *= velocityFactor;
    }
    
    return current.add(delta.multiplyScalar(dynamicSensitivity));
  }
  
  applySmoothingFilter(newTarget) {
    // Smooth aim movement to prevent jittery aiming
    const smoothingFactor = this.profile.smoothingFactor;
    this.targetPosition = this.targetPosition.lerp(newTarget, smoothingFactor);
    return this.targetPosition;
  }
  
  shouldSkipFrame() {
    // Dynamic frame skipping for performance optimization
    this.frameCount++;
    const velocityMagnitude = this.velocity.magnitude();
    
    if (velocityMagnitude < 0.01 && this.frameCount % 2 === 0) {
      return true; // Skip every other frame for stationary targets
    }
    
    return false;
  }
  
  lockAimToBoneHead(boneHeadPos, recoilOffset, currentCrosshairPos) {
    // Performance optimization
    if (this.shouldSkipFrame()) {
      return;
    }
    
    // Update movement tracking
    this.updateMovementTracking(boneHeadPos);
    
    // Predict future position
    const predictedPos = this.predictFuturePosition(boneHeadPos);
    
    // Apply Kalman filtering
    const tracked = this.trackWithKalman(predictedPos);
    
    // Apply advanced recoil compensation
    const recoilAdjusted = this.applyAdvancedRecoilCompensation(tracked, recoilOffset);
    
    // Apply enhanced drag sensitivity
    const dragAdjusted = this.applyEnhancedDragSensitivity(currentCrosshairPos, recoilAdjusted);
    
    // Apply smoothing filter
    const smoothedTarget = this.applySmoothingFilter(dragAdjusted);
    
    // Set final aim position
    this.setAim(smoothedTarget);
  }
  
  setAim(vec3) {
    this.currentAim = vec3.clone();
    
    // Enhanced debug output
    const velocity = this.velocity.magnitude();
    const distance = this.currentAim.distance(this.prevHeadPos || Vector3.zero());
    
    console.log(`🎯 Enhanced M1887 Lock | Pos: (${vec3.x.toFixed(4)}, ${vec3.y.toFixed(4)}, ${vec3.z.toFixed(4)}) | Vel: ${velocity.toFixed(3)} | Dist: ${distance.toFixed(4)}`);
    
    // Uncomment for real implementation
    // GameAPI.setCrosshair(vec3.x, vec3.y, vec3.z);
  }
  
  // Additional utility methods
  getAimAccuracy() {
    if (!this.prevHeadPos) return 0;
    const distance = this.currentAim.distance(this.prevHeadPos);
    return Math.max(0, 1 - distance * 10); // Accuracy percentage
  }
  
  resetTracking() {
    this.kalmanX = new AdaptiveKalmanFilter(0.003, 0.0005);
    this.kalmanY = new AdaptiveKalmanFilter(0.003, 0.0005);
    this.kalmanZ = new AdaptiveKalmanFilter(0.003, 0.0005);
    this.positionHistory = [];
    this.velocity = Vector3.zero();
    this.acceleration = Vector3.zero();
  }
}

// == Enhanced Simulation Loop ==
const bone_Head = new Vector3(-0.0456970781, -0.004478302, -0.0200432576);
let recoil = new Vector3(0, 0, 0);
let currentCrosshair = new Vector3(0, 0, 0);

// Create enhanced aimlock instance for M1887
const enhancedAimLock = new EnhancedAimLockToHead("M1887");

// Performance monitoring
let frameTime = Date.now();
let fps = 0;

function runEnhancedAimLoop() {
  // FPS calculation
  const now = Date.now();
  fps = 1000 / Math.max(now - frameTime, 1);
  frameTime = now;
  
  // Simulate dynamic target movement (for testing)
  const time = now / 1000;
  const dynamicTarget = new Vector3(
    bone_Head.x + Math.sin(time * 2) * 0.01,
    bone_Head.y + Math.cos(time * 1.5) * 0.008,
    bone_Head.z + Math.sin(time * 0.8) * 0.005
  );
  
  // Simulate recoil pattern (for testing)
  recoil = new Vector3(
    Math.random() * 0.002 - 0.001,
    Math.random() * 0.003 - 0.0015,
    0
  );
  
  // Run enhanced aimlock
  enhancedAimLock.lockAimToBoneHead(dynamicTarget, recoil, currentCrosshair);
  
  // Performance info every 60 frames
  if (enhancedAimLock.frameCount % 60 === 0) {
    console.log(
      `📊 Performance: ${fps.toFixed(1)} FPS | Accuracy: ${(enhancedAimLock.getAimAccuracy() * 100).toFixed(1)}%`
    );
  }

  // 🔁 LOOP – RẤT QUAN TRỌNG
  requestAnimationFrame(runEnhancedAimLoop);
}

// ==UserScript==
// @name         Patch Collider & SABone Enhancer (Safe)
// @namespace    http://garena.freefire/
// @match        *api.ff.garena.com*
// @run-at       response
// ==/UserScript==

const HITDETECT_SCRIPT_PATHID = 5413178814189125325;

// === Patch function đệ quy để sửa các object collider/bone
function deepPatch(obj) {
  if (typeof obj !== "object" || obj === null) return;

  for (let key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
    const val = obj[key];

    // --- Patch hitdetectcolliderhelper ---
    if (
      val?.m_Script?.m_PathID === HITDETECT_SCRIPT_PATHID &&
      val?.ColliderType !== undefined
    ) {
      val.ColliderType = 3;
      val.m_Enabled = 1;
      val.AlwaysEnable = true;
      val.IsCritical = true;
      val.ForceHeadshot = true;
      val.LockOnTarget = true;
      val.HitboxExpand = 1.5;
      val.LockCrosshair = true;
      val.TrackAim = true;
      val.TargetBone = "Head";
      val.IsAimTarget = true;
      val.AimAssistPriority = 9999;
      val.IgnoreCulling = true;
    }

    // --- Patch SABone / BoneCollider ---
    if (
      typeof val?.m_Name === "string" &&
      /SABone|Head|Neck|Spine|BoneCollider/i.test(val.m_Name)
    ) {
      val.m_Enabled = 1;
      val.AlwaysEnable = true;
      val.ForceHeadshot = true;
      val.IsCritical = true;
      val.Priority = 9999;
      val.LockOnTarget = true;
      val.HitboxExpand = 1.5;
      val.LockCrosshair = true;
      val.TrackAim = true;
      val.TargetBone = "Head";
      val.IsAimTarget = true;
      val.AimAssistPriority = 9999;
      val.IgnoreCulling = true;
      if (val.ColliderType !== undefined) val.ColliderType = 3;
    }

    if (typeof val === "object") {
      deepPatch(val);
    }
  }
}

// === Parse JSON từ response một cách an toàn ===
try {
  if (!$response || !$response.body) {
    throw new Error("Không có response.body");
  }

  const body = $response.body;
  const data = JSON.parse(body);

  deepPatch(data);

  $response.body = JSON.stringify(data);

  console.log("✅ Collider & SABone patch applied successfully");

} catch (err) {
  console.log("❌ Patch error:", err.message);
}
// =====================================================
// 🎮 FREE FIRE 3D NECK LOCK + DRAG HEADSHOT ENGINE
// ✅ Clean | No undefined | Shadowrocket compatible
// =====================================================

// ===============================
// 🔧 MASTER CONFIG
// ===============================
const FREEFIRECONFIG = {
  SCREEN: {
    CENTER_X: 1376,
    CENTER_Y: 1032,
    DEPTH_SCALE: 1000,
    fpsLimit: 60
  },
  FIRE_BUTTON: {
    x: 1000,
    y: 1800
  },
  BONE_NECK: {
    position: { x: -0.128512, y: 0.0, z: 0.0 },
    rotation: { x: -0.012738, y: -0.002122, z: 0.164307, w: 0.986325 },
    scale: { x: 1, y: 1, z: 1 },
    hitbox1: {
      radius: 0.07,
      height: 0.17,
      offset: { x: -0.08, y: -0.01, z: 0.0018 }
    },
    hitbox2: {
      radius: 0.09,
      height: 0.19,
      offset: { x: -0.011, y: 0.017, z: -0.0004 }
    }
  },
  NECK_3D_LOCK: {
    enabled: true,
    lockRadius: 9999,
    lockForce: 1.0,
    magnetism: 1.0,
    quaternionCorrection: true
  },
  DRAG_HEADSHOT: {
    enabled: true,
    dragThreshold: 12,
    dragForce: 0.65,
    transitionSmooth: 0.85,
    headSnapRadius: 13,
    dragHistory: 3
  },
  MODES: {
    debugOverlay: true
  }
};

// ===============================
// 🔗 APPLY CONFIG
// ===============================
var CONFIG = FREEFIRECONFIG;
const CENTER_X = CONFIG.SCREEN.CENTER_X;
const CENTER_Y = CONFIG.SCREEN.CENTER_Y;

// ===============================
// 📐 VECTOR 3D
// ===============================
class Vector3D {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  add(v) {
    return new Vector3D(this.x + v.x, this.y + v.y, this.z + v.z);
  }

  toScreen() {
    const depth = this.z + 0.001;
    return {
      x: CENTER_X + (this.x * CONFIG.SCREEN.DEPTH_SCALE) / depth,
      y: CENTER_Y + (this.y * CONFIG.SCREEN.DEPTH_SCALE) / depth
    };
  }
}

// ===============================
// 🧭 QUATERNION
// ===============================
class Quaternion {
  constructor(x = 0, y = 0, z = 0, w = 1) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }

  rotateVector(v) {
    const { x, y, z, w } = this;
    const uvx = y * v.z - z * v.y;
    const uvy = z * v.x - x * v.z;
    const uvz = x * v.y - y * v.x;

    const uuvx = y * uvz - z * uvy;
    const uuvy = z * uvx - x * uvz;
    const uuvz = x * uvy - y * uvx;

    return new Vector3D(
      v.x + (uvx * w + uuvx) * 2,
      v.y + (uvy * w + uuvy) * 2,
      v.z + (uvz * w + uuvz) * 2
    );
  }

  getForwardVector() {
    return this.rotateVector(new Vector3D(0, 0, 1));
  }
}

// ===============================
// 🦴 BONE NECK TRACKER
// ===============================
class BoneNeckTracker {
  constructor() {
    this.neckHistory = [];
    this.dragHistory = [];
    this.lockConfidence = 0;
    this.dragTransition = 0;
  }

  calculate3DNeckPosition(hitboxIndex = 0) {
    const bone = CONFIG.BONE_NECK;
    const hitbox = hitboxIndex === 0 ? bone.hitbox1 : bone.hitbox2;

    const bonePos = new Vector3D(
      bone.position.x,
      bone.position.y,
      bone.position.z
    );

    const offset = new Vector3D(
      hitbox.offset.x,
      hitbox.offset.y,
      hitbox.offset.z
    );

    const quat = new Quaternion(
      bone.rotation.x,
      bone.rotation.y,
      bone.rotation.z,
      bone.rotation.w
    );

    const rotatedOffset = quat.rotateVector(offset);
    const finalPos = bonePos.add(rotatedOffset);

    return {
      position3D: finalPos,
      screenPos: finalPos.toScreen(),
      radius: hitbox.radius * CONFIG.SCREEN.DEPTH_SCALE,
      quaternion: quat
    };
  }

  apply3DNeckLock(input, neck) {
    if (!CONFIG.NECK_3D_LOCK.enabled) return input;

    const dx = neck.screenPos.x - input.x;
    const dy = neck.screenPos.y - input.y;
    const dist = Math.hypot(dx, dy);

    if (dist < neck.radius) {
      if (CONFIG.NECK_3D_LOCK.quaternionCorrection) {
        const fwd = neck.quaternion.getForwardVector();
        return {
          x: neck.screenPos.x + fwd.x * 2,
          y: neck.screenPos.y + fwd.y * 2
        };
      }
      return neck.screenPos;
    }

    return {
      x: input.x + dx * CONFIG.NECK_3D_LOCK.lockForce,
      y: input.y + dy * CONFIG.NECK_3D_LOCK.lockForce
    };
  }

  applyDragHeadshot(vec, neck, head) {
    if (!CONFIG.DRAG_HEADSHOT.enabled) return vec;

    const dx = head.x - vec.x;
    const dy = head.y - vec.y;
    const dist = Math.hypot(dx, dy);

    if (dist < CONFIG.DRAG_HEADSHOT.headSnapRadius) {
      return {
        x: vec.x + dx * CONFIG.DRAG_HEADSHOT.dragForce,
        y: vec.y + dy * CONFIG.DRAG_HEADSHOT.dragForce
      };
    }
    return vec;
  }
}

// ===============================
// 🔁 MAIN PIPELINE
// ===============================
function processFrame(inputVec, headScreenPos) {
  const tracker = new BoneNeckTracker();

  const neck = tracker.calculate3DNeckPosition(0);
  let out = tracker.apply3DNeckLock(inputVec, neck);
  out = tracker.applyDragHeadshot(out, neck, headScreenPos);

  return out;
}

// ===============================
// 🧪 TEST
// ===============================
const inputVec = { x: 532, y: 948 };
const headScreen = { x: 540, y: 920 };

const result = processFrame(inputVec, headScreen);
console.log("🎯 RESULT:", result);


// Patch Free Fire Config via Shadowrocket MITM


    // Các key cần gán giá trị tùy chỉnh
    const customValues = {
        'com.act_conf_seclect_seclect_sync_setting"100"Key_acp_allow.file_code_unlock_connect_Dtps-setting_system_appdata&app_app_com.dts.freefireth_on_auto_cws': "70-100_on_uncrack.strings=true",
        'com.act_conf_seclect_seclect_sync_device"100"Key_act_allow.file_code_function_apnRevork_Exactly_feebase86_delay0.1_on_settime0.4_touchandhold_auto_cws': "70-100.uncrack.list=true",
        "com.accept_devices_Key_auto.setting": "70-100",
        "com.act_ffxbase64_Key_adt_allow.list": "10",
        "com.adt_xbaseff64_Key_act.list": "1440",
        "com.virtual-ffxbase42.accpt-feebase.list-virtualMouseDl-0,03.reroll-setting_accptDevice.dat": "60-100",
        'com.act_conf_seclect_sync_setting"100"Key_acp_allow.file_code_Dtps_com.dts.freefirethmax_auto_cws': "70-100_on.uncrack.strings=true",
        'com.acp_conf_seclect_sync_setting"100"Key_acp_allow.file_code_apncpss_com.dts.freefireth_auto_cws': "70-100_on.uncrack.list=true",
        'com.act_conf_seclect_sync_setting"100"Key_acp_allow.rick.file_code_apnrevork_ipssettinghexbase64_appdata_auto_cws': "70-100_on.uncrack.strings=true",
        'com.act_conf_seclect_sync_setting"100"Key_act_allow.rick.file_code_apnrevork_ipssettinghexbase64_appmaneger_auto_cws': "70-100_on.uncrack.list=true",
        'com.act_conf_seclect_sync_setting"100"Key_act_allow.file_code_connectInject_unlock_refreshratemax_set"120"_device_on_auto_cws': "70-100_on_uncrack.so=true",
        "com.act_conf_seclect.boostextreme_system_appdata&_app_com.dts.freefireth_on-set100_Key_act_allow.file_code_auto_cws": "70-100.uncrack.so=true",
        'com.act_conf_seclect_seclect_sync_device"100"Key_acp_allow.file_code_connectInject_boostextreme_setting-app_com.dts.freefireth_on_auto_cws': "70-100_on_uncrack.so=true",
        'com.act_conf_seclect_seclect_sync_setting"100"Key_acp_allow.file_code_connectInject-unlock_high-roll-stp_cpssbase64_on_auto_cws': "70-100.uncrack.list=true",
        'com.act_conf_seclect_seclect_sync_setting"100"Key_acp_allow.file_code_connectInject-unlock-boostmax-optizime-setting_appmanger_on_auto_cws': "70-100.uncrack.fzs=true",
        "com.accpt_WyI0IiwiM0l0SlRwQTFTSUNDcXNXQXhsdG8ra0ZmQUU5L0wrVGZRUUQrZ1lybSJd_allow.list": "70-120=true",
        "com.analytics_root_WyI0IiwiM0l0SlRwQTFTSUNDcXNXQXhsdG8ra0ZmQUU5L0wrVGZRUUQrZ1lybSJd_auto.cws": "70-100=true",
        "com.accept_devices_WyI0IiwiM0l0SlRwQTFTSUNDcXNXQXhsdG8ra0ZmQUU5L0wrVGZRUUQrZ1lybSJd_auto.setting": "70-100=true",
        "com.libsystem_pthread.dylib-Pre9M76X3pyLNQCUO6.select.on_allow.file.list": true,
        "acp_file_connected_freefireth-listextension": 1,
        "acp_freefireth-listextension": 1,
        "select_freefireth-listextension": 1,
        "act_code_injection_file_connected_freefireth-listextension": 1,
        "act_code_injection_freefireth-listextension": 1,
        "acp_file_connected_freefireth-listoftern": 1,
        "acp_freefireth-listoftern": 1,
        "act_code_connected_app_freefireth-listoftern": 1,
        "acp_file_connected_freefireth-listrollstp": 1,
        "acp_freefireth-listrollstp": 1,
        "act_injection_code_file_connected_freefireth-listdesgin-rover": 1,
        "acp_file_seclect_root_hide_sysn_auto_dat": 1,
        "conf_idelay": 1,
        "unlockernel_click": 1,
        "const_udelay": 1,
        "com.unlockplatform_driverxbase64": 1
    };

    // Các key cần set = true
    const keysTrue = [
        "com.ss-ffx64.aps", "com.gamsrollm.list", "com.analytics-sys.ips", "com.maxpointer.inject.ips",
        "com.monaihd.inject.ips", "com.nq-settingaccpt.data", "com.fn-settingaccpt.list",
        "com.sx-ffbasex64-prefer.data", "com.high_effect_device.target_lockffbasse64_sellect.on.allow.file",
        "com-ve-hhighc-ffbase64-plist", "com-ve-hhighc-ffbase32-plist", "com-ur-settingaccpt-prefer.plist",
        "com-ur-system-prefer.data", "com.itfz-ffx32base.list", "com.jsonaxbaseffx64.data", "com.fullaccesspointer.dat",
        "com.lockuni-ffx64.dat", "com.rightup.setting.list", "com.lockini-ffbasex64", "com.inirrate-ffbasex64",
        "com.setup-lockbase.dat", "com.lockr-ffx64base", "com.-bz-prefer-apn", "com.setting-vx-ffbase64-zip",
        "com.exten-ffbasex64", "freebase.com.ffx64base", "com.regcl-ffbasex32", "com.highperformance.ffbasex64",
        "com.khfile-ffbasex64", "cwom.vr-device-delay-prefer.apn", "com.uc-setting-device.plist",
        "com-vg-hhighc-prefer-ffbasex64.zip", "com.vg-lockr-ffbase64", "com.vg-prefer-ffbasex64z.zip",
        "com.av-hhighc.data", "com.lockl-ffx64base", "com.leftup.setting.list", "com.lockinix64-ffbasex64",
        "com.br-lockup-prefer.zip", "com.bzh-lockdown-prefer.dat", "com.fixrecoil-ffbase64",
        "com.lockregcl-ffbase64.apn", "com-libdispatch.dylib-n0iFEP", "com.Adt-actGonffbase64.dat",
        "com.2C6B-4048GB.setting", "com.A03C-1108USJBxbase64.setting", "com.lockui.systemxbase64.plist",
        "com.infordevice.systemppi-500-on.zip", "com.infordevice.systemppi-500-onxffbase64-apk",
        "com.ppi-unlocksystem/400ppi-on-prefer.android/os", "com.lockleft/ui/os-high/on.high.android",
        "com.unlock-lockhead-on-prefer/android-os", "com.flextouchdelay3d.android/os",
        "com.syystemunlockppi400-on.ffbase64.apn", "com.unlocktouchdelaymedium.on/android/os",
        "com.profileunlocktouchdelay.on-zip", "com.infordevicelockreg/high.on_sever_DAMQ-RQMD_APN_FODER",
        "com.ppi-unlocksystem/400ppi.on-prefer_sever_DAMQ-RQMD_EXP", "com.roms-ffx64base.dat",
        "com.ram-ffx64base.dat", "com.settinguptm.list", "com.writecurently-ffx64base.oss",
        "com.ext-allyacc.fzs", "com.rv-settingaccpt-prefer.ips", "com.system-uv-touchdelay-0.ips",
        "com.uu.sentov-ffbase64-prefer.list", "com.uu.sentov-ffbase32-prefer.list", "fae_ffxbase64_DOMAIN-FULL_hyper.roll",
        "rog.theme_ffxbase63_HKEY-USER-ROGL-PKIN_ptspd.list", "com.siop.ips"
    ];
const FreeFireSystemInjection = {
HyperHeadLockSystem: {
        enabled: true,
        aimBone: "bone_Head",
        autoLockOnFire: true,
        holdLockWhileDragging: true,
        stickiness: "hyper",
        snapToleranceAngle: 0.0,
        disableBodyRecenter: true,
        trackingSpeed: 10.0,
        smoothing: 0.0,
        maxDragDistance: 0.0,
        snapBackToHead: true,
        predictionFactor: 1.5,
        autoFireOnLock: true,
        boneOffset: { x: -0.0456970781, y: -0.004478302, z: -0.0200432576 },
        rotationOffset: { x: 0.0258174837, y: -0.08611039, z: -0.1402113, w: 0.9860321 },
        scale: { x: 1.0, y: 1.0, z: 1.0 }
    },

    StableHeadLockSystem: {
        enabled: true,
        aimBone: "bone_Head",
        autoLockOnFire: true,
        holdLockWhileDragging: true,
        stickiness: "extreme",
        snapToleranceAngle: 0.0,
        disableBodyRecenter: true,
        trackingSpeed: 5.0,
        smoothing: 0.0,
        maxDragDistance: 0.0,
        snapBackToHead: true,
        predictionFactor: 1.2,
        boneOffset: { x: -0.0456970781, y: -0.004478302, z: -0.0200432576 },
        rotationOffset: { x: 0.0258174837, y: -0.08611039, z: -0.1402113, w: 0.9860321 },
        scale: { x: 1.0, y: 1.0, z: 1.0 }
    },

    TouchBoostPrecisionSystem: {
        enabled: true,
        precisionMode: true,
        boostOnTouch: true,
        boostOnDrag: true,
        boostOnFire: true,
        baseSensitivity: 10.0,
        boostMultiplier: 20.0,
        precisionDragMultiplier: 0.0,
        boostRampUpTime: 0.0,
        boostDecayTime: 0.0,
        microDragPrecision: 0.0,
        microDragMultiplier: 1.0,
        tapDistanceThreshold: 0.0,
        microAdjustThreshold: 0.0,
        microAdjustSmoothing: 1.0,
        latencyCompensation: true,
        latencyMs: -30,
        overshootProtection: true,
        overshootLimit: 0.0,
        debugLog: false
    },

    InstantDragToBoneHead: {
        enabled: true,
        targetBone: "bone_Head",
        snapOnDragStart: true,
        holdLockWhileDragging: true,
        maxSnapDistance: 0.01,
        trackingSpeed: 2.0,
        smoothing: 0.0,
        snapToleranceAngle: 0.0,
        disableBodyRecenter: true,
        predictionFactor: 1.0,
        boneOffset: { x: -0.0456970781, y: -0.004478302, z: -0.0200432576 },
        rotationOffset: { x: 0.0258174837, y: -0.08611039, z: -0.1402113, w: 0.9860321 },
        scale: { x: 1.0, y: 1.0, z: 1.0 }
    },

    PointerSpeedBoost: { pointerSpeedBoost: 9, confPointerTiming: 1, selectPointerSpeedRoot9: 1 },
    PPIInjection: { ppiOverride: 550, selectPPIInfo: 1 },
    DPIInjection: { dpiPointer: 10000 },

    AimHeadLock: {
        aimBone: "bone_Head",
        autoLock: true,
        lockInjection: true,
        lockStrength: "maximum",
        snapBias: 1.0,
        trackingSpeed: 1.0,
        dragCorrectionSpeed: 5.0,
        snapToleranceAngle: 1.5,
        maxLockAngle: 360,
        stickiness: "high",
        headStickPriority: true,
        headLockPriority: true,
        disableBodyRecenter: true,
        minDistanceToLock: 0.0,
        boneHead_position: { x: -0.0456970781, y: -0.004478302, z: -0.0200432576 },
        boneHead_rotation: { x: 0.0258174837, y: -0.08611039, z: -0.1402113, w: 0.9860321 },
        boneHead_scale: { x: 1.0, y: 1.0, z: 1.0 }
    },

    AutoAimLockHeadOnFire_StableDrag: {
        enabled: true,
        aimBone: "bone_Head",
        autoLockOnFire: true,
        holdLockWhileFiring: true,
        dragSmoothFactor: 0.85,
        maxDragDistance: 0.02,
        snapBackToHead: true,
        trackingSpeed: 1.5,
        predictionFactor: 0.9,
        snapToleranceAngle: 0.0,
        stickiness: "extreme",
        disableBodyRecenter: true,
        smoothing: 1.0,
        boneOffset: { x: -0.0456970781, y: -0.004478302, z: -0.0200432576 },
        rotationOffset: { x: 0.0258174837, y: -0.08611039, z: -0.1402113, w: 0.9860321 },
        scale: { x: 1.0, y: 1.0, z: 1.0 }
    },

    AimNeckLock: {
        aimTrackingBone: "bone_Neck",
        autoLock: true,
        lockStrength: "maximum",
        snapBias: 1.0,
        trackingSpeed: 1.0,
        dragCorrectionSpeed: 4.8,
        snapToleranceAngle: 0.0,
        maxLockAngle: 360,
        stickiness: "high",
        neckStickPriority: true,
        boneNeck_position: { x: -0.128512, y: 0.0, z: 0.0 },
        boneNeck_rotation: { x: -0.012738, y: -0.002122, z: 0.164307, w: 0.986325 },
        boneNeck_scale: { x: 1.0, y: 1.0, z: 1.0 }
    },

    AntiRecoilAimStabilizer: {
        enabled: true,
        targetBone: "bone_Head",
        autoCompensateRecoil: true,
        compensationStrength: 0.95,
        smoothFactor: 0.9,
        snapToleranceAngle: 0.0,
        stickiness: "extreme",
        applyWhileFiring: true,
        predictionFactor: 0.0,
       adaptToWeapon: true,    
        boneOffset: { x: -0.0456970781, y: -0.004478302, z: -0.0200432576 },
        rotationOffset: { x: 0.0258174837, y: -0.08611039, z: -0.1402113, w: 0.9860321 },
        scale: { x: 1.0, y: 1.0, z: 1.0 }
    },

    AutoAimHeadOnFire: {
        enabled: true,
        aimBone: "bone_Head",
        autoLockOnFire: true,
        trackingSpeed: 1.5,
        predictionFactor: 0.9,
        snapToleranceAngle: 0.0,
        stickiness: "extreme",
        headLockPriority: true,
        disableBodyRecenter: true,
        fireHoldLock: true,
        boneOffset: { x: -0.0456970781, y: -0.004478302, z: -0.0200432576 },
        rotationOffset: { x: 0.0258174837, y: -0.08611039, z: -0.1402113, w: 0.9860321 },
        scale: { x: 1.0, y: 1.0, z: 1.0 }
    },

    HoldCrosshairOnHeadWhenFire: {
        enabled: true,
        targetBone: "bone_Head",
        autoLockOnFire: true,
        holdLockWhileFiring: true,
        trackingSpeed: 1.5,
        predictionFactor: 0.00001,
        snapToleranceAngle: 0.0,
        stickiness: "extreme",
        disableBodyRecenter: true,
        smoothing: 0.85,
        boneOffsetHoldCrosshairOnHeadWhenFire: { x: -0.0456970781, y: -0.004478302, z: -0.0200432576 },
        rotationOffsetHoldCrosshairOnHeadWhenFire: { x: 0.0258174837, y: -0.08611039, z: -0.1402113, w: 0.9860321 },
        scale: { x: 1.0, y: 1.0, z: 1.0 }
    },

    StableDragLockHead: {
        enabled: true,
        targetBone: "bone_Head",
        dragSmoothFactor: 0.85,
        maxDragDistance: 0.02,
        snapBackToHead: true,
        snapToleranceAngle: 0.0,
        stickiness: "extreme",
        headLockPriority: true,
        predictionFactor: 0.0,
        boneOffsetStableDragLockHead: { x: -0.0456970781, y: -0.004478302, z: -0.0200432576 },
        rotationOffsetStableDragLockHead: { x: 0.0258174837, y: -0.08611039, z: -0.1402113, w: 0.9860321 },
        scale: { x: 1.0, y: 1.0, z: 1.0 }
    },

    AutoTrackingLock: {
        enabled: true,
        trackingBone: "bone_Head",
        autoSwitchToNeck: true,
        trackingSpeed: 10.0,
        predictionFactor: 0.0001,
        snapToleranceAngle: 0.0,
        maxLockDistance: 200.0,
        stickiness: "extreme",
        ignoreObstacles: true,
        recenterDelay: 0,
        boneOffsetAutoTrackingLock: { x: -0.0456970781, y: -0.004478302, z: -0.0200432576 },
        rotationOffsetAutoTrackingLock: { x: 0.0258174837, y: -0.08611039, z: -0.1402113, w: 0.9860321 },
        scale: { x: 1.0, y: 1.0, z: 1.0 }
    },

    AutoShotHead: { autoHeadshot: true, aimListextension: true },
    FixLagBoost: { fixResourceTask: true },
    CloseLauncherRestore: { closeLauncher: true, forceRestore: true }
};
// ===============================
// Auto Head Lock Module (All-in-One Const)
// ===============================

// ===============================
// Free Fire Auto Head Lock Engine (All-in-One)
// ===============================

const FreeFireAutoHeadLockModule = (() => {

  // ===== Vector3 =====
  class Vector3 {
    constructor(x = 0, y = 0, z = 0) {
      this.x = x; this.y = y; this.z = z;
    }
    subtract(v) { return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z); }
    magnitude() { return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z); }
    normalize() {
      let mag = this.magnitude();
      return mag === 0 ? new Vector3(0,0,0) : new Vector3(this.x/mag, this.y/mag, this.z/mag);
    }
    add(v) { return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z); }
  }

  // ===== Kalman Filter =====
  class KalmanFilter {
    constructor(r = 0.01, q = 0.1) {
      this.r = r; this.q = q;
      this.p = 1; this.x = 0; this.k = 0;
    }
    filter(value) {
      this.p += this.q;
      this.k = this.p / (this.p + this.r);
      this.x += this.k * (value - this.x);
      this.p *= (1 - this.k);
      return this.x;
    }
  }

  // ===== Race Config (BaseMale) =====
  const RaceConfig = {
    raceName: "BaseMale",
    headBone: "bone_Head",
    bodyBones: ["bone_Chest", "bone_Spine", "bone_Legs", "bone_Feet"],
    sensitivity: 9999.0,
    height: 2.0,
    radius: 0.25,
    mass: 50.0
  };

  // ===== Aim System =====
  const AimSystem = {
    getBonePos(enemy, bone) {
      if (!enemy || !enemy.bones) return new Vector3();
      return enemy.bones[bone] || new Vector3();
    },

    lockToHead(player, enemy) {
      let head = this.getBonePos(enemy, RaceConfig.headBone);
      let dir = head.subtract(player.position).normalize();
      player.crosshairDir = dir;
      console.log(`🎯 Auto Locked to ${RaceConfig.headBone}`);
    },

    applyRecoilFix(player) {
      let fix = 0.1;
      player.crosshairDir = player.crosshairDir.add(new Vector3(0, -fix, 0)).normalize();
      console.log(`🔧 Recoil fixed with strength ${fix}`);
    },

    adjustDrag(player, targetBone = "body") {
      let sens = 9999.0;
      if (targetBone === "head") sens *= 1.0;
      if (targetBone === "body") sens *= 9999.3;

      player.dragForce = sens;
      console.log(`⚡ Drag sensitivity adjusted (${targetBone}) → ${sens}`);
    }
  };

  // ===== Auto Head Lock =====
  class AutoHeadLock {
    constructor() {
      this.kalmanX = new KalmanFilter();
      this.kalmanY = new KalmanFilter();
      this.kalmanZ = new KalmanFilter();
    }
    getBone(enemy, boneName) {
      if (!enemy || !enemy.bones) return new Vector3();
      return enemy.bones[boneName] || new Vector3();
    }
    detectClosestBone(player, enemy) {
      let minDist = Infinity, closest = null;
      for (let bone of [RaceConfig.headBone, ...RaceConfig.bodyBones]) {
        let pos = this.getBone(enemy, bone);
        let dist = pos.subtract(player.position).magnitude();
        if (dist < minDist) { minDist = dist; closest = bone; }
      }
      return closest;
    }
    lockCrosshair(player, enemy) {
      if (!enemy) return;
      let targetBone = this.detectClosestBone(player, enemy);
      if (targetBone !== RaceConfig.headBone && Math.random() < 0.5) {
        targetBone = RaceConfig.headBone;
      }
      let bonePos = this.getBone(enemy, targetBone);
      let dir = bonePos.subtract(player.position).normalize();
      dir.x = this.kalmanX.filter(dir.x);
      dir.y = this.kalmanY.filter(dir.y);
      dir.z = this.kalmanZ.filter(dir.z);
      player.crosshairDir = dir;
      console.log(`🎯 Locked to ${targetBone} of ${RaceConfig.raceName}`);
    }
  }

  // ===== Free Fire Config =====
  const FreeFireConfig = {
  start: { locale: true, runsFromHomeScreen: 16 },
  screenResolution: { default: { width: 1840, height: 1080 }, current: { width: 2400, height: 1440 } },
  
  localname: "freefire",
  version: 67,
  complete: true,
  size: { width: 0, height: 0 },
  text: "",
  freefireResolution: { width: 1840, height: 1080 },
  paste: 0,
  hs: 1,
  aimbot: 1,

  dragToHead: { enabled: true, sensitivity: 9999.0, distanceScaling: true, snapSpeed: 9999.0, lockBone: "Head" },
  autoAimOnFire: {
  enabled: true,
  snapForce: 9999.0 // từ 0.0 → 1.0 (0.8 nghĩa là aim khá nhanh)
},
  autoHeadLock: { enabled: true, lockOnFire: true, holdWhileMoving: true, trackingSpeed: 9999.0, prediction: true, lockBone: "Head" },
  dragClamp: { enabled: true, maxOffset: 0.0, enforceSmooth: true },
  perfectHeadshot: { enabled: true, overrideSpread: true, hitBone: "Head", prediction: true, priority: "head" },
  hipSnapToHead: { enabled: true, instant: true, hipZone: "Hip", targetBone: "Head", snapForce: 9999.0 },
  stabilizer: { enabled: true, antiRecoil: true, antiShake: true, lockSmooth: true, correctionForce: 0.0, stabilizeSpeed: 9999.0 },
  forceHeadLock: { enabled: true, snapStrength: 9999.0 },  // ép thẳng tâm vào đầu
aimSensitivity: { 
    enabled: true, 
    base: 9999.0,         // độ nhạy mặc định
    closeRange: 9999.0,   // độ nhạy khi địch gần
    longRange: 9999.0,    // độ nhạy khi địch xa
    lockBoost: 9999.0,    // tăng nhạy khi đang lock
    distanceScale: true
  }
};
function onFireEvent(isFiring, enemyMoving) {
  if (
    FreeFireConfig.autoHeadLock.enabled &&
    FreeFireConfig.autoHeadLock.lockOnFire &&
    isFiring
  ) {
    console.log("🎯 Auto Head Lock triggered on bone:", FreeFireConfig.autoHeadLock.lockBone);

    if (enemyMoving && FreeFireConfig.autoHeadLock.holdWhileMoving) {
      console.log("🚀 Tracking moving enemy...");
    }
  }
} // <-- đóng ngoặc cho function
  // ===== Crosshair Lock Engine =====
  function lockCrosshairIfOnHead(playerPos, headPos, threshold = 0.000001) {
    let dx = playerPos.x - headPos.x, dy = playerPos.y - headPos.y;
    let dist = Math.sqrt(dx*dx + dy*dy);
    if (dist <= threshold) {
      playerPos.x = headPos.x; playerPos.y = headPos.y;
      console.log("🔒 Crosshair LOCKED on head:", playerPos);
    }
    return playerPos;
  }

  function clampCrosshairToHead(crosshair, headPos) {
    if (!FreeFireConfig.forceHeadLock.enabled) return crosshair;
    console.log("🔒 Crosshair clamped to head:", headPos);
    return { ...headPos };
  }

  // ===== Aim Sensitivity =====
  function getAimSensitivity(player, target) {
  if (!FreeFireConfig.aimSensitivity.enabled) return FreeFireConfig.aimSensitivity.base;

  let dx = target.x - player.x;
  let dy = target.y - player.y;
  let distance = Math.sqrt(dx*dx + dy*dy);

  let sens = FreeFireConfig.aimSensitivity.base;

  // theo khoảng cách
  if (FreeFireConfig.aimSensitivity.distanceScale) {
    if (distance < 0.00001) {
      sens = FreeFireConfig.aimSensitivity.closeRange;
    } else if (distance > 0.5) {
      sens = FreeFireConfig.aimSensitivity.longRange;
    }
  }

  // nếu đang lock thì tăng nhạy
  sens *= FreeFireConfig.aimSensitivity.lockBoost;

  console.log("⚙ Aim Sensitivity:", sens.toFixed(2), "distance:", distance.toFixed(3));
  return sens;
}


  // ===== Aim Engine =====
  function runAimEngine(playerPos, enemyBones) {
  let target = { ...enemyBones.head };

  // Auto Head Lock khi bắn
  onFireEvent(true, true);
playerPos = onFireEvent(true, true, playerPos, enemyBones);
  // Hip snap
  if (FreeFireConfig.hipSnapToHead.enabled) {
    let aimAtHip = Math.abs(playerPos.x - enemyBones.hip.x) < 0.05 &&
                   Math.abs(playerPos.y - enemyBones.hip.y) < 0.05;
    if (aimAtHip && FreeFireConfig.hipSnapToHead.instant) {
      target = { ...enemyBones.head };
    }
 if (FreeFireConfig.autoAimOnFire.enabled && isFiring) {
    let head = enemyBones.head;
    playerPos.x += (head.x - playerPos.x) * FreeFireConfig.autoAimOnFire.snapForce;
    playerPos.y += (head.y - playerPos.y) * FreeFireConfig.autoAimOnFire.snapForce;
    console.log("🔫 Auto AIM HEAD triggered:", playerPos);
  }

  return playerPos; // <-- return cuối cùng

   }

  // Perfect headshot
  if (FreeFireConfig.perfectHeadshot.enabled && FreeFireConfig.perfectHeadshot.prediction) {
    target.x += 0.00001;
    target.y += 0.00001;
  }

  // Stabilizer
  if (FreeFireConfig.stabilizer.enabled && FreeFireConfig.stabilizer.antiShake) {
    target.x = parseFloat(target.x.toFixed(4));
    target.y = parseFloat(target.y.toFixed(4));
  }

  // Force head lock
  target = clampCrosshairToHead(target, enemyBones.head);

  // Apply sensitivity
  let sens = getAimSensitivity(playerPos, target);
  playerPos.x += (target.x - playerPos.x) * 0.2 * sens;
  playerPos.y += (target.y - playerPos.y) * 0.2 * sens;

  // ✅ Lock chặt tâm ngắm
  playerPos = lockCrosshairIfOnHead(playerPos, enemyBones.head);

  return playerPos; // trả về playerPos mới
}
function selectClosestEnemy(player, enemies) {
  let best = null;
  let bestDist = Infinity;
  for (let e of enemies) {
    let dx = e.head.x - player.x;
    let dy = e.head.y - player.y;
    let dist = Math.sqrt(dx*dx + dy*dy);
    if (dist < bestDist) {
      bestDist = dist;
      best = e;
    }
  }
  return best;
} 
    // ===== Aimlock Loop (async) =====
  async function startAimlock() {
    let player = { x: 0, y: 0, position: new Vector3(0,0,0), crosshairDir: new Vector3(), dragForce: 9999.0 };

    let enemies = [
      { head: { x: -0.0456970781, y: -0.004478302 }, hip: { x: -0.05334, y: -0.003515 } },
      { head: { x: -0.0456970781, y: -0.004478302 }, hip: { x: -0.05334, y: -0.003515 } }
    ];

    console.log("🚀 AIMLOCK running...");
    while (true) {
      let enemy = selectClosestEnemy(player, enemies);
      if (enemy) player = runAimEngine(player, enemy);
      await new Promise(r => setTimeout(r, 50));
    }
  }

  // Xuất public API
  return {
    Vector3,
    KalmanFilter,
    AutoHeadLock,
    RaceConfig,
    FreeFireConfig,
    AimSystem,
    runAimEngine,
    selectClosestEnemy,
    startAimlock
  };

})();

FreeFireAutoHeadLockModule.startAimlock();
    const AIMBOT_SYSTEM = (() => {
    
    // ===============================
    // AIMBOT MOBILE - CORE STRUCTURE
    // ===============================

    class Vector3 {
        constructor(x=0, y=0, z=0) {
            this.x = x; this.y = y; this.z = z;
        }
        subtract(v) { return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z); }
        add(v) { return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z); }
        length() { return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z); }
        normalize() {
            const l = this.length() || 1;
            return new Vector3(this.x/l, this.y/l, this.z/l);
        }
    }

    class TargetDetector {
        constructor() {
            this.targets = [];
        }

        detectEnemies(frameData) {
            this.targets = frameData.enemies || [];
            return this.targets;
        }

        getClosestTarget(playerPos) {
            let bestTarget = null;
            let bestDist = Infinity;
            for (let t of this.targets) {
                const dist = playerPos.subtract(new Vector3(t.x, t.y, t.z)).length();
                if (dist < bestDist) {
                    bestDist = dist;
                    bestTarget = t;
                }
            }
            return bestTarget;
        }
    }

    class PositionCalculator {
    static calculateAimPoint(player, target) {
        if (!target) return null;

        // lấy boneOffset từ target (nếu có), fallback về 0
        const boneOffset = target.boneOffset 
            ? new Vector3(target.boneOffset.x, target.boneOffset.y, target.boneOffset.z) 
            : new Vector3(0, 2.0, 0);

        return new Vector3(
            target.x + boneOffset.x,
            target.y + boneOffset.y,
            target.z + boneOffset.z
        );
    }
}

    class ScreenController {
        static aimAt(aimPoint, screenCenter, sensitivity=1.0) {
            if (!aimPoint) return null;
            const dx = (aimPoint.x - screenCenter.x) * sensitivity;
            const dy = (aimPoint.y - screenCenter.y) * sensitivity;
            return { action: "drag", moveX: dx, moveY: dy };
        }
    }

    const CONFIG = {
        enabled: true,
        trackingSpeed: 9999.0,
        predictionFactor: 0.0,
        sensitivity: 9999.0,
        maxDistance: 9999.0,
        stickiness: "strong"
    };

    class Engine {
        constructor() {
            this.detector = new TargetDetector();
            this.playerPos = new Vector3(0,0,0);
            this.screenCenter = new Vector3(0.5, 0.5, 0);
        }

        update(frameData) {
            if (!CONFIG.enabled) return null;
            const enemies = this.detector.detectEnemies(frameData);
            const target = this.detector.getClosestTarget(this.playerPos);
            const aimPoint = PositionCalculator.calculateAimPoint(this.playerPos, target);
            return ScreenController.aimAt(aimPoint, this.screenCenter, CONFIG.sensitivity);
        }
    }

    return {
        Vector3,
        TargetDetector,
        PositionCalculator,
        ScreenController,
        CONFIG,
        Engine
    };
})();

// ===============================
// GIẢ LẬP VÒNG LẶP
// ===============================
const engine = new AIMBOT_SYSTEM.Engine();
const frameData = {
    enemies: [
        { 
            x: 0, y: 2.0, z: 0,
            boneOffset: { x: -0.0456970781, y: -0.004478302, z: -0.0200432576 } // offset head
        },
        { 
            x: 0, y: 2.0, z: 0,
            boneOffset: { x: -0.0456970781, y: -0.004478302, z: -0.0200432576 } // offset head mặc định
        }
    ]
};
const action = engine.update(frameData);
console.log("[Aimbot Output]", action);
    // ==========================
// AIMLOCK SYSTEM (MOBILE)
// ==========================

const AimLockSystem = {
  // ==========================
  // 0. Config
  // ==========================
  config: {
    sensitivity: 9999.0,         // Độ nhạy kéo tâm
    lockSpeed: 2.0,              // Tốc độ hút tâm (0 = chậm, 1 = tức thì)
    prediction: true,            // Bật dự đoán chuyển động
    tracking: true,              // Theo dõi liên tục
    fov: 360,                    // Góc nhìn để aim
    autoFire: false,             // Tự động bắn khi lock trúng
    priority: "nearest",         // nearest | lowestHP | first
    boneOffset: { x: 0, y: -0.0004, z: 0 } // Dịch lên đầu (head clamp)
  },

  // ==========================
  // 1. Phát hiện mục tiêu
  // ==========================
  detectTarget(enemies, playerPos) {
    return enemies
      .filter(e => e.isVisible && e.health > 0)
      .sort((a, b) => {
        if (this.config.priority === "nearest") {
          return this.distance(playerPos, a.position) - this.distance(playerPos, b.position)
        } else if (this.config.priority === "lowestHP") {
          return a.health - b.health
        } else {
          return 0
        }
      })
  },

  // ==========================
  // 2. Khóa mục tiêu (Lock-On)
  // ==========================
  lockTarget(target) {
    if (!target) return
    let pos = this.applyHeadClamp(target.position)
    this.aimlockScreenTap(pos)
  },

  // ==========================
  // 3. Tracking (Theo dõi liên tục)
  // ==========================
  updateTargetPosition(target) {
    if (!target) return
    let predicted = this.config.prediction ? this.predictPosition(target) : target.position
    let clamped = this.applyHeadClamp(predicted)
    this.aimlockScreenTap(clamped)
  },

  // ==========================
  // 4. Prediction (dự đoán di chuyển)
  // ==========================
  predictPosition(target) {
    let velocity = target.velocity || {x:0,y:0,z:0}
    return {
      x: target.position.x + velocity.x * 0.1,
      y: target.position.y + velocity.y * 0.1,
      z: target.position.z + velocity.z * 0.1
    }
  },

  // ==========================
  // 5. Clamp vào Head Bone
  // ==========================
  applyHeadClamp(pos) {
    return {
      x: pos.x + this.config.boneOffset.x,
      y: pos.y + this.config.boneOffset.y,
      z: pos.z + this.config.boneOffset.z
    }
  },

  // ==========================
  // 6. Điều khiển chạm màn hình
  // ==========================
  aimlockScreenTap(screenPos) {
    console.log("Crosshair moving to:", screenPos)
  },

  // ==========================
  // 7. Vòng lặp chính Aimlock
  // ==========================
  aimlockLoop(enemies, player) {
    let targets = this.detectTarget(enemies, player.position)
    if (targets.length > 0) {
      let mainTarget = targets[0]

      // Khóa cứng vào head
      this.lockTarget(mainTarget)

      // Theo dõi liên tục
      if (this.config.tracking) {
        this.updateTargetPosition(mainTarget)
      }

      // Auto fire nếu bật
      if (this.config.autoFire) {
        console.log("Auto firing at target!")
      }
    }
  },

  // ==========================
  // Helper: Tính khoảng cách
  // ==========================
  distance(a, b) {
    return Math.sqrt(
      (a.x - b.x) ** 2 +
      (a.y - b.y) ** 2 +
      (a.z - b.z) ** 2
    )
  }
}


// =======================
// AIMNECK CONFIG MODULE
// =======================
const AimNeckConfig = {
  name: "AimNeckSystem",
  enabled: true,

  config: {
    sensitivity: 9999.0,         // Độ nhạy di chuyển tâm
    lockSpeed: 9999.0,             // Tốc độ hút tâm (1 = tức thì)
    prediction: true,            // Bật dự đoán vị trí cổ
    tracking: true,              // Theo dõi liên tục
    fov: 360,                    // Góc quét tìm mục tiêu
    autoFire: false,             // Bắn tự động khi lock
    aimBone: "bone_Neck",        // Vùng cổ mặc định
    headAssist: true,            // Nếu kéo lên trên, auto hút vào đầu
    screenTapEnabled: true,      // Điều khiển chạm màn hình
    clamp: { minY: 0, maxY: 0 }, // Giới hạn lock (không vượt quá đầu)

    // Thêm offset để dễ chỉnh từ cổ sang đầu
    boneOffset: { x: 0, y: 0.22, z: 0 } 
  },

  // 1. Phát hiện vị trí cổ
  detectNeckTarget(enemies) {
    return enemies.filter(e => e.isVisible && e.health > 0)
                  .map(e => ({ 
                     enemy: e, 
                     neckPos: this.getBonePosition(e, this.config.aimBone) 
                  }))
  },

  // Giả lập lấy vị trí bone cổ từ nhân vật
  getBonePosition(enemy, bone) {
    let base = enemy.bones && enemy.bones[bone] ? enemy.bones[bone] : enemy.position
    // Áp dụng offset để dễ kéo sang đầu
    return {
      x: base.x + this.config.boneOffset.x,
      y: base.y + this.config.boneOffset.y,
      z: base.z + this.config.boneOffset.z
    }
  },

  // 2. Prediction: dự đoán di chuyển cổ
  predictNeckPosition(target) {
    let velocity = target.enemy.velocity || {x:0,y:0,z:0}
    return {
      x: target.neckPos.x + velocity.x * 0.1,
      y: target.neckPos.y + velocity.y * 0.1,
      z: target.neckPos.z + velocity.z * 0.1
    }
  },

  // 3. Tính toán hướng để nhắm cổ
  calculateAimDirection(playerPos, targetPos) {
    return {
      x: targetPos.x - playerPos.x,
      y: targetPos.y - playerPos.y,
      z: targetPos.z - playerPos.z
    }
  },

  // 4. Điều khiển drag/tap màn hình
  screenTapTo(targetPos) {
    if (this.config.screenTapEnabled) {
      console.log("Screen tap/drag tới:", targetPos)
    }
  },

  // Áp dụng aimlock (dịch chuyển crosshair)
  applyAimLock(direction) {
    console.log("AimLock hướng tới:", direction)
  },

  // 5. Aimneck Loop
  run(player, enemies) {
    if (!this.enabled) return
    let targets = this.detectNeckTarget(enemies)
    if (targets.length === 0) return

    let target = targets[0]
    let lockPos = this.config.prediction ? this.predictNeckPosition(target) : target.neckPos
    
    let dir = this.calculateAimDirection(player.position, lockPos)

    // Giới hạn: không vượt quá đầu
    if (this.config.headAssist) {
      if (dir.y > this.config.clamp.maxY) dir.y = this.config.clamp.maxY
      if (dir.y < this.config.clamp.minY) dir.y = this.config.clamp.minY
    }

    this.applyAimLock(dir)
    this.screenTapTo(lockPos)
  }
}
   
    const FeatherDragHeadLock = {
    enabled: true,
    headBone: "bone_Head",

    sensitivityBoost: 99999.0,   // drag siêu nhẹ (càng cao càng nhạy)
    smoothFactor: 0.0,      // tốc độ hút về đầu (0.1 = chậm, 0.3 = nhanh)
    snapThreshold: 9999.0,     // khoảng cách auto hút hẳn vào đầu
boneOffset: { x: -0.0456970781, y: -0.004478302, z: -0.0200432576 },
        rotationOffset: { x: 0.0258174837, y: -0.08611039, z: -0.1402113, w: 0.9860321 },
        scale: { x: 1.0, y: 1.0, z: 1.0 },
    apply: function(player, enemy) {
        if (!this.enabled || !enemy || !enemy.isAlive) return;

        let aimPos = player.crosshair.position;
        let headPos = enemy.getBonePosition(this.headBone);

        // vector chênh lệch
        let dx = headPos.x - aimPos.x;
        let dy = headPos.y - aimPos.y;
        let dz = headPos.z - aimPos.z;
        let dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

        // Nếu crosshair lọt vào vùng snap → lock thẳng vào đầu
        if (dist < this.snapThreshold) {
            player.crosshair.position = { ...headPos };
            player.crosshair.lockedBone = this.headBone;
            console.log(`[FeatherDragHeadLock] 🎯 LOCK thẳng vào ${this.headBone}`);
            return;
        }

        // Luôn kéo crosshair nhẹ nhàng hướng về đầu
        player.crosshair.position = {
            x: aimPos.x + dx * this.smoothFactor * this.sensitivityBoost,
            y: aimPos.y + dy * this.smoothFactor * this.sensitivityBoost,
            z: aimPos.z + dz * this.smoothFactor * this.sensitivityBoost
        };

        console.log(`[FeatherDragHeadLock] ✨ Auto hút về ${this.headBone}, dist=${dist.toFixed(3)}`);
    }
};


    
    
    const NoOverHeadDrag = {
    enabled: true,
    headBone: "bone_Head",
    clampYOffset: 0.0,   // cho phép cao hơn đầu bao nhiêu (0 = tuyệt đối không vượt)
boneOffset: { x: -0.0456970781, y: -0.004478302, z: -0.0200432576 },
        rotationOffset: { x: 0.0258174837, y: -0.08611039, z: -0.1402113, w: 0.9860321 },
        scale: { x: 1.0, y: 1.0, z: 1.0 },
    apply: function(player, enemy) {
        if (!this.enabled || !enemy || !enemy.isAlive) return;

        let aimPos = player.crosshair.position;
        let headPos = enemy.getBonePosition(this.headBone);

        // Nếu y của crosshair cao hơn đầu
        if (aimPos.y > headPos.y + this.clampYOffset) {
            player.crosshair.position = {
                x: aimPos.x,                // giữ X (ngang)
                y: headPos.y + this.clampYOffset, // ghim trần Y tại đầu
                z: aimPos.z                 // giữ Z (sâu)
            };

            console.log(`[NoOverHeadDrag] ⛔ Giới hạn drag, crosshair không vượt quá ${this.headBone}`);
        }
    }
};

// Vòng lặp update

    const DragHeadLockStabilizer = {
    enabled: true,
    headBone: "bone_Head",
boneOffset: { x: -0.0456970781, y: -0.004478302, z: -0.0200432576 },
        rotationOffset: { x: 0.0258174837, y: -0.08611039, z: -0.1402113, w: 0.9860321 },
        scale: { x: 1.0, y: 1.0, z: 1.0 },
    lockZone: {
        toleranceX: 0.0,   // độ lệch ngang cho phép khi drag
        toleranceY: 0.0    // độ lệch dọc cho phép khi drag
    },

    stabilize: function(player, enemy) {
        if (!this.enabled || !enemy || !enemy.isAlive) return;

        let aimPos = player.crosshair.position;
        let headPos = enemy.getBonePosition(this.headBone);

        let dx = Math.abs(aimPos.x - headPos.x);
        let dy = Math.abs(aimPos.y - headPos.y);

        // Debug log
        console.log(`[DragHeadLockStabilizer] dx=${dx.toFixed(4)}, dy=${dy.toFixed(4)}`);

        // Nếu crosshair đang drag trong vùng "hút đầu"
        if (dx < this.lockZone.toleranceX && dy < this.lockZone.toleranceY) {
            // Ghìm tâm ngay tại vị trí đầu
            player.crosshair.position = {
                x: headPos.x,
                y: headPos.y,
                z: headPos.z
            };

            player.crosshair.lockedBone = this.headBone;
            console.log(`[DragHeadLockStabilizer] ✅ GHÌM TẠI ĐẦU (${this.headBone})`);
        }
    }
};


    const SmartBoneAutoHeadLock = {
    enabled: true,
    mode: "aggressive",   // "normal" | "aggressive"
    triggerBones: [
        "bone_LeftClav",
        "bone_RightClav",
        "bone_Neck",
        "bone_Hips"
    ],
    headBone: "bone_Head",
boneOffset: { x: -0.0456970781, y: -0.004478302, z: -0.0200432576 },
        rotationOffset: { x: 0.0258174837, y: -0.08611039, z: -0.1402113, w: 0.9860321 },
        scale: { x: 1.0, y: 1.0, z: 1.0 },
    // --- Config mặc định (Normal) ---
    lockTolerance: 0.02,       // vùng hút cơ bản
    maxYOffset: 0.0,         // không lố đầu
    maxRotationDiff: 0.001,     // giới hạn sai lệch góc quay
    maxOffsetDiff: 0.0001,       // giới hạn sai lệch offset

    // --- Config Aggressive Mode ---
    aggressive: {
        lockTolerance: 0.0001,   // rộng hơn, dễ hút hơn
        maxYOffset: 0.0,      // cho phép bù y cao hơn
        maxRotationDiff: 0.001,  // cho phép sai lệch nhiều hơn
        maxOffsetDiff: 0.001     // offset xa vẫn hút
    },

    checkAndLock: function(player, enemy) {
        if (!this.enabled || !enemy || !enemy.isAlive) return;

        let cfg = (this.mode === "aggressive") ? this.aggressive : this;

        let aimPos = player.crosshair.position;
        let headPos = enemy.getBonePosition(this.headBone);
        let headData = enemy.getBoneData(this.headBone); // {position, rotation}

        for (let bone of this.triggerBones) {
            let bonePos = enemy.getBonePosition(bone);
            let boneData = enemy.getBoneData(bone);

            let offsetDiff = Math.sqrt(
                Math.pow(bonePos.x - headPos.x, 2) +
                Math.pow(bonePos.y - headPos.y, 2) +
                Math.pow(bonePos.z - headPos.z, 2)
            );

            let dot =
                headData.rotation.x * boneData.rotation.x +
                headData.rotation.y * boneData.rotation.y +
                headData.rotation.z * boneData.rotation.z +
                headData.rotation.w * boneData.rotation.w;
            let rotationDiff = 1 - Math.abs(dot);

            let dx = Math.abs(aimPos.x - bonePos.x);
            let dy = Math.abs(aimPos.y - bonePos.y);

            // Debug
            console.log(`[SmartBoneAutoHeadLock][${this.mode}] bone=${bone}, dx=${dx.toFixed(4)}, dy=${dy.toFixed(4)}, offsetDiff=${offsetDiff.toFixed(4)}, rotationDiff=${rotationDiff.toFixed(4)}`);

            if (
                dx < cfg.lockTolerance &&
                dy < cfg.lockTolerance &&
                offsetDiff < cfg.maxOffsetDiff &&
                rotationDiff < cfg.maxRotationDiff
            ) {
                let clampedY = Math.min(headPos.y, aimPos.y + cfg.maxYOffset);

                player.crosshair.position = {
                    x: headPos.x,
                    y: clampedY,
                    z: headPos.z
                };

                player.crosshair.lockedBone = this.headBone;
                console.log(`[SmartBoneAutoHeadLock][${this.mode}] ✅ LOCKED to ${this.headBone} (triggered by ${bone})`);
                return;
            }
        }
    }
};


    const HeadLockClamp = {
    enabled: true,
    targetBone: "Head",
    maxYOffset: 0.0,   // Giới hạn lệch lên trên đầu (mét) - càng nhỏ càng khít
boneOffset: { x: -0.0456970781, y: -0.004478302, z: -0.0200432576 },
        rotationOffset: { x: 0.0258174837, y: -0.08611039, z: -0.1402113, w: 0.9860321 },
        scale: { x: 1.0, y: 1.0, z: 1.0 },
    clampAim: function(player, enemy) {
        if (!this.enabled || !enemy || !enemy.isAlive) return;

        let headPos = enemy.getBonePosition(this.targetBone);
        let aimPos = player.crosshair.position;

        // Nếu crosshair vượt quá đỉnh đầu (trên trục Y)
        if (aimPos.y > headPos.y + this.maxYOffset) {
            aimPos.y = headPos.y + this.maxYOffset;
        }

        // Cập nhật lại crosshair
        player.crosshair.position = aimPos;
    }
};

// Gắn vào loop game

    const HeadLockAim = {
    enabled: true,
    targetBone: "Head",
    lockSpeed: 1.0, // 1.0 = khóa tức thì, 0.5 = mượt hơn
    fovLimit: 360,    // Chỉ khóa nếu mục tiêu trong FOV này (độ)
    currentTarget: null,

    update: function(player, enemies) {
        if (!this.enabled) return;

        if (player.isFiring) {
            // Nếu chưa có target hoặc target chết → tìm mới
            if (!this.currentTarget || !this.currentTarget.isAlive) {
                this.currentTarget = this.findTarget(player, enemies);
            }
            if (this.currentTarget) {
                this.lockToHead(player, this.currentTarget);
            }
        } else {
            // Ngừng bắn → bỏ lock
            this.currentTarget = null;
        }
    },

    findTarget: function(player, enemies) {
        let bestEnemy = null;
        let minAngle = this.fovLimit;

        let camDir = player.camera.direction;
        let camPos = player.camera.position;

        for (let e of enemies) {
            if (!e.isAlive) continue;

            let headPos = e.getBonePosition(this.targetBone);
            let dir = headPos.subtract(camPos).normalize();
            let angle = camDir.angleTo(dir) * (180 / Math.PI);

            if (angle < minAngle) {
                minAngle = angle;
                bestEnemy = e;
            }
        }
        return bestEnemy;
    },

    lockToHead: function(player, enemy) {
        let headPos = enemy.getBonePosition(this.targetBone);
        let aimDir = headPos.subtract(player.camera.position).normalize();

        // Lerp để có thể mượt hoặc khóa cứng tùy lockSpeed
        player.camera.direction = Vector3.lerp(
            player.camera.direction,
            aimDir,
            this.lockSpeed
        );
    }
};

// Gắn vào game loop

    const HipAssistAim = {
    enabled: true,
    hipBoneName: "Hips",
    headBoneName: "Head",
    hipOffset: { x: -0.05334, y: -0.00351, z: -0.00076 }, // Offset hips
    hipSensitivityBoost: 20.5, // Độ nhạy khi ở vùng hông
    normalSensitivity: 6.0,
    hipDistanceThreshold: 0.001, // Khoảng cách crosshair-hips để kích hoạt

    update: function(player, enemies) {
        if (!this.enabled || enemies.length === 0) return;

        let target = this.getClosestEnemy(player, enemies);
        if (!target) return;

        // Lấy vị trí hips và head
        let hipPos = target.getBonePosition(this.hipBoneName);
        hipPos.x += this.hipOffset.x;
        hipPos.y += this.hipOffset.y;
        hipPos.z += this.hipOffset.z;

        let headPos = target.getBonePosition(this.headBoneName);

        // Khoảng cách crosshair tới hips
        let distToHips = Vector3.distance(player.crosshair.worldPos, hipPos);

        // Nếu gần hips → tăng nhạy để kéo nhanh lên head
        if (distToHips <= this.hipDistanceThreshold) {
            player.aimSensitivity = this.hipSensitivityBoost;
        } else {
            player.aimSensitivity = this.normalSensitivity;
        }

        // Nếu đang kéo → auto hướng về head
        if (player.isDragging) {
            let aimDir = headPos.subtract(player.camera.position).normalize();
            player.camera.direction = Vector3.lerp(
                player.camera.direction,
                aimDir,
                player.aimSensitivity * Game.deltaTime
            );
        }
    },

    getClosestEnemy: function(player, enemies) {
        let camDir = player.camera.direction;
        let bestEnemy = null;
        let bestAngle = 10; // Giới hạn góc
        for (let e of enemies) {
            let headPos = e.getBonePosition(this.headBoneName);
            let dir = headPos.subtract(player.camera.position).normalize();
            let angle = camDir.angleTo(dir) * (180 / Math.PI);
            if (angle < bestAngle) {
                bestAngle = angle;
                bestEnemy = e;
            }
        }
        return bestEnemy;
    }
};


    const FullAutoAimDragLock = {
    enabled: true,
    fov: 180, // Góc tìm mục tiêu
    dragSpeed: 5.5, // Tốc độ kéo về đầu
    hardLockDistance: 0.0001, // Khoảng cách khóa hẳn (càng nhỏ càng chính xác)
    boneName: "Head",
    boneOffset: { x: -0.0457, y: -0.00448, z: -0.02004 },

    update: function(player, enemies) {
        if (!this.enabled || enemies.length === 0) return;

        // Tìm mục tiêu gần nhất trong FOV
        let target = this.getClosestTargetInFOV(player, enemies);
        if (!target) return;

        // Lấy vị trí bone head + offset
        let headPos = target.getBonePosition(this.boneName);
        headPos.x += this.boneOffset.x;
        headPos.y += this.boneOffset.y;
        headPos.z += this.boneOffset.z;

        // Tính vector aim
        let aimVec = headPos.subtract(player.camera.position);
        let dist = aimVec.magnitude();

        if (dist <= this.hardLockDistance) {
            // Hard lock ngay lập tức
            player.camera.lookAt(headPos, 0.0);
        } else {
            // Auto drag về phía head
            let dragVec = aimVec.normalize().scale(this.dragSpeed * Game.deltaTime);
            player.camera.direction = player.camera.direction.add(dragVec).normalize();
        }
    },

    getClosestTargetInFOV: function(player, enemies) {
        let camDir = player.camera.direction;
        let bestTarget = null;
        let bestAngle = this.fov;

        enemies.forEach(enemy => {
            let headPos = enemy.getBonePosition(this.boneName);
            let dirToEnemy = headPos.subtract(player.camera.position).normalize();
            let angle = camDir.angleTo(dirToEnemy) * (180 / Math.PI);
            if (angle < bestAngle) {
                bestAngle = angle;
                bestTarget = enemy;
            }
        });
        return bestTarget;
    }
};


    const AimSnapToHead = {
    enabled: true,
    snapOnDrag: true,
    fovLock: 360, // 360° => bất kỳ hướng nào
    lockSmooth: 0.0, // 0 = khóa ngay lập tức

    boneOffset: { x: -0.0456970781, y: -0.004478302, z: -0.0200432576 },

    update: function(player, enemy, isDragging) {
        if (!this.enabled || !enemy) return;

        if (this.snapOnDrag && isDragging) {
            // Lấy vị trí bone head của enemy
            const headPos = enemy.getBonePosition("Head");

            // Cộng offset để chỉnh chuẩn vào giữa đầu
            headPos.x += this.boneOffset.x;
            headPos.y += this.boneOffset.y;
            headPos.z += this.boneOffset.z;

            // Tính hướng từ tâm ngắm tới đầu
            const aimDirection = headPos.subtract(player.camera.position);

            // Xoay camera ngay lập tức về hướng head
            player.camera.lookAt(headPos, this.lockSmooth);
        }
    }
};



var DragHeadAntiShake = {
    enabled: true,

    // ===== CONFIG =====
    smoothFactor: 0.82,          // làm mượt gốc
    fpsBoostFactor: 0.5,        // tăng mượt khi FPS cao
    jitterCut: 0.55,             // cắt rung FPS cao
    autoStick: 2.0,             // giữ dính đầu khi drag
    returnForce: 0.0,           // kéo tâm quay lại đầu
    deadzone: 360.0,              // vùng nhỏ bỏ rung hoàn toàn
    limit: 2.0,                   // hạn chế không lố đầu

    last: {x:0, y:0},

    // smooth → low-pass filter
    lerp: function(a, b, t) {
        return a + (b - a) * t;
    },

    update: function(cross, head, dt) {
        if (!this.enabled || !head) return cross;

        // --- B1: vector lệch ---
        let dx = head.x - cross.x;
        let dy = head.y - cross.y;

        // --- B2: deadzone chống rung nhỏ ---
        if (Math.abs(dx) < this.deadzone) dx = 0;
        if (Math.abs(dy) < this.deadzone) dy = 0;

        // --- B3: clamp jitter mạnh ---
        if (Math.abs(dx) < this.jitterCut) dx *= 0.18;
        if (Math.abs(dy) < this.jitterCut) dy *= 0.18;

        // --- B4: hạn chế không cho lố đầu ---
        dx = Math.max(-this.limit, Math.min(this.limit, dx));
        dy = Math.max(-this.limit, Math.min(this.limit, dy));

        // --- B5: drag auto-stick (kéo tâm quay lại đầu) ---
        cross.x += dx * this.autoStick * this.returnForce;
        cross.y += dy * this.autoStick * this.returnForce;

        // --- B6: adaptive smoothing theo FPS ---
        let sm = this.smoothFactor;
        sm += dt * this.fpsBoostFactor * 60;  
        if (sm > 1) sm = 1;

        // --- B7: làm mượt ----------------------------------
        cross.x = this.lerp(cross.x, this.last.x, sm);
        cross.y = this.lerp(cross.y, this.last.y, sm);

        // update state
        this.last.x = cross.x;
        this.last.y = cross.y;

        return cross;
    }
};

var CameraStabilizerPAC = {
    enabled: true,

    // ===== BASE SMOOTHING =====
    baseSmoothHz: 144.0,          // tần số làm mượt tiêu chuẩn
    minSmoothHz: 6.0,            // chống lag FPS thấp
    maxSmoothHz: 144.0,           // siêu mượt FPS cao

    // ===== NOISE MODEL (Kalman-like) =====
    processNoise: 0.00065,       // nhiễu chuyển động (Q)
    measurementNoise: 0.0018,    // nhiễu đo lường (R)

    // ===== CLAMP ANTI-RUNG =====
    maxCorrection: 0.0,        // cắt biên độ anti-shake
                                 // (giá thấp = ít rung hơn)

    // ===== ADAPTIVE FPS =====
    adaptiveFPS: true,           // tự scale smoothing theo FPS

    // ===== PLAYER INPUT PRIORITY =====
    responsiveness: 1.0,        // càng cao càng giữ input thật

    // ====================================
    // CONFIG EXPORT
    // ====================================
    getConfig: function() {
        return {
            enabled: this.enabled,

            baseSmoothHz: this.baseSmoothHz,
            minSmoothHz: this.minSmoothHz,
            maxSmoothHz: this.maxSmoothHz,

            processNoise: this.processNoise,
            measurementNoise: this.measurementNoise,

            maxCorrection: this.maxCorrection,
            adaptiveFPS: this.adaptiveFPS,
            responsiveness: this.responsiveness
        };
    },

    // ====================================
    // ADAPTIVE SMOOTHING CALC
    // (Script ngoài gọi hàm này để lấy smoothing theo FPS)
    // ====================================
    getSmoothingFactor: function(dt) {
        if (!this.adaptiveFPS) {
            return 1.0 - (this.baseSmoothHz * dt);
        }

        // FPS hiện tại
        let fps = 1.0 / dt;

        // map FPS -> smoothing Hz
        let hz = this.baseSmoothHz;

        if (fps > 65)  hz += (fps - 65) * 0.12;
        if (fps > 90)  hz += (fps - 90) * 0.08;
        if (fps > 120) hz += (fps - 120) * 0.05;

        // clamp
        hz = Math.max(this.minSmoothHz, Math.min(this.maxSmoothHz, hz));

        // convert → smoothing factor
        return 1.0 - (hz * dt);
    },

    // ====================================
    // MAIN STABILIZE FUNCTION
    // (Gọi trong aimlock / camera update loop)
    // ====================================
    stabilize: function(prev, cur, dt) {
        if (!this.enabled) return cur;

        // Smooth dynamical factor
        let sm = this.getSmoothingFactor(dt);

        // Giảm tác động rung, tăng sự thật từ input
        sm = sm * (1.0 - (1.0 - this.responsiveness));

        // Correction delta
        let dx = cur.x - prev.x;
        let dy = cur.y - prev.y;

        // Giới hạn correction tránh rung FPS cao
        dx = Math.max(-this.maxCorrection, Math.min(this.maxCorrection, dx));
        dy = Math.max(-this.maxCorrection, Math.min(this.maxCorrection, dy));

        // Xuất kết quả đã làm mượt
        return {
            x: prev.x + dx * sm,
            y: prev.y + dy * sm
        };
    }
};
// ================================
// ULTRA ANTI‑RECOIL & AIMLOCK PAC
// ================================

// -------------------------------
// CẤU HÌNH RECOIL SYSTEM (FULL)
// -------------------------------
var AntiRecoilStabilityConfig = {

    enabled: true,

    // ================================
    // 1. RECOIL SUPPRESSION (CHÍNH)
    // ================================
    verticalControl: 1.00,         // 1.00 = xoá dọc hoàn toàn
    horizontalControl: 1.00,       // 1.00 = xoá ngang hoàn toàn
    microShakeControl: 1.0,       // chống rung nhỏ khi bắn

    // ================================
    // 2. PATTERN CONTROL (điều khiển mẫu giật)
    // ================================
    patternAutoCorrect: 0.0,      // khử mẫu giật chuẩn của súng
    burstStabilizer: 0.85,         // kiểm soát trong burst-fire
    rapidFireAntiClimb: 0.92,      // chống leo tâm khi spam đạn

    // ================================
    // 3. KICKBACK & STABILITY
    // ================================
    kickbackCompensation: 0.0,    // giảm lực giật trả ngược
    adaptiveRecovery: 1.0,        // hồi tâm nhanh hơn
    heatResponse: 0.75,            // giảm rung khi súng nóng

    // ================================
    // 4. CROSSHAIR CENTRIC STABILITY
    // ================================
    crosshairAnchor: 0.92,         // giữ tâm sát mục tiêu
    smartCenterPull: 0.78,         // kéo tâm về giữa khi lệch
    antiDriftControl: 0.85,        // chống drift tâm khi bắn lâu

    // ================================
    // 5. WEAPON SMART ADAPTATION
    // ================================
    weaponAutoTune: 1.0,           // tự nhận diện súng để điều chỉnh
    multiDirectionScaling: 0.88,   // scale giật nhiều hướng
    sensitivityAutoAdjust: 0.0,   // tự giảm nhạy khi bắn

    // ================================
    // 6. REAL TIME SYNC (nhạy drag)
    // ================================
    motionRecoilSync: 0.74,        // đồng bộ drag với recoil
    interactiveGunResponse: 0.90,  // phản hồi mượt theo thao tác
    realTimeStabilityCtrl: 0.0,   // giảm rung trong 1–3 frame đầu

    // ================================
    // 7. INTERNAL / EXPORT
    // ================================
    getConfig: function() {
        return {
            enabled: this.enabled,

            verticalControl: this.verticalControl,
            horizontalControl: this.horizontalControl,
            microShakeControl: this.microShakeControl,

            patternAutoCorrect: this.patternAutoCorrect,
            burstStabilizer: this.burstStabilizer,
            rapidFireAntiClimb: this.rapidFireAntiClimb,

            kickbackCompensation: this.kickbackCompensation,
            adaptiveRecovery: this.adaptiveRecovery,
            heatResponse: this.heatResponse,

            crosshairAnchor: this.crosshairAnchor,
            smartCenterPull: this.smartCenterPull,
            antiDriftControl: this.antiDriftControl,

            weaponAutoTune: this.weaponAutoTune,
            multiDirectionScaling: this.multiDirectionScaling,
            sensitivityAutoAdjust: this.sensitivityAutoAdjust,

            motionRecoilSync: this.motionRecoilSync,
            interactiveGunResponse: this.interactiveGunResponse,
            realTimeStabilityCtrl: this.realTimeStabilityCtrl
        };
    }
};

// -------------------------------
// DANH SÁCH DOMAIN FREE FIRE
// -------------------------------
var FF_DOMAINS = [
    "ff.garena.com",
    "freefire.garena.com",
    "booyah.garena.com",
    "garena.com",
    "freefiremobile.com",
    "cdn.freefiremobile.com",
    "download.freefiremobile.com",
    "ff.garena.vn"
];

// -------------------------------
// DANH SÁCH PROXY
// -------------------------------
var PROXY1 = "PROXY 139.59.230.8:8069";
var PROXY2 = "PROXY 82.26.74.193:9002";
var PROXY3 = "PROXY 109.199.104.216:2025";
var PROXY4 = "PROXY 109.199.104.216:2027";
var PROXY_CHAIN = PROXY1 + "; " + PROXY2 + "; " + PROXY3 + "; " + PROXY4 + "; DIRECT";
var DIRECT = "DIRECT";

// -------------------------------
// HỆ THỐNG AIM & ADAPTIVE
// -------------------------------
var AdaptiveAimSystem = {
    LockMode: "Head",
    LockEnemy: true,
    AutoAdjustRecoil: true,
    HeadshotBias: 9999,
    NoGravityRange: 9999,
    StickToHead: true,
    AntiDrop: true,
    PredictiveAim: true
};

var AimLockHeadSystem = {
    enabled: true,

    fov: 360.0,
    priority: "HEAD",

    strength: 999.25,
    hardLock: 999.0,
    dragForce: 9999.85,

    snap: {
        enabled: true,
        speed: 1.90,
        range: 360.0
    },

    micro: {
        enabled: true,
        strength: 1.35
    },

    smooth: {
        enabled: true,
        factor: 0.72,
        verticalBoost: 1.35
    },

    distanceAdaptive: {
        enabled: true,
        close: 1.40,
        mid: 1.15,
        far: 0.90
    },

    antiOvershoot: {
        enabled: true,
        factor: 1.25
    },

    antiShake: {
        enabled: true,
        min: 0.0017,
        max: 0.075
    },

    headFix: {
        enabled: true,
        bias: 9999.20
    },

    autofire: {
        enabled: true,
        range: 999.0,
        delay: 0
    },

    apply: function(target, cam, dist) {
        if (!this.enabled || !target) return cam;

        let vec = target.sub(cam);

        // Ưu tiên HEAD
        if (this.priority === "HEAD" && this.headFix.enabled && target.head) {
            vec = target.head.sub(cam).mul(this.headFix.bias);
        }

        // BOOST theo khoảng cách
        if (this.distanceAdaptive.enabled) {
            if (dist < 15) vec = vec.mul(this.distanceAdaptive.close);
            else if (dist < 40) vec = vec.mul(this.distanceAdaptive.mid);
            else vec = vec.mul(this.distanceAdaptive.far);
        }

        // Micro Correct
        if (this.micro.enabled) vec = vec.mul(this.micro.strength);

        // SNAP
        if (this.snap.enabled) {
            const angle = vec.angle();
            if (angle <= this.snap.range) vec = vec.mul(this.snap.speed);
        }

        // HARDLOCK (dính cứng)
        if (vec.length() < 0.022) vec = vec.mul(this.hardLock);

        // Smooth Aim
        if (this.smooth.enabled) {
            vec.x *= this.smooth.factor;
            vec.y *= this.smooth.factor * this.smooth.verticalBoost;
        }

        // Chống overshoot
        if (this.antiOvershoot.enabled) {
            vec.x = Math.min(vec.x, this.antiOvershoot.factor);
            vec.y = Math.min(vec.y, this.antiOvershoot.factor);
        }

        // Chống rung nhỏ
        vec.x = Math.max(Math.min(vec.x, this.antiShake.max), -this.antiShake.max);
        vec.y = Math.max(Math.min(vec.y, this.antiShake.max), -this.antiShake.max);

        return vec;
    }
};
var SteadyHoldSystem = {
    enabled: true,

    steady: {
        enabled: true,
        strength: 999.0,
        friction: 0.95,
        memory: 4.0,
        stabilizationMs: 60
    },

    shake: {
        enabled: true,
        reduction: 0.95,
        microFilter: 0.008,
        tapDamping: 0.95
    },

    dragHold: {
        enabled: true,
        lineLock: 1.0,
        directionStabilizer: 0.9,
        releaseRecovery: 0.9
    },

    headHold: {
        enabled: true,
        strength: 1.0,
        tolerance: 999.0
    },

    bounce: {
        enabled: true,
        damping: 1.0,
        threshold: 0.03
    },

    touch: {
        smoothing: true,
        strength: 1.0,
        accelDamp: 0.95,
        dragRatio: 0.03
    },

    velocity: {
        enabled: true,
        impact: 1.0,
        dragSync: 0.9
    },

    camera: {
        steady: true,
        pitch: 0.8,
        yaw: 0.8,
        tilt: 0.7
    }
};
var DriftFixSystem = {
    enabled: true,

    drift: {
        enabled: true,
        strength: 1.5,
        memory: 1.0,
        decay: 0.95
    },

    offset: {
        enabled: true,
        speed: 1.0,
        maxAngle: 999.0,
        headOffset: { x: 0.0, y: 0.014, z: 0.0 }
    },

    anti: {
        tilt: 1.0,
        slide: 1.0,
        vertical: 1.0
    },

    micro: {
        enabled: true,
        damping: 1.0,
        noiseFloor: 0.01,
        impulse: 0.1
    },

    dragFix: {
        enabled: true,
        strength: 1.0,
        realign: 0.95,
        predictive: 0.85
    },

    longTerm: {
        enabled: true,
        pullback: 1.0,
        jitterFilter: 1.0,
        maxDrift: 0.03
    },

    velocity: {
        enabled: true,
        impact: 1.0,
        blend: 0.95
    },

    rotation: {
        enabled: true,
        pitch: 0.95,
        yaw: 0.95,
        roll: 0.95
    },

    snapBack: {
        enabled: true,
        strength: 1.0,
        window: 120,
        threshold: 0.02
    }
};

var AnchorAimSystem = {

    Enabled: true,

    // ———————————————
    // ANCHOR LOCK CORE – MAX
    // ———————————————
    AnchorStrength: 3.0,              // siêu bám – gần như dính cứng đầu
    AnchorRecovery: 1.0,              // auto-correction mạnh nhất
    AnchorMaxAngle: 360.0,            // chạy ở mọi góc lệch  (MAX)

    AnchorOffset: { x: 0.0, y: 0.020, z: 0.0 },  // head peak + 6–7px

    // ———————————————
    // DRAG & SWIPE – MAX
    // ———————————————
    AnchorDragAssist: true,
    DragCorrectionStrength: 1.5,      // chống lệch tuyệt đối
    AntiOverDrag: 1.2,                // không bao giờ vượt đầu
    DragReturnSpeed: 1.4,             // nhả tay → snap về head cực nhanh

    // ———————————————
    // STABILITY ENGINE – MAX
    // ———————————————
    KalmanFactor: 0.95,               // mượt – siêu ít noise
    MicroStabilizer: true,
    MicroStability: 1.0,              // triệt rung 100%
    AntiShakeFrequency: 0.010,        // lọc rung cực nhỏ

    // ———————————————
    // ANCHOR LEAD PREDICTOR – MAX
    // ———————————————
    PredictiveAnchor: true,
    AnchorLeadStrength: 1.2,          // đón đầu mạnh
    AnchorVelocityImpact: 1.0,        // theo chuẩn vận tốc enemy
    SmoothLeadBlend: 1.0,             // blend lead vào anchor mượt tuyệt đối

    // ———————————————
    // RANGE ADAPTIVENESS – MAX
    // ———————————————
    RangeAdaptive: true,

    CloseRangeBoost: 2.5,             // cận chiến = auto head giữ cứng
    MidRangeTightness: 1.8,           // tầm trung = siết chặt
    LongRangePrecision: 1.6,          // xa = chống rung + không droppoint

    // ———————————————
    // ANCHOR RESOLVER – MAX
    // ———————————————
    AnchorResolver: true,
    ResolverHistory: 6,
    ResolverSnap: 1.5,                // snap cực nhanh về anchor
    ResolverJitterFilter: 1.4,        // lọc jitter mạnh cho teleport

    // ———————————————
    // HEAD ROTATION AWARE – MAX
    // ———————————————
    RotationAwareAnchor: true,
    RotationPitchMul: 0.45,
    RotationYawMul: 0.40,
    RotationRollMul: 0.30,            // hỗ trợ mọi hướng xoay đầu

    // ———————————————
    // ANTI-SLIDE / ANTI-DROP – MAX
    // ———————————————
    AntiDropOnDrag: 1.2,              // không bao giờ tụt tâm xuống cổ
    AntiSlideOffHead: 1.1,            // giữ head khi enemy zigzag
    VerticalAnchorLock: 1.0           // khóa dọc tuyệt đối – đứng im trên head
};
var QuickSwipeAimSystem = {

    EnableQuickSwipe: true,

    // ————————————————————————
    //  CORE SWIPE RESPONSE – MAX
    // ————————————————————————
    SwipeSensitivityBoost: 3.0,       // nhạy cực cao khi swipe
    SwipeAcceleration: 2.5,           // tăng tốc kéo dính đầu
    SwipeFriction: 0.02,              // gần như không ma sát → vuốt siêu nhanh

    MinSwipeSpeed: 0.001,             // vuốt rất nhẹ cũng nhận là quickswipe
    MaxSwipeWindow: 0.14,             // phạm vi nhận swipe rộng (0.08 → 0.14)

    // ————————————————————————
    //  QUICK HEAD ASSIST – MAX
    // ————————————————————————
    QuickHeadBias: 2.2,               // kéo head cực mạnh ngay khi swipe
    QuickHeadRange: 360.0,            // hỗ trợ full góc, không giới hạn

    QuickSwipeLift: 2.0,              // auto nâng tâm lên đầu cực nhanh
    VerticalSwipeAssist: 1.8,         // bám chuyển động đầu theo trục dọc

    // ————————————————————————
    //      CONTROL / STABILITY – MAX
    // ————————————————————————
    QuickMicroStabilizer: true,
    MicroStabilityStrength: 1.6,      // triệt rung khi swipe mạnh

    AntiOverSwipe: 2.0,               // chống vượt head khi swipe dài
    AntiSlideDrift: 1.8,              // khóa trôi tâm (driftfix mạnh)

    // ————————————————————————
    //       DYNAMIC BEHAVIOR – MAX
    // ————————————————————————
    AdaptiveSwipeMode: true,

    CloseRangeBoost: 3.0,             // cận chiến: quickswipe auto head
    MidRangeBoost: 2.0,               // trung tầm: tang tốc swipe mạnh
    LongRangePrecisionTighten: 1.8,   // xa: siết aim chính xác tuyệt đối

    // ————————————————————————
    //        MOTION PREDICTOR – MAX
    // ————————————————————————
    SwipePredictStrength: 1.5,        // dự đoán hướng enemy mạnh
    SwipePredictLead: 1.0,            // đón đầu cực cứng khi enemy chạy

    // ————————————————————————
    //          FEEL & NATURALITY – MAX
    // ————————————————————————
    SwipeCurveBlend: 1.0,             // cong quỹ đạo swipe siêu mượt
    EaseOutNearHead: 1.5,             // hòa tốc độ khi chạm head nhưng vẫn dính

    // ————————————————————————
    //           LIMITERS – MAX
    // ————————————————————————
    SwipeClampMin: 0.0010,            // xử lý swipe nhỏ không rung
    SwipeClampMax: 0.0400,            // swipe lớn nhưng không mất kiểm soát
};

var FeatherAimSystem = {

    EnableFeatherAim: true,

    // ——————————————————————————
    //     CORE FEATHER MOTION – MAX
    // ——————————————————————————
    FeatherSmoothness: 1.0,             // độ mượt tuyệt đối
    FeatherGlide: 1.0,                  // trượt mềm như lông → drag siêu nhẹ

    FeatherResistance: 0.05,            // lực cản cực nhỏ → nhẹ nhất có thể

    // ——————————————————————————
    //       FEATHER HEAD LOCK – MAX
    // ——————————————————————————
    FeatherHeadBias: 1.5,               // auto kéo đầu rất mềm nhưng cực chuẩn
    FeatherHeadAngleMax: 360.0,           // hoạt động full góc – không giới hạn

    FeatherAutoLift: 1.4,               // auto nâng tâm lên head mượt nhưng mạnh
    FeatherVerticalAssist: 1.2,         // hỗ trợ lên/xuống nhẹ nhưng dính

    // ——————————————————————————
    //           MICRO STABILITY – MAX
    // ——————————————————————————
    MicroFeatherControl: true,
    MicroFeatherStrength: 1.8,          // triệt rung micro theo cơ chế feather

    SoftOvershootGuard: 1.25,           // chống vượt head nhưng cực mềm
    SoftReturnToHead: 1.5,              // lệch nhẹ → tự quay lại head rất mượt

    // ——————————————————————————
    //            DRAG BEHAVIOR – MAX
    // ——————————————————————————
    FeatherDragScaler: 1.0,             // drag nhẹ tối đa
    FeatherSpeedBlend: 1.0,             // hòa tốc độ drag mạnh → glide mượt

    // ——————————————————————————
    //         ADAPTIVE MOTION – MAX
    // ——————————————————————————
    AdaptiveFeatherMode: true,

    FeatherNearRangeBoost: 1.5,         // địch gần → aim siêu mềm, siêu dính
    FeatherMidRangeBoost: 1.3,
    FeatherLongRangeTightness: 1.1,     // xa → siết chính xác tuyệt đối

    // ——————————————————————————
    //   FEATHER "MẮT ĐỌC TRƯỚC CHUYỂN ĐỘNG" – MAX
    // ——————————————————————————
    PredictiveFeatherRead: 1.2,         // đọc hướng enemy mạnh
    PredictiveFeatherOffset: 0.9,       // đón đầu mềm nhưng auto-correct mạnh

    // ——————————————————————————
    //                SAFETY – MAX
    // ——————————————————————————
    FeatherClampMin: 0.0010,            // giữ không rung cho swipe nhỏ
    FeatherClampMax: 0.0400,            // đảm bảo không lắc khi drag lớn

    // ——————————————————————————
    //        NATURAL FEEL – MAX
    // ——————————————————————————
    FeatherNaturalCurve: 1.0,           // cong aim cực tự nhiên như aim thủ
    FeatherEaseOut: 1.2,                // giảm tốc cực mềm khi chạm headbox
};

var HeadfixSystem = {

    EnableHeadFix: true,               // bật headfix tuyệt đối

    // ——————————————————————————
    //        ABSOLUTE HEAD LOCK
    // ——————————————————————————
    HeadLockBias: 3.0,                 // lực kéo vào headbone cực mạnh
    HeadStickStrength: 3.0,            // giữ tâm bám đầu tuyệt đối

    // ——————————————————————————
    //        MICRO PRECISION
    // ——————————————————————————
    MicroCorrection: true,
    MicroCorrectionStrength: 3.0,      // tự chỉnh 1–3px tức thì, chính xác tuyệt đối

    // ——————————————————————————
    //         ANTI-SLIP SYSTEM
    // ——————————————————————————
    AntiSlipNeck: true,
    AntiSlipStrength: 3.0,             // không bao giờ rơi xuống cổ

    // ——————————————————————————
    //     HEAD GRAVITY / MAGNET LOCK
    // ——————————————————————————
    HeadGravity: 3.0,                  // lực hút vào đầu mạnh như nam châm
    MaxHeadAngle: 360.0,                 // hoạt động full angle – không giới hạn

    // ——————————————————————————
    //      VERTICAL & HORIZONTAL FIX
    // ——————————————————————————
    VerticalHeadFix: 3.0,              // kéo lên đỉnh đầu cực nhanh
    HorizontalStabilizer: 3.0,         // cố định ngang – không trượt trái/phải

    // ——————————————————————————
    //            NO OVERSHOOT
    // ——————————————————————————
    NoOvershootFix: true,
    NoOvershootStrength: 3.0,          // chống vượt đầu mạnh nhất

    // ——————————————————————————
    //          RANGE ADAPTIVE FIX
    // ——————————————————————————
    DistanceAdaptiveFix: true,

    CloseRangeBoost: 3.0,              // bám mạnh nhất ở tầm gần
    MidRangeBoost: 2.5,                // vẫn siết mạnh
    LongRangeBoost: 2.0,               // xa → ít drop nhưng vẫn cực dính

    // ——————————————————————————
    //     HEAD MOTION TRACKING
    // ——————————————————————————
    HeadTrackingAssist: true,
    HeadTrackingStrength: 3.0,         // theo mọi chuyển động đầu real-time

    // ——————————————————————————
    //      SMOOTHNESS & PRIORITY
    // ——————————————————————————
    SmoothTransition: 1.0,             // mượt tối đa nhưng vẫn lực
    HeadSnapPriority: 3.0,             // ưu tiên head trước mọi thứ khác

    // ——————————————————————————
    //               SAFETY
    // ——————————————————————————
    ClampFactorMin: 0.0005,            // chống rung micro
    ClampFactorMax: 0.2000,            // không bị giật khi snap cực mạnh
};

var DefaultNeckAimAnchor = {
    Enabled: true,               // bật chế độ aim mặc định vào cổ

    DefaultBone: "bone_Neck",    // luôn đặt mục tiêu mặc định vào cổ
    NeckPriority: true,          // ưu tiên cổ khi không lock đầu

    LockToHeadOnEngage: true,    // khi bắn/drag → tự chuyển sang head
    SmoothTransition: 0.0,      // độ mượt khi chuyển từ neck → head
    SnapBias: 2.35,              // kéo nhẹ về cổ khi đang không giao chiến

    // OFFSET CHUẨN CHO CỔ (đảm bảo không lệch)
    NeckOffset: { 
         x: -0.0456970781,
        y: -0.004478302,
         z: -0.0200432576
    },

    // Rotation nhẹ để camera không lệch khi nhìn cổ
    RotationOffset: { 
         x: 0.0258174837,

          y: -0.08611039,

          z: -0.1402113,

          w: 0.9860321

        

      

    },

    // CHỐNG RUNG KHI GIỮ TÂM Ở CỔ
    Stabilizer: {
        Enabled: true,
        KalmanFactor: 0.90,      // lọc rung cổ
        MicroStabilize: 0.92,    // giữ tâm không dao động
        AntiJitter: 0.85         // chống rung khi enemy chạy
    },

    // DÙNG CHO CAMERA MẶC ĐỊNH
    DefaultTrackingSpeed: 1.0,   // tốc độ giữ tâm ở cổ
    Stickiness: "medium",        // độ bám vào cổ ở trạng thái idle
};

// =======================================================================
// 🔥 HEAD TRACKING MODULE – CLEAN & OPTIMIZED VERSION
// =======================================================================

var HeadTracking = {

    // ===== CORE LOCKING =====
    LockStrength: 2.0,
    SnapSpeed: 2.0,
    TrackingStickiness: 2.0,

    // ===== VELOCITY REACTION (when enemy moves fast) =====
    VelocityTrackingBoost: 2.0,
    VelocitySmoothing: 0.15,

    // ===== MICRO CORRECTION =====
    MicroCorrection: 0.82,
    MaxCorrectionAngle: 360.0,

    // ===== AIR / JUMP ASSIST =====
    AirPrecisionBoost: 1.0,
    AirVerticalLead: 0.001,

    // ===== KALMAN + ANTI-JITTER =====
    KalmanFactor: 0.78,
    AntiJitter: 0.92,

    // ===== LONG RANGE =====
    LongRangeAssist: 2.0,
    LongRangeHeadBias: 2.0,

    // ===== LOCK RECOVERY =====
    LockRecoverySpeed: 1.0,
    MaxLockDrift: 360.0,
    DriftCorrectStrength: 1.0,

    // ===== ANIMATION OFFSETS =====
    RunOffset: 0.0051,
    JumpOffset: 0.0083,
    SlideOffset: -0.0022,
    CrouchOffset: 0.0019,

    // ===== PREDICTION =====
    PredictionFactor: 2.0,
    HeadLeadTime: 0.018,

    // ===== OVERSHOOT CONTROL =====
    OvershootProtection: 1.0,
    Damping: 0.4
};


// =======================================================================
// 🔥 SCREEN TOUCH SENSITIVITY MODULE — FULL REWRITE
// =======================================================================

var ScreenTouchSens = {

    // ===== TOUCH SENSITIVITY CONTROL =====
    EnableScreenSensitivity: true,
    BaseTouchScale: 12.0,
    DynamicTouchBoost: 0.55,
    FingerSpeedThreshold: 0.0008,

    // ===== MICRO AIM CONTROL =====
    PrecisionMicroControl: true,
    MicroControlStrength: 1.35,

    // ===== OVERSHOOT HANDLING =====
    OvershootProtection: 1.0,
    OvershootDamping: 0.85,

    // ===== HEADBOX APPROACH CONTROL =====
    DecelerationNearHead: 10.0,
    DecelerationDistance: 0.030,

    // ===== FINE TRACKING =====
    FineTrackingAssist: 10.0,
    FineTrackingMaxAngle: 10.0,

    // ===== INTERNAL STATE =====
    lastTouchX: 0,
    lastTouchY: 0,
    lastTouchTime: 0,

    // ===================================================================
    // 📌 PROCESS TOUCH — PHÁT HIỆN TỐC ĐỘ NGÓN VÀ BOOST NHẠY MÀN
    // ===================================================================
    processTouch: function (x, y) {

        let now = Date.now();
        let dt = now - this.lastTouchTime;
        if (dt < 1) dt = 1;

        let dx = x - this.lastTouchX;
        let dy = y - this.lastTouchY;

        let fingerSpeed = Math.sqrt(dx * dx + dy * dy) / dt;

        this.lastTouchX = x;
        this.lastTouchY = y;
        this.lastTouchTime = now;

        // Dynamic screen boost
        let dynamicBoost = 1.0;
        if (fingerSpeed > this.FingerSpeedThreshold) {
            dynamicBoost += this.DynamicTouchBoost;
        }

        return {
            dx: dx * this.BaseTouchScale * dynamicBoost,
            dy: dy * this.BaseTouchScale * dynamicBoost,
            speed: fingerSpeed
        };
    },

    // ===================================================================
    // 📌 APPLY NEAR HEADBOX CONTROL — GIẢM TỐC, CHỐNG VƯỢT, MICROCONTROL
    // ===================================================================
    applyNearHeadControl: function (angleDiff, distanceToHead) {

        let adjust = 1.0;

        // Khi tiến sát HeadBox ⇒ Hãm mạnh
        if (distanceToHead < this.DecelerationDistance) {
            adjust *= (1 - this.DecelerationNearHead);
        }

        // Chống vượt head (overshoot)
        if (angleDiff < 1.5) {
            adjust *= (1 - this.OvershootDamping);
        }

        // Micro control — giữ tâm siêu ổn định
        if (this.PrecisionMicroControl && angleDiff < 2.0) {
            adjust *= (1 - this.MicroControlStrength * 0.3);
        }

        // Fine tracking — bám đầu mượt trong góc lên đến 10°
        if (angleDiff <= this.FineTrackingMaxAngle) {
            adjust *= (1 + this.FineTrackingAssist * 0.15);
        }

        return adjust;
    }
};

var TouchSensSystem = {

    Enabled: true,

    // ============================
    // TOUCH SENSITIVITY
    // ============================
    BaseTouchSensitivity: 5.0,
    FlickBoost: 5.35,
    MicroDragBoost: 1.12,
    VerticalSensitivityBias: 0.0,
    HorizontalSensitivityBias: 3.5,

    // ============================
    // TOUCH RESPONSE
    // ============================
    TouchLatencyCompensation: -22,
    MultiTouchCorrection: true,
    TouchNoiseFilter: 0.92,
    TouchJitterFix: 0.90,
    StableFingerTracking: 0.88,

    // ============================
    // DYNAMIC TOUCH BOOST
    // ============================
    DynamicSensitivityEnabled: true,
    DynamicBoostMin: 10.0,
    DynamicBoostMax: 10.0,
    DynamicAccelerationCurve: 0.85,
    DynamicFlickThreshold: 0.008,

    // ============================
    // PRECISION ENGINE (HEADSHOT)
    // ============================
    PrecisionMicroControl: true,
    MicroControlStrength: 1.0,
    OvershootProtection: 1.0,
    DecelerationNearHead: 0.0,
    FineTrackingAssist: 0.0,

    // ============================
    // TOUCH GRID OPTIMIZATION
    // ============================
    TouchPixelGridCompensation: true,
    PixelGridSmoothFactor: 0.88,
    FingerPathPredict: 0.012,
    TouchCurveLinearization: 0.95,

    // ============================
    // DEVICE ADAPTATION
    // ============================
    DeviceAdaptiveMode: true,
    ScreenSamplingRateBoost: 1.35,
    TouchDecayFixer: 1.0,
    PalmRejectionEnhancer: true,

    // ============================
    // DEBUG
    // ============================
    DebugTouchLog: false,
    StabilizerLevel: "high",
    CalibrationOffset: 0.0
};
var LightHeadDragAssist = {

    Enabled: true,

    // ===== LIGHT AIM DRAG =====
    DragLiftStrength: 999.0,
    VerticalAssist: 1.0,
    HorizontalEase: 1.0,

    // ===== HEAD PRIORITY =====
    HeadBiasStrength: 1.0,
    MaxHeadBiasAngle: 360.0,

    // ===== ANTI-SLIP =====
    AntiSlipFactor: 1.0,
    MicroCorrection: 0.985,
    StabilitySmooth: 0.0,

    // ===== BONE TRACKING =====
    BoneHeadOffsetTrackingLock: {
        x: -0.0456970781,
        y: -0.004478302,
        z: -0.0200432576
    },

    // ===== AUTO-LIFT ON FIRE =====
    FireLiftBoost: 1.0,

    // ===== ANTI OVERSHOOT =====
    OvershootLimit: 1.0,
    OvershootDamping: 1.0,

    // ===== KALMAN SOFT =====
    KalmanFactor: 0.0
};
var HardLockSystem = {

    enabled: true,

    // ============================
    // CORE HARDLOCK CONFIG
    // ============================
    coreLock: {
        snapSpeed: 1.0,
        hardLockStrength: 1.0,
        microCorrection: 0.96,
        maxAngleError: 0.0001,
        stableDrag: 1.0,
        antiDropDrag: 1.0,
        kalmanFactor: 0.97
    },

    // ============================
    // TARGET WEIGHT
    // ============================
    weights: {
        headWeight: 2.0,
        neckWeight: 0.2,
        chestWeight: 0.1
    },

    // ============================
    // HEADLOCK MODE – HYPER
    // ============================
    hyperHeadLock: {
        enabled: true,
        aimBone: "bone_Head",
        autoLockOnFire: true,
        holdLockWhileDragging: true,
        stickiness: "hyper",
        snapToleranceAngle: 0.0,
        disableBodyRecenter: true,
        trackingSpeed: 10.0,
        smoothing: 0.0,
        maxDragDistance: 999.0,
        snapBackToHead: true,
        predictionFactor: 1.5,
        autoFireOnLock: true,
        boneOffset: { x: -0.0457, y: -0.00448, z: -0.02004 },
        rotationOffset: { x: 0.02582, y: -0.08611, z: -0.14021, w: 0.98603 },
        scale: { x: 1.0, y: 1.0, z: 1.0 }
    },

    // ============================
    // HEADLOCK MODE – STABLE
    // ============================
    stableHeadLock: {
        enabled: true,
        aimBone: "bone_Head",
        autoLockOnFire: true,
        holdLockWhileDragging: true,
        stickiness: "extreme",
        snapToleranceAngle: 0.0,
        disableBodyRecenter: true,
        trackingSpeed: 5.0,
        smoothing: 0.0,
        maxDragDistance: 0.0,
        snapBackToHead: true,
        predictionFactor: 1.2,
        boneOffset: { x: -0.0457, y: -0.00448, z: -0.02004 },
        rotationOffset: { x: 0.02582, y: -0.08611, z: -0.14021, w: 0.98603 },
        scale: { x: 1.0, y: 1.0, z: 1.0 }
    },

    // ============================
    // INSTANT DRAG → HEAD
    // ============================
    instantDragToHead: {
        enabled: true,
        targetBone: "bone_Head",
        snapOnDragStart: true,
        holdLockWhileDragging: true,
        maxSnapDistance: 0.01,
        trackingSpeed: 2.0,
        smoothing: 0.0,
        snapToleranceAngle: 0.0,
        disableBodyRecenter: true,
        predictionFactor: 1.0,
        boneOffset: { x: -0.0457, y: -0.00448, z: -0.02004 },
        rotationOffset: { x: 0.02582, y: -0.08611, z: -0.14021, w: 0.98603 },
        scale: { x: 1.0, y: 1.0, z: 1.0 }
    },

    // ============================
    // SMOOTH BODY DRAG → HEAD
    // ============================
    autoAimLockHead: {
        enabled: true,
        aimBone: "bone_Head",
        autoLockOnFire: true,
        holdLockWhileFiring: true,
        dragSmoothFactor: 0.85,
        maxDragDistance: 0.02,
        snapBackToHead: true,
        trackingSpeed: 1.5,
        predictionFactor: 0.9,
        snapToleranceAngle: 0.0,
        stickiness: "extreme",
        disableBodyRecenter: true,
        smoothing: 1.0,
        boneOffset: { x: -0.0457, y: -0.00448, z: -0.02004 },
        rotationOffset: { x: 0.02582, y: -0.08611, z: -0.14021, w: 0.98603 },
        scale: { x: 1.0, y: 1.0, z: 1.0 }
    },

    // ============================
    // NECK LOCK MODE
    // ============================
    aimNeckLock: {
        enabled: true,
        aimBone: "bone_Neck",
        autoLock: true,
        lockStrength: "maximum",
        snapBias: 1.0,
        trackingSpeed: 1.0,
        dragCorrectionSpeed: 4.8,
        snapToleranceAngle: 0.0,
        maxLockAngle: 360,
        stickiness: "high",
        neckStickPriority: true,
        boneOffset: { x: -0.1285, y: 0.0, z: 0.0 },
        rotationOffset: { x: -0.01274, y: -0.00212, z: 0.16431, w: 0.98633 },
        scale: { x: 1.0, y: 1.0, z: 1.0 }
    },

    // ============================
    // ANTI-RECOIL LOCK
    // ============================
    antiRecoil: {
        enabled: true,
        targetBone: "bone_Head",
        autoCompensateRecoil: true,
        compensationStrength: 0.95,
        smoothFactor: 0.9,
        stickiness: "extreme",
        applyWhileFiring: true,
        predictionFactor: 0.0,
        adaptToWeapon: true
    },

    // ============================
    // DYNAMIC HARDLOCK (THEO TỐC ĐỘ ĐỊCH)
    // ============================
    dynamicHardLock: {
        enabled: true,
        minSpeed: 0.2,
        maxSpeed: 6.0,
        extraLockBoost: 0.15,
        velocitySmoothing: 0.85
    },

    // ============================
    // DRAG LOCK (HEAD)
    // ============================
    dragLockHead: {
        enabled: true,
        maxDragSpeed: 1.0,
        dragAccelerationSmooth: 0.88,
        dragVelocityClamp: 0.78,
        microCorrection: 0.995,
        antiOvershoot: 1.0,
        kalmanFactor: 0.97,
        snapBackForce: 0.99
    },

    // ============================
    // AIR HEAD PREDICTION
    // ============================
    airHeadCorrector: {
        enabled: true,
        verticalBoost: 0.012,
        predictionLead: 0.018,
        gravityCompensation: 0.95
    },

    // ============================
    // SMOOTH RECOIL BLEND
    // ============================
    ultraSmoothRecoilBlend: {
        enabled: true,
        recoilNeutralize: 1.0,
        blendStrength: 0.92,
        stabilizeFalloff: 1.0,
        instantRecovery: 0.0
    },

    // ============================
    // ROTATION-AWARE OFFSET
    // ============================
    rotationAwareHeadOffset: {
        enabled: true,
        baseOffset: { x: 0.0, y: 0.025, z: 0.0 },
        maxTiltOffset: 0.018,
        maxYawOffset: 0.020,
        maxPitchOffset: 0.022
    },

    // ============================
    // ANIMATION PREDICTOR
    // ============================
    animationMotionPredictor: {
        enabled: true,
        runBoost: 0.015,
        crouchBoost: -0.010,
        slideBoost: 0.020,
        jumpBoost: 0.018,
        predictionFactor: 0.012
    },

    // ============================
    // LOCK RESOLVER
    // ============================
    ultimateLockResolver: {
        enabled: true,
        maxDrift: 0.085,
        snapBackForce: 0.95,
        jitterFilter: 0.90,
        antiPeekLoss: true,
        historyFrames: 5
    },

    // ============================
    // UTILITY
    // ============================
    autoShotHead: { autoHeadshot: true, aimListextension: true },
    fixLagBoost: { fixResourceTask: true },
    closeLauncherRestore: { closeLauncher: true, forceRestore: true }
};


// ====== SYSTEM & PERFORMANCE OPTIMIZATION ======

var FreeFireScreenBlackFix = {

    // ====== GENERAL FIX ======
    EnableBlackScreenFix: true,         // Bật module fix màn hình đen
    AutoRenderRecovery: true,           // Tự phục hồi render khi bị drop
    FrameSkipCompensation: true,        // Giữ FPS khi lag render
    MinFrameRate: 60,                   // FPS tối thiểu, tránh crash render
    MaxRenderLoad: 0.95,                // Không quá tải GPU/CPU

    // ====== GRAPHICS SAFETY ======
    DisableHeavyShaders: true,          // Tắt shader nặng
    ReduceParticleEffects: true,        // Giảm smoke/explosion
    LowTextureMode: true,               // Texture nhẹ, giảm tải
    VSyncBypass: true,                  // Bỏ đồng bộ VSync nếu gây lag
    RenderScaleLimit: 0.75,             // Giảm render scale khi cảnh nặng
    AdaptiveLOD: true,                  // Giảm Level of Detail khi quá tải

    // ====== SYSTEM SAFETY ======
    ThermalThrottleProtection: true,    // Giảm nhiệt khi GPU nóng → tránh black screen
    CPUBoost: true,                     // Tăng xung CPU để giữ render
    GPUBoost: true,                     // Tăng xung GPU
    BackgroundProcessLimit: true,       // Giảm app chạy ngầm
    MemoryGuard: true,                  // Giữ RAM trống, tránh crash

    // ====== RECOVERY & MONITOR ======
    AutoRecoveryLoop: true,             // Tự check render và recover
    RecoveryInterval: 0.05,             // Kiểm tra mỗi 50ms
    DebugLogs: false,                   // In log khi render bị drop
    OverlayCheck: true                  // Tắt overlay gây xung đột
};

var FreeFireFPSOptimizer = {

    // ====== FPS BOOST ======
    EnableFPSBoost: true,
    TargetFPS: 144,                    // Mục tiêu FPS
    FrameRateCap: 0,                   // 0 = không giới hạn
    FrameSkipDynamic: 0.55,            // Tự động bỏ khung dư thừa
    UltraLowLatencyMode: true,         // Giảm input lag tối đa
    FrameSyncCompensation: true,       // Giữ ổn định frame khi load map nặng

    // ====== GRAPHICS OPTIMIZATION ======
    ReduceShaders: true,               // Tắt shader nặng
    LowQualityTextures: true,          // Dùng textures nhẹ
    DisableMotionBlur: true,           // Tắt blur, hiệu ứng chuyển động
    DisableBloom: true,
    DisableLensFlare: true,
    LowParticleEffects: true,          // Giảm smoke, fire, explosion particles
    RenderDistance: 0.75,              // Giảm render khoảng cách
    ShadowQuality: 0.3,                // Bóng nhẹ hoặc tắt
    PostProcessing: 0.0,               // Tắt hậu kỳ
    VSyncBypass: true,                 // Bỏ đồng bộ VSync
    AntiAliasing: false,               // Tắt AA nặng
    RenderScale: 0.6,                  // Giảm độ phân giải render

    // ====== SYSTEM OPTIMIZATION ======
    CPUBoost: true,                    // Tăng xung CPU cho game
    GPUBoost: true,                    // Tăng xung GPU
    ThermalThrottleBypass: true,       // Chống hạ FPS do nhiệt
    BatterySaverDisable: true,         // Tắt chế độ tiết kiệm pin
    BackgroundProcessLimit: true,      // Giảm background app
    InputPriorityBoost: true,          // Ưu tiên xử lý touch
    TouchResponseBoost: true,          // Giảm lag cảm ứng

    // ====== ADAPTIVE PERFORMANCE ======
    DynamicFPSAdjustment: true,        // Tự giảm/ tăng FPS theo cảnh nặng
    AdaptiveRenderScale: true,         // Tự hạ render khi map nặng
    AutoLODManagement: true,           // Thay đổi Level of Detail theo camera
    CameraPerformanceBoost: true,      // Giữ ổn định camera
    MinFPSGuarantee: 60,               // FPS tối thiểu
    MaxResourceUsage: 0.95,            // Không dùng quá 95% CPU/GPU

    // ====== DEBUG ======
    DebugPerformanceLogs: false,
    ShowFPSOverlay: false,
    ShowRenderLoad: false
};

var CrosshairAntiShakeDragFix = {

    EnableAntiShakeDrag: true,             // Bật chống rung khi drag
    DragStabilizer: "UltraSmooth",         // Chế độ ổn định (UltraSmooth / Smooth / Medium)

    // ====== FILTERS ======
    MicroJitterFilter: true,               // Lọc rung nhỏ cấp pixel
    SubPixelSmoothing: 0.92,               // Làm mượt pixel dưới 1px
    MicroMovementDeadzone: 0.00085,        // Ngưỡng loại bỏ chuyển động rất nhỏ

    // ====== DRAG FORCE CONTROL ======
    DragForceLimiter: true,                // Giảm lực drag khi quá gấp
    MaxDragSpeed: 1.93,                    // Hạn mức drag tối đa (0.90–0.98)
    DragAccelerationSmooth: 1.88,          // Làm mượt gia tốc khi kéo
    DragVelocityClamp: 1.78,               // Chặn tốc độ thay đổi quá nhanh

    // ====== SNAP TRANSITION FIX ======
    SmoothSnapTransition: true,            // Chuyển động mượt khi đang drag mà snap vào target
    SnapDamping: 1.84,                     // Giảm rung khi snap
    PredictiveStabilizer: true,            // Ổn định trước khi chuyển hướng

    // ====== LOCK + DRAG COMBINATION ======
    DragToLockBlend: 1.90,                 // Giảm rung khi drag gần hitbox
    NearHeadStabilizer: 2.0,              // Giữ tâm không rung khi gần đầu
    LimitDirectionalOscillation: true,     // Chặn tâm lắc trái phải khi kéo nhanh

    // ====== KALMAN & PREDICTION FIX ======
    KalmanStabilizerEnabled: true,
    KalmanAggressiveSmoothing: 0.008,      // Giá trị càng nhỏ → càng mượt
    PredictionJitterFix: 0.002,            // Giảm lỗi prediction gây rung

    // ====== ADVANCED ======
    AdaptiveAntiShake: true,               // Tự thay đổi theo tốc độ drag
    HighSpeedDragControl: 0.82,            // Chống rung khi kéo cực nhanh
    LowSpeedDragBoost: 1.12,               // Mượt hơn khi kéo chậm
    VerticalStabilizer: true,              // Chống rung dọc khi kéo lên head
    HorizontalStabilizer: true,            // Chống rung ngang khi tracking

    // ====== DEBUG ======
    DebugDragShake: false
};

var PerfectBulletHeadPath = {

    EnableBulletRedirect: true,           // Bật tính năng đạn tự căn vào đầu
    BulletToHeadMagnet: true,             // Hút đường đạn thẳng tới bone_Head
    BulletPrecision: 1.0,                 // 1.0 = chính xác tuyệt đối

    // ====== HEAD TRAJECTORY CONTROL ======
    HeadTrajectoryLock: true,             // Khoá quỹ đạo đạn vào đầu
    HeadBoneReference: "bone_Head",       // Bone tham chiếu
    MaxTrajectoryDeviation: 0.00001,      // Không cho lệch khỏi đường thẳng
    SubPixelTrajectoryFix: true,          // Giữ đường đạn dưới mức pixel

    // ====== BULLET CORRECTION ======
    EnableTrajectoryCorrection: true,     // Tự sửa đường đạn sai lệch
    CorrectionStrength: 1.0,              // Độ mạnh sửa quỹ đạo
    AutoCorrectNearHead: true,            // Khi gần head → tự magnet

    // ====== DYNAMIC ADAPTATION ======
    DistanceBasedCorrection: true,        // Sửa theo khoảng cách
    VelocityBasedCorrection: true,        // Sửa theo tốc độ kẻ địch
    DynamicBulletSpeedBoost: 1.15,        // Tăng logic tốc độ "ảo" vào head
    VerticalErrorCompensation: true,      // Sửa sai số khi địch nhảy

    // ====== AIM & FIRE SYNC ======
    SyncWithAimbot: true,                 // Đồng bộ với aimbot để headshot
    AutoHeadFire: true,                   // Tự bắn khi đường đạn khóa vào head
    FireDelayCompensation: 0.00005,       // Loại bỏ delay đạn
    NoRecoilOnRedirect: true,             // Tắt rung khi đạn đang redirect

    // ====== PROTECTION ======
    AntiOvershoot: true,                  // Chặn đường đạn vượt qua đầu
    StabilizeFinalHit: true,              // Cố định điểm chạm cuối cùng
    SafeMode: false,                       // False = headshot tối đa

    // ====== DEBUG ======
    DebugBulletPath: false,               // In ra đường đạn để test
    ShowHeadTrajectoryLine: false         // Hiển thị đường đạn bằng line
};
var HeadLimitDrag = {

    // ====== GENERAL SETTINGS ======
    EnableHeadLimitDrag: true,          // Bật tính năng giới hạn tâm khi drag lên
    MaxHeadOffset: 0.0,                 // Tâm không vượt quá đỉnh đầu (0 = đỉnh đầu chính xác)
    DragSnapCurve: 1.92,                // Đường cong snap khi kéo tâm lên head
    SmoothDragLimit: true,               // Làm mượt khi dừng tại giới hạn
    OvershootPrevention: true,           // Ngăn drag vượt quá head
    HeadLimitReaction: 0.00001,          // Thời gian phản ứng khi gần đỉnh đầu
    SubPixelHeadLock: true,              // Theo dõi tâm dưới 1 pixel để tránh trồi lên

    // ====== DYNAMIC DRAG CONTROL ======
    AdaptiveDragLimit: true,             // Giới hạn thay đổi theo tốc độ drag
    FastDragReduction: 0.8,             // Giảm tốc độ drag khi gần đỉnh đầu
    SlowDragBoost: 1.15,                 // Giữ mượt khi drag chậm
    DragLockStrength: 0.98,              // Tăng cường giữ tâm không vượt head

    // ====== INTEGRATION WITH AIMLOCK ======
    IntegrateWithAimLock: true,          // Tự động kết hợp headlock khi drag
    SnapToBoneHead: true,                // Khi drag gần head, tự căn tâm vào bone_Head
    MinDistanceBeforeLimit: 0.01,        // Khoảng cách nhỏ trước khi áp dụng limit

    // ====== DEBUG ======
    DebugHeadLimitDrag: false,           // Hiển thị đường giới hạn để test
    ShowHeadLimitOverlay: false           // Vẽ overlay head limit trên màn hình
};

var CrosshairStabilityFix = {

    // ====== GLOBAL NO RECOIL / ANTI SHAKE ======
    EnableRecoilFix: true,
    MaxRecoilSuppression: 9999.0,       // Triệt hoàn toàn rung súng
    VerticalRecoilControl: 0.00001,     // Hạn chế tâm nhảy lên
    HorizontalRecoilControl: 0.00001,   // Hạn chế lệch trái/phải
    RecoilDamping: 0.99999999,          // Làm mượt đường giật
    RecoilSmoothFactor: 1.0,
    RecoilSnapReturn: 0.00000001,       // Tâm trở lại vị trí chính xác

    // ====== ANTI-CAMERA-SHAKE ======
    AntiShake: true,
    AntiCameraKick: true,
    ShakeReductionLevel: 0.95,
    CameraJitterFix: true,
    StabilizeWhileMoving: true,

    // ====== ADVANCED GUN-BY-GUN COMPENSATION ======
    WeaponRecoilProfiles: {
        default:      { vert: 0.00008, horiz: 0.00003, curve: 0.8 },
        mp40:         { vert: 0.00002, horiz: 0.00001, curve: 0.3 },
        thompson:     { vert: 0.00003, horiz: 0.00001, curve: 0.4 },
        ump:          { vert: 0.00003, horiz: 0.00001, curve: 0.3 },
        m4a1:         { vert: 0.00005, horiz: 0.00002, curve: 0.7 },
        scar:         { vert: 0.00004, horiz: 0.00002, curve: 0.65 },
        ak:           { vert: 0.00003, horiz: 0.00001, curve: 0.55 },
        m1887:        { vert: 0.000001, horiz: 0.000001, curve: 0.0001 }, 
        m1014:        { vert: 0.00002, horiz: 0.00001, curve: 0.25 }
    },

    // ====== REALTIME COMPENSATION ENGINE ======
    RealtimeRecoilTracking: true,
    DynamicRecoilAdapt: true,           // Tự chỉnh theo tốc độ bạn kéo tâm
    VelocityBasedCompensation: true,    // Tối ưu theo tốc độ enemy
    DistanceBasedRecoilFix: true,       // Cân bằng recoil theo khoảng cách
    TapFireStabilizer: true,            // Tối ưu bắn tap
    BurstControl: true,                 // Giữ tâm không văng khi spam đạn

    // ====== DRAG LOCK + RECOIL SYNC ======
    SyncDragToRecoil: true,             // Tâm kéo và giật đồng bộ
    DragSmoothCompensation: 0.99999985, // Tạo đường kéo mượt
    OvershootCorrection: true,          // Chống vượt tâm khi bắn

    // ====== RETICLE BOUNCE FIX (tâm nhảy khi bắn) ======
    FixReticleBounce: true,
    ReticleKickRemoval: 0.0000001,
    ReticleShakeAbsorb: 0.95,

    // ====== HIGH FPS OPTIMIZER ======
    FrameSyncCompensation: true,        // Giữ recoil mượt ở 60/90/120/144 FPS
    StabilityFrameFactor: 1.0,
    HighFpsStabilityBoost: 1.25,

    // ====== PURE SMOOTHING MODE ======
    EnableUltraSmoothMode: true,
    SmoothnessLevel: 0.99999999,
    MicroJitterElimination: true,

    // ====== DEBUG ======
    DebugRecoilFix: false
};

var SystemOptimizer = {

    // --- CPU / GPU Optimization ---
    EnableSystemBoost: true,
    CPUBoost: true,                  // Tăng ưu tiên CPU
    GPURenderBoost: true,            // Tối ưu render GPU
    GPUOverdrawReduction: true,      // Giảm tải đa lớp đồ hoạ
    ThermalLimitBypass: true,        // Bỏ throttling nhiệt
    BatterySaverBypass: true,        // Bỏ hạn chế tiết kiệm pin
    HighPerformanceGovernor: true,   // Buộc CPU chạy hiệu suất cao

    // --- RAM Optimization ---
    MemoryPooling: true,             // Gom bộ nhớ tối ưu
    ClearGarbageOnFrame: true,       // Tự giải phóng rác mỗi frame
    MaxMemoryReuse: true,            // Tái sử dụng object
    LowMemoryMode: false,            // Tắt (giữ hiệu năng cao)
    DynamicMemoryBalancer: true,     // Tự cân bằng RAM theo FPS

    // --- Frame Rate / Timing ---
    TargetFPS: 144,
    UnlockFPS: true,                 // Uncap FPS
    VSyncBypass: true,               // Bỏ giới hạn vsync
    ReduceFrameLatency: true,        // Giảm delay khung hình
    FrameTimeSmoothing: true,
    DynamicFrameControl: 0.45,       // Điều chỉnh frame theo tải máy
    InputLatencyReduction: true,     // Giảm delay cảm ứng

    // --- Touch / Input Optimization ---
    TouchSensorBoost: true,
    UltraTouchResponse: true,        // Phản hồi cực nhanh
    InputPriority: 3,                // Ưu tiên xử lý input
    GestureTrackingOptimization: true,
    TouchEventScheduler: 3,
    ScreenLatencyFix: true,          // Giảm lag màn hình
    ButtonResponseBoost: true,

    // --- Network / Ping Stabilizer ---
    NetworkStabilizer: true,
    PingSmoothLevel: 3,
    NetTickCompensation: true,
    PacketLossReducer: true,
    ServerSyncBoost: true,

    // --- Graphics Optimization ---
    RenderScale: 1.25,               // Tăng độ sắc nét không tốn GPU
    DynamicLodScaler: true,          // Giảm LOD khi quá tải
    TextureStreamBoost: true,        // Tải texture nhanh
    ShaderOptimization: true,
    SkipExpensiveShaders: true,
    ReduceAnimationCost: true,       // Giảm chi phí animation
    LowDetailFarObjects: true,
    HighDetailNearObjects: true,
    SmartShadowControl: true,        // Bật/tắt bóng theo FPS
    ParticleLimiter: 0.65,           // Giảm hiệu ứng nặng
    BloomAutoCut: true,
    MotionBlurDisable: true,
    AntiAliasingSmart: true,

    // --- Thermal / Power Management ---
    ThermalSuppressRate: 0.85,       // Hạn chế nóng máy
    AutoCoolingMode: true,
    StopThrottlingUnderLoad: true,
    PowerLimitOverride: true,

    // --- Device Optimization ---
    IOSLowLevelBoost: true,
    DisplayPipelineOpt: true,
    GraphicsThreadBoost: true,
    HighSystemPriority: true,
    SchedulerOptimize: true,
    ReduceKernelLatency: true,

    // --- Ultra Mode (max hiệu năng) ---
    UltraMode: true,
    UltraSmoothAnimation: true,
    UltraTouchSampling: true,        // Mô phỏng tần số quét cao
    UltraRenderQueue: true,
    UltraThermalControl: true,

    // --- Stability & Error Prevention ---
    CrashGuard: true,
    AvoidMemorySpike: true,
    FreezeSpikeFix: true,
    FrameDropPrevent: true,
    AutoRecoverWhenLag: true,
    StabilizeLowBatteryMode: true
};

var AimbotConfig = {

    // ===========================
    //       CORE AIMBOT
    // ===========================
    Enabled: true,
    AimMode: "HitboxLock",
    Sensitivity: "High",
    Smoothing: 0.85,

    // --- Prediction ---
    Prediction: "Kalman",
    PredictionStrength: 1.0,

    // --- Lock ---
    LockOn: true,
    LockStrength: 1.0,
    AimFOV: 360,


    // ======================================================
    //        SHOOT EXACTLY SYSTEM (BẮN CHÍNH XÁC TUYỆT ĐỐI)
    // ======================================================
    ShootExactlyEnabled: true,            // Bật toàn bộ hệ thống bắn chính xác
    ExactHitboxLock: true,                // Khoá đúng hitbox
    ExactHitboxTolerance: 0.00095,        // Độ lệch tối đa
    FramePerfectTrigger: true,            // Bắn đúng frame chuẩn
    TriggerPrecision: 0.000001,           // Mức xác thực 100%
    NoOvershootAim: true,                 // Không vượt head/chest
    MicroAdjustStrength: 0.95,            // Chỉnh vi mô
    AntiSlideAim: true,                   // Không trượt mục tiêu
    HitConfirmFilter: true,               // Xác nhận trúng hitbox
    PixelPerfectHeadAlign: true,          // Align từng pixel
    SubPixelTracking: true,               // Tracking sub-pixel

    AutoFireWhenExact: true,              // Bắn khi đạt chuẩn
    ExactFireDelay: 0.00001,              // Delay siêu nhỏ
    ExactTargetBone: "bone_Head",         // Luôn bắn đầu

    ExactLockVelocityComp: true,          // Bù tốc độ địch
    ExactDistanceCompensation: true,      // Bù khoảng cách
    StabilityBoostOnFire: 1.25,           // Giảm rung khi bắn

    RecoilFreezeOnShot: true,             // Đóng băng recoil
    RecoilReturnToZero: true,             // Trả tâm về trục

    ExactAngleCorrection: 0.0000001,      // Chỉnh góc siêu nhỏ
    ExactSnapCurve: 0.975,                // Snap cong mềm

    BulletTravelPrediction: true,         // Dự đoán đường đạn
    HitboxLagCompensation: true,          // Bù trễ hitbox
    ServerTickAlignment: true,            // Đồng bộ tick

    FireSyncToFrameRate: true,            // Bắn theo FPS
    ExactModeLevel: 3,                    // Perfect Mode


    // ===========================
    //     REAL-TIME TRACKING
    // ===========================
    EnableRealtimeEnemyTracking: true,
    RealtimeTrackingInterval: 0.001,

    MultiEnemyTracking: true,
    PredictEnemyMovement: true,
    PredictivePathCorrection: true,
    PredictiveSmoothing: 0.90,

    EnableDynamicFOV: true,
    FOVAngle: 90,
    MaxLockDistance: 999.0,
    ReactionTime: 0.001,

    AvoidObstacles: true,
    RetreatWhenBlocked: true,


    // ===========================
    //       AUTO FIRE MODULE
    // ===========================
    LockAimToEnemy: true,
    LockToHitbox: true,
    EnableAutoFire: true,
    AutoFireDelay: 0.020,
    AutoFireOnHeadLock: true,
    AutoFireSafeMode: false,


    // ===========================
    //        HITBOX WEIGHTS
    // ===========================
    HeadWeight: 2.0,
    NeckWeight: 1.2,
    ChestWeight: 0.8,
    PelvisWeight: 0.5,

    UseSmartZoneSwitch: true,
    PreferClosestHitbox: true,


    // ===========================
    //    ADAPTIVE AIM SENSITIVITY
    // ===========================
    AdaptiveAimSensitivity: true,
    AimSensitivityHead: 1.0,
    AimSensitivityNeck: 9.0,
    AimSensitivityChest: 40.0,
    AimSensitivityPelvis: 50.55,

    HighSpeedTargetBoost: 100.25,
    CloseRangeSensitivityBoost: 100.9,


    // ===========================
    //      ADVANCED ENEMY AI
    // ===========================
    EnableAdvancedEnemyTactics: true,
    EnemyAwarenessLevel: 0.85,
    PredictiveMovement: 1.0,
    AggressionMultiplier: 1.20,

    UseCoverEffectively: true,
    EvadeProjectiles: true,
    FlankPlayer: 0.70,

    PrioritizeHeadshot: true,
    TeamCoordination: true,
    AdaptiveDifficulty: true,

    AmbushProbability: 0.40,
    RetreatThreshold: 0.25,
    MaxPursuitDistance: 10.0,


    // ===========================
    //        TRACKING TARGET
    // ===========================
    TrackEnemyHead: true,
    TrackEnemyNeck: true,
    TrackEnemyChest: true,
    TrackEnemyRotation: true,
    TrackEnemyVelocity: true,
    TrackCameraRelative: true,

    SnapToBoneAngle: 360.0,
    RotationLockStrength: 999.0,


    // ===========================
    //       KALMAN SMOOTHING
    // ===========================
    UseKalmanFilter: true,
    KalmanPositionFactor: 0.85,
    KalmanVelocityFactor: 0.88,
    NoiseReductionLevel: 0.65,
    JitterFixer: true,
    SmoothTracking: true,


    // ===========================
    //     DYNAMIC BEHAVIOR
    // ===========================
    EnableDynamicGameBehavior: true,
    DynamicAimAdjustment: true,
    DynamicFireRate: true,
    AdaptiveLockPriority: true,

    ThreatAssessmentLevel: 0.85,
    CloseRangeBehaviorBoost: 1.20,
    LongRangeBehaviorPenalty: 0.75,
    LowHealthEnemyFocus: true,

    MultiTargetDistribution: true,
    DynamicFOVScaling: true,


    // ===========================
    //        DEBUG
    // ===========================
    EnableDebugLogs: false,
    LogRealtimeData: false,
    ShowTargetFOV: false,
    ShowEnemyVectors: false
};
   var config = {
        AutoTrackHead: true,
        BuffMultiplier: 3,
        HeadZoneWeight: 2.0,
        EnableLockOn: true,
        LockStrength: 8,
        AutoAimAssist: true,
        TouchSnap: true,
        HeadshotBias: 999.5,
        PriorityZone: "Head",
        RecoilControl: "Enhanced",
        StickyTarget: true,
        MaxSnapLimit: 2.0,
        OvershootFix: true,
        QuickScopeReactionTime: 3,
        RealTimeMovementAimSync: 3,
        SmartTapFireOptimization: 3,
        LowDragFlickMode: 3,
        FeatherTouchAimingSystem: 3,
        AutoFocusTargetAssist: 3,
        DynamicAimFlowControl: 3,
        FastAimLockOnAssist: 3,
        MinimalWeightAimTuning: 3,
        QuickLightAimReset: 3,
        tapDelayReducer: 3,
        virtualKeyResponseFix: true,
        uiLatencyFix: true,
        screenResponseMap: 3,
        tapEventScheduler: 3,
        touchSyncFix: true,
        buttonFeedbackFix: true,
        delayToleranceTune: 3,
        tapQueueOptimize: 3,
        recoilDamping: 3,
        recoilControlFactor: 3,
        recoilPatternFix: true,
        antiRecoilMod: 9999,
        adsRecoilStabilizer: 9999,
        aimRecoilSuppress: true,
        recoilSmoothZone: 3,
        burstRecoilFix: true,
        recoilImpulseBalance: 3,
        adsRecoilCurve: 3,
        renderScale: 3,
        frameRateTarget: 3,
        graphicsPolicy: 3,
        uiFrameSkip: 3,
        animationReduce: 3,
        lowLatencyMode: 3,
        displayFrameHook: 3,
        shaderOptimize: 3,
        gpuThrottleBypass: true,
        renderThreadControl: 3,
        touchSensitivity: 3,
        inputPriority: 3,
        touchZonePrecision: 3,
        gestureTracking: 3,
        tapOptimization: 3,
        inputLagFix: 3,
        adsSensitivityBoost: true,
        aimDragResponse: 3,
        responseTimeOptimizer: 3,
        thermalPolicy: 3,
        cpuBoost: true,
        gpuBoost: true,
        thermalBypass: true,
        batterySaverDisable: 3,
        fpsUncap: 3,
        vsyncBypass: true,
        ultraLightMode: true,
        lowResourceMode: true,
        sensitivity: 8.4,
        aimSmoothnessNear: 0.999999995,
        aimSmoothnessFar: 0.9999999995,
        jitterRange: 0.0,
        recoilCurve: 0.000000015,
        recoilDecay: 0.9999999995,
        triggerFireChance: 1.0,
        aimFov: 360,
        frameRateControl: 144,
        dynamicFrameSkip: 0.55,
        headLockThreshold: 0.0015,
        recoilResetThreshold: 0.00005,
        recoilMaxLimit: 0.0,
        superHeadLock: 5.0,
        lockOnDelay: 0,
        tracking: {
            default: { speed: 2.0, pullRate: 1.0, headBias: 10.0, closeBoost: 10.0 },
            mp40: { speed: 20.0, pullRate: 0.55, headBias: 16.0, closeBoost: 14.0 },
            thompson: { speed: 24.0, pullRate: 0.55, headBias: 15.0, closeBoost: 12.0 },
            ump: { speed: 23.0, pullRate: 0.55, headBias: 15.0, closeBoost: 12.0 },
            m1887: { speed: 999.0, pullRate: 9999.1, headBias: 9999.0, closeBoost: 994.0 },
            m1014: { speed: 17.0, pullRate: 1.1, headBias: 15.0, closeBoost: 13.0 },
            spas12: { speed: 22.0, pullRate: 1.0, headBias: 15.0, closeBoost: 12.0 }
        },
        weaponProfiles: {
            default: { sensitivity: 1.25, recoil: { x: 0.002, y: 0.05 }, fireRate: 600 },
            mp40: { sensitivity: 1.45, recoil: { x: 0.002, y: 0.01 }, fireRate: 850 },
            thompson: { sensitivity: 1.45, recoil: { x: 0.002, y: 0.007 }, fireRate: 800 },
            ump: { sensitivity: 1.45, recoil: { x: 0.002, y: 0.005 }, fireRate: 750 },
            m1887: { sensitivity: 999.35, recoil: { x: 0.01, y: 0.09 }, fireRate: 200 },
            m1014: { sensitivity: 1.35, recoil: { x: 0.01, y: 0.085 }, fireRate: 220 },
            spas12: { sensitivity: 1.3, recoil: { x: 0.01, y: 0.08 }, fireRate: 210 }
        }
    };

   // ================================
    // Default / safe configs (if not provided externally)
    // ================================
    if (typeof config === "undefined") {
        var config = {
            HeadZoneWeight: 1.2,
            LockStrength: 1.1,
            tracking: true,
            autoFire: true
        };
    }

    if (typeof FreeFireConfig === "undefined") {
        var FreeFireConfig = {
            autoHeadLock: { enabled: true, lockOnFire: true, holdWhileMoving: true },
            hipSnapToHead: { enabled: true, instant: true },
            autoAimOnFire: { enabled: true, snapForce: 0.85 },
            perfectHeadshot: { enabled: true, prediction: true },
            stabilizer: { enabled: true, antiShake: true },
            forceHeadLock: { enabled: true },
            aimSensitivity: { enabled: true, base: 1.0, distanceScale: true, closeRange: 1.2, longRange: 0.8, lockBoost: 1.0 }
        };
    }

    // If other modules not defined externally, create minimal stubs so PAC won't crash
    if (typeof AIMBOT_CD === "undefined") {
        var AIMBOT_CD = {
            Vec3: function(x,y,z){ return vec(x,y,z); },
            CD_AIM: function() { return null; }
        };
    }
    if (typeof UltraCD === "undefined") {
        var UltraCD = { UltraCD_AIM: function() { return null; } };
    }
    if (typeof RealTimeAIM === "undefined") {
        var RealTimeAIM = { update: function() {} };
    }
    if (typeof SteadyHoldSystem === "undefined") {
        var SteadyHoldSystem = { Enabled: false, SteadyStrength: 1.0 };
    }
    if (typeof LightHeadDragAssist === "undefined") {
        var LightHeadDragAssist = { Enabled: false, BoneHeadOffsetTrackingLock: vec(-0.0456970781,-0.004478302,-0.0200432576), HeadBiasStrength:1.0, KalmanFactor:0.0 };
    }
    if (typeof HardLockSystem === "undefined") {
        var HardLockSystem = { enabled: false, coreLock: { hardLockStrength: 1.0 }, hyperHeadLock: { enabled: false, boneOffset: vec(0,0,0) } };
    }
    if (typeof ScreenTouchSens === "undefined") {
        var ScreenTouchSens = { EnableScreenSensitivity: false, BaseTouchScale:1.0, DynamicTouchBoost:0.0, MicroControlStrength:1.0, FineTrackingAssist:1.0 };
    }
    if (typeof HeadfixSystem === "undefined") {
        var HeadfixSystem = { EnableHeadFix:false, HeadLockBias:1.0, HeadStickStrength:1.0, MicroCorrection:false, MicroCorrectionStrength:1.0, AntiSlipNeck:false, AntiSlipStrength:1.0, HeadGravity:1.0, VerticalHeadFix:1.0, HorizontalStabilizer:1.0 };
    }
    if (typeof DefaultNeckAimAnchor === "undefined") {
        var DefaultNeckAimAnchor = { Enabled:false, NeckOffset: vec(0,0,0) };
    }
    if (typeof HeadTracking === "undefined") {
        var HeadTracking = { LockStrength:1.0, PredictionFactor:0.0, HeadLeadTime:0.0 };
    }
    if (typeof AimLockHeadSystem === "undefined") {
        var AimLockHeadSystem = { applyAimLock: function(){}, EnableAimLock:false };
    }


  var lastAim = { x: 0, y: 0 };
  var recoilOffset = { x: 0, y: 0 };
  var lastUpdateTime = 0;
  var lastFireTime = 0;
  var lastLockTime = 0;
  var bulletHistory = [];

  var dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  var smooth = (v, p, a) => a * v + (1 - a) * p;
  var randomJitter = () => (Math.random() - 0.5) * config.jitterRange * 2;
  var antiJitterFilter = j => j * 0.003;

var GamePackages = {
    FreeFire: {
        name: "Free Fire",
        package: "com.dts.freefireth"
    },

    FreeFireMAX: {
        name: "Free Fire MAX",
        package: "com.dts.freefiremax"
    },

    // Hàm kiểm tra nhanh
    isSupported: function(pkg) {
        return (
            pkg === this.FreeFire.package ||
            pkg === this.FreeFireMAX.package
        );
    }
};
// =============================================================
//  AIMBOT_CD (có Kalman Lite) – phiên bản PAC-safe
// =============================================================
var AIMBOT_CD = {

    // =========================
    // VECTOR UTILS – CHUẨN HOÁ
    // =========================
    Vec3: function (x, y, z) {
        return { x: x || 0, y: y || 0, z: z || 0 };
    },

    add: function (a, b) {
        return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
    },

    sub: function (a, b) {
        return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
    },

    mul: function (v, m) {
        return { x: v.x * m, y: v.y * m, z: v.z * m };
    },

    // =========================
    //  KALMAN FILTER LITE 2.0
    //  (ỔN ĐỊNH CHO 60–120 FPS)
    // =========================
    KalmanLite: function () {
        return {
            q: 0.0015,   // noise thấp hơn → mượt hơn
            r: 0.025,    // đo nhiễu nhẹ
            x: 0,
            p: 1,
            k: 0,
            update: function (m) {
                this.p += this.q;
                this.k = this.p / (this.p + this.r);
                this.x = this.x + this.k * (m - this.x);
                this.p = (1 - this.k) * this.p;
                return this.x;
            }
        };
    },

    KX: null,
    KY: null,
    KZ: null,

    // ================
    //  INIT SYSTEM
    // ================
    Init: function () {
        this.KX = this.KalmanLite();
        this.KY = this.KalmanLite();
        this.KZ = this.KalmanLite();
    },

    // ====================
    // CONFIG NÂNG CẤP 2.0
    // ====================
    Config: {
        ReactionTime: 1.0,
        RealTimeMovementSync: 1.0,
        SmartTapFire: 1.0,
        LowDragFlick: 1.0,
        FeatherTouchAim: 1.0,
        AutoFocusAssist: 1.0,
        DynamicFlowControl: 1.0,
        FastAimLockOn: 1.0,
        MinimalWeightTuning: 1.0,
        QuickLightReset: 1.0,

        RealTimeSensitivityAdjust: 1.0,
        DynamicTouchScaling: 1.0,
        CrosshairFluidity: 1.0,
        InteractiveSensitivity: 1.0,
        CustomScopeSensitivity: 1.0,
        PrecisionDragSpeed: 1.0,
        ZoomSensitivity: 1.0,
        MotionSensitivityBoost: 1.0,
        SmartGyroCalib: 1.0,
        QuickSensitivityReset: 1.0
    },

    // ==========================================
    //  HANDLE HEAD POSITION + KALMAN + TWEAKERS
    // ==========================================
    ComputeLock: function (enemy) {

        if (!enemy || !enemy.head)
            return this.Vec3(0, 0, 0);

        var h = enemy.head;

        // Lọc nhiễu 3 trục
        var fx = this.KX.update(h.x);
        var fy = this.KY.update(h.y);
        var fz = this.KZ.update(h.z);

        var out = this.Vec3(fx, fy, fz);

        // ===================================
        // FEATHER TOUCH AIM – nhẹ tâm ngắm
        // ===================================
        if (this.Config.FeatherTouchAim === 1) {
            out.x += (h.x - fx) * 0.02;
            out.y += (h.y - fy) * 0.02;
        }

        // ============================
        // FAST AIM LOCK – KHÓA MẶC ĐỊNH
        // ============================
        if (this.Config.FastAimLockOn === 1) {
            out.y += 0.0035;   // nâng nhẹ để tránh lệch đầu khi spam đạn
        }

        return out;
    },

    // ====================
    //  PUBLIC ENTRY POINT
    // ====================
    CD_AIM: function (enemyData) {
        if (!this.KX) this.Init();
        if (!enemyData) return null;

        return this.ComputeLock(enemyData);
    }
};

// =============================================================
//  UltraCD – siêu dính đầu
// =============================================================
var UltraCD = {

    Vec3: function (x, y, z) {
        return { x: x, y: y, z: z };
    },

    // ====== CẤU HÌNH ỔN ĐỊNH ======
    CD_Strength:      1.0,   // lực aim chung
    CD_Gravity:       1.0,   // giảm tụt tâm (anti-gravity)
    CD_AutoLift:      1.0,   // nâng nhẹ đầu (auto head lift)
    CD_Stickiness:    1.0,   // bám mục tiêu
    CD_VerticalFix:   1.0,   // fix dọc
    CD_HorizontalFix: 1.0,   // fix ngang
    CD_AngleLimit:   360.0,  // giới hạn góc anti–giật
    CD_Predict:        1.0,   // dự đoán dịch chuyển đầu

    // ====== HỆ THỐNG ULTRA CORRECTION ======
    UltraCD_AIM: function (enemy) {

        if (!enemy || !enemy.head) 
            return this.Vec3(0, 0, 0);

        var h = enemy.head;

        // ====== KHÔNG NHÂN TOẠ ĐỘ (TRÁNH GIÃN VECTOR) ======
        // Tạo offset thay vì phá vector gốc
        var offX = (this.CD_Strength * this.CD_HorizontalFix) * 0.001;
        var offY = (this.CD_Strength * this.CD_VerticalFix) * 0.001;

        // nâng đầu + chống tụt
        offY += (this.CD_AutoLift * 0.001);
        offY -= (this.CD_Gravity  * 0.001);

        // ====== ÁP OFFSET AN TOÀN ======
        var newX = h.x + offX;
        var newY = h.y + offY;
        var newZ = h.z; // không phá trục Z để aim không lệch xa

        // ====== TÍNH TOÁN PREDICT ======
        if (enemy.velocity && this.CD_Predict > 0) {
            newX += enemy.velocity.x * 0.002 * this.CD_Predict;
            newY += enemy.velocity.y * 0.002 * this.CD_Predict;
            newZ += enemy.velocity.z * 0.002 * this.CD_Predict;
        }

        // ====== GIỚI HẠN GÓC CHỐNG GIẬT ======
        if (Math.abs(newX - h.x) > this.CD_AngleLimit * 0.001) newX = h.x;
        if (Math.abs(newY - h.y) > this.CD_AngleLimit * 0.001) newY = h.y;

        return this.Vec3(newX, newY, newZ);
    }
};


// =============================================================
// RealTimeAIM – mượt + snap nhẹ
// =============================================================
var RealTimeAIM = {

    lastPos: { x: 0, y: 0, z: 0 },

    // Làm mượt chuyển động đầu (anti-shake)
    smoothFactor: 0.90,

    // Độ snap nâng tâm (fix tụt tâm – hỗ trợ kéo vào đầu)
    snapStrength: 0.0,

    update: function(head) {
        // Vị trí hiện tại
        var lx = this.lastPos.x;
        var ly = this.lastPos.y;
        var lz = this.lastPos.z;

        // Sai lệch giữa frame trước và hiện tại
        var dx = head.x - lx;
        var dy = head.y - ly;
        var dz = head.z - lz;

        // Smooth (lọc rung)
        var sx = lx + dx * this.smoothFactor;
        var sy = ly + dy * this.smoothFactor;
        var sz = lz + dz * this.smoothFactor;

        // Snap dọc trục Y (nhẹ – không giật)
        sy += this.snapStrength;

        // Cập nhật vị trí cuối
        this.lastPos = { x: sx, y: sy, z: sz };

        return { x: sx, y: sy, z: sz };
    }
};
//
//  ====== ENHANCED DRAG & HEADLOCK SYSTEM FOR PAC ======
//  Tất cả module được gộp lại full PAC-compatible
//

var localPlayer = {
    isDragging: false,
    crosshair: {
        position: { x: 0, y: 0, z: 0 },
        lockedBone: null
    }
};

var HeadLockAutoAim = {
    currentTarget: null
};

//
//  ------ 1. NoOverHeadDrag ------
//
var NoOverHeadDragLock = {
    enabled: true,
    headBone: "bone_Head",

    // Giới hạn không cho vượt quá đầu
    clampYOffset: 0.0,

    // Offset & rotation nếu engine cần
    boneOffset: { x: -0.0456970781, y: -0.004478302, z: -0.0200432576 },
    rotationOffset: { x: 0.0258174837, y: -0.08611039, z: -0.1402113, w: 0.9860321 },
    scale: { x: 1.0, y: 1.0, z: 1.0 },

    // Hệ số làm mượt (anti–jerk)
    smoothFactor: 0.35,

    apply: function(player, enemy) {
        if (!this.enabled || !enemy || !enemy.isAlive) return;

        var aimPos  = player.crosshair.position;
        var headPos = enemy.getBonePosition(this.headBone);

        var maxY = headPos.y + this.clampYOffset;

        // Nếu vượt Y đầu → clamp + smooth để không giật
        if (aimPos.y > maxY) {
            var newY = aimPos.y + (maxY - aimPos.y) * this.smoothFactor;

            player.crosshair.position = {
                x: aimPos.x,  // Không đụng X/Z → giữ drag tự nhiên
                y: newY,
                z: aimPos.z
            };
        }
    }
};

//
//  ------ 2. DragHeadLockStabilizer ------
//
//=============================================================
//  DRAG HEADLOCK STABILIZER – ULTRA STABLE VERSION
//=============================================================

var AutoDragHeadLockStabilizer = {

    enabled: true,
    headBone: "bone_Head",

    // Offset chuẩn trong Free Fire
    boneOffset: { x:-0.0456970781, y:-0.004478302, z:-0.0200432576 },
    rotationOffset: { x:0.02581748, y:-0.08611039, z:-0.1402113, w:0.9860321 },
    scale: { x:1, y:1, z:1 },

    // Lock zone siêu chính xác
    lockZone: {
        toleranceX: 0.001,
        toleranceY: 0.001
    },

    // Hút nhẹ để giúp drag chạm đầu rồi tự ghim
    magneticStrength: 0.18,      

    // Chống rung khi đã dính đầu
    stabilizerStrength: 0.92,    

    // Bù FPS cao
    fpsCompensation: true,

    //============================================
    //  Smooth helper
    //============================================
    _smooth: function(cur, target, s) {
        return cur + (target - cur) * s;
    },

    //============================================
    //  MAIN STABILIZE FUNCTION
    //============================================
    stabilize: function(player, enemy, dt) {
        if (!this.enabled || !enemy || !enemy.isAlive) return;

        var aim = player.crosshair.position;
        var head = enemy.getBonePosition(this.headBone);

        //===========================
        // 1. Kiểm tra độ lệch
        //===========================
        var dx = Math.abs(aim.x - head.x);
        var dy = Math.abs(aim.y - head.y);

        //===========================
        // 2. Nếu trong vùng drag → kéo về đầu (hút nhẹ)
        //===========================
        if (dx < this.lockZone.toleranceX && dy < this.lockZone.toleranceY) {

            var pull = this.magneticStrength;

            if (this.fpsCompensation) {
                // FPS cao → giảm pull để tránh rung
                pull = Math.min(1.0, pull + dt * 30);
            }

            var newX = this._smooth(aim.x, head.x, pull);
            var newY = this._smooth(aim.y, head.y, pull);
            var newZ = this._smooth(aim.z, head.z, pull);

            //===========================
            // 3. Khi đã dính đầu → ổn định cao
            //===========================
            newX = this._smooth(newX, head.x, this.stabilizerStrength);
            newY = this._smooth(newY, head.y, this.stabilizerStrength);
            newZ = this._smooth(newZ, head.z, this.stabilizerStrength);

            player.crosshair.position = { x:newX, y:newY, z:newZ };
            player.crosshair.lockedBone = this.headBone;
            return;
        }

        //===========================
        // 4. Nếu chưa chạm head → hỗ trợ kéo lên (magnetic assist)
        //===========================
        if (dx < this.lockZone.toleranceX * 2.5) {
            player.crosshair.position.x = this._smooth(
                aim.x, head.x, this.magneticStrength * 0.5
            );
        }

        if (dy < this.lockZone.toleranceY * 2.5) {
            player.crosshair.position.y = this._smooth(
                aim.y, head.y, this.magneticStrength * 0.5
            );
        }
    }
};
//  ------ 3. SmartBoneAutoHeadLock ------

//=============================================================
//    SMART BONE AUTO HEADLOCK – ULTRA STABLE REBUILD
//    (Không rung – Không lệch – Không khóa sai xương)
//=============================================================

var SmartBoneAutoHeadLockBox = {

    enabled: true,
    mode: "aggressive",     // "legit" / "aggressive"

    // Các bone kích hoạt khi ngắm trúng vùng cổ-ngực
    triggerBones: [
        "bone_LeftClav",
        "bone_RightClav",
        "bone_Neck",
        "bone_Hips"
    ],

    headBone: "bone_Head",

    // Offset chuẩn của bone Head trong Free Fire
    headOffset: { 
        x: -0.0456970781, 
        y: -0.004478302, 
        z: -0.0200432576 
    },

    rotationOffset: { 
        x: 0.02581748, 
        y: -0.08611039, 
        z: -0.1402113, 
        w: 0.9860321 
    },

    scale: { x:1, y:1, z:1 },

    // ================= NORMAL MODE =================
    config_normal: {
        lockTolerance:      0.022,      // khoảng cách crosshair-bone để auto lock
        maxDistDiff:        0.0048,     // chênh lệch khoảng cách bone-head
        maxRotDiff:         0.0025,     // sai khác quaternion
        maxYOffset:         0.0         // không kéo lệch trục Y
    },

    // ================= AGGRESSIVE MODE =================
    config_aggressive: {
        lockTolerance:      0.0001,     // siêu nhạy, chạm là khóa
        maxDistDiff:        0.0018,
        maxRotDiff:         0.001,
        maxYOffset:         0.0
    },

    //---------------------------------------------------------
    //  GET CURRENT CONFIG (auto select by mode)
    //---------------------------------------------------------
    getConfig: function() {
        return (this.mode === "aggressive")
            ? this.config_aggressive
            : this.config_normal;
    },

    //---------------------------------------------------------
    //  MAIN HEADLOCK FUNCTION
    //---------------------------------------------------------
    checkAndLock: function(player, enemy) {
        if (!this.enabled || !enemy || !enemy.isAlive) return;

        var cfg = this.getConfig();
        var aim  = player.crosshair.position;
        var head = enemy.getBonePosition(this.headBone);
        var headRot = enemy.getBoneData(this.headBone).rotation;

        //=====================================================
        //  DUYỆT QUA CÁC BONE KÍCH HOẠT
        //=====================================================
        for (var i = 0; i < this.triggerBones.length; i++) {

            var boneName = this.triggerBones[i];
            var bonePos  = enemy.getBonePosition(boneName);
            var boneData = enemy.getBoneData(boneName);

            //-------------------------------------------------
            // 1. Khoảng cách giữa bone và head (để nhận dạng đúng phong dáng)
            //-------------------------------------------------
            var distDiff = Math.sqrt(
                Math.pow(bonePos.x - head.x, 2) +
                Math.pow(bonePos.y - head.y, 2) +
                Math.pow(bonePos.z - head.z, 2)
            );

            if (distDiff > cfg.maxDistDiff) continue;

            //-------------------------------------------------
            // 2. Rotation DOT check (so sánh quaternion)
            //-------------------------------------------------
            var dot =
                headRot.x * boneData.rotation.x +
                headRot.y * boneData.rotation.y +
                headRot.z * boneData.rotation.z +
                headRot.w * boneData.rotation.w;

            var rotDiff = 1 - Math.abs(dot);
            if (rotDiff > cfg.maxRotDiff) continue;

            //-------------------------------------------------
            // 3. Crosshair phải nằm gần bone “kích hoạt”
            //-------------------------------------------------
            var dx = Math.abs(aim.x - bonePos.x);
            var dy = Math.abs(aim.y - bonePos.y);

            if (dx > cfg.lockTolerance || dy > cfg.lockTolerance)
                continue;

            //-------------------------------------------------
            // 4. Anti-Y-Overshoot (ngăn khóa lệch xuống cổ)
            //-------------------------------------------------
            var fixedY = (aim.y + cfg.maxYOffset < head.y)
                ? aim.y + cfg.maxYOffset
                : head.y;

            //-------------------------------------------------
            // 5. LOCK TO HEAD – Chuẩn tuyệt đối
            //-------------------------------------------------
            player.crosshair.position = {
                x: head.x,
                y: fixedY,
                z: head.z
            };

            player.crosshair.lockedBone = this.headBone;
            return;
        }
    }
};
// ===============================
//  BulletDeviationCorrector
//  Fix lỗi "tâm đúng đầu nhưng đạn lệch"
// ===============================
//=====================================================
//   BULLET DEVIATION CORRECTOR – REBUILD VERSION
//   Không rung – Không lệch – Không vượt đầu
//=====================================================

var BulletDeviationCorrector = {

    Enabled: true,

    //==================
    // HỆ SỐ CHUẨN HÓA
    //==================
    CorrectionForce:    999.0,      // lực kéo bù lệch (siêu nhạy)
    VerticalPull:       0.0025,     // luôn kéo đạn không rơi
    HorizontalPull:     0.0015,     // kéo đạn không lệch trái/phải
    SmoothFactor:       0.12,       // mượt hoá (0 = cứng, 1 = mềm)

    //==================
    // KHÔNG CHO ĐẠN VƯỢT ĐẦU
    //==================
    MaxAngleFix:        4.5,        // góc lệch tối đa có thể sửa
    AntiOverShoot:      0.82,       // giảm lố / giật tâm

    //==================
    // TẢN ĐẠN TỰ NHIÊN
    //==================
    BaseSpread:         0.0010,
    FireKickSpread:     0.0020,

    //=====================================================
    //    CORE FUNCTION – AUTO FIX ĐẠN BAY LỆCH KHI NGẮM
    //=====================================================
    applyCorrection: function(headPos, player, weaponState) {
        if (!this.Enabled || !headPos) return headPos;

        //-------------------------------------------------
        //   VECTORS
        //-------------------------------------------------
        var dx = headPos.x - player.x;
        var dy = headPos.y - player.y;
        var dz = headPos.z - player.z;

        var dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        if (dist < 0.001) return headPos;

        //-------------------------------------------------
        //   TÍNH GÓC LỆCH – kiểm soát sửa lệch an toàn
        //-------------------------------------------------
        var angleError = Math.abs(dx) + Math.abs(dy);
        if (angleError > this.MaxAngleFix) {
            // lệch quá lớn → không sửa để tránh rung
            return headPos;
        }

        //-------------------------------------------------
        //   AUTO SPREAD (vũ khí tự tăng tản khi bắn)
        //-------------------------------------------------
        var spread = this.BaseSpread;
        if (weaponState && weaponState.isFiring)
            spread += this.FireKickSpread;

        //-------------------------------------------------
        //   TÍNH BÙ LỆCH ĐẠN
        //-------------------------------------------------
        var fixX = dx + (this.HorizontalPull * spread * this.CorrectionForce);
        var fixY = dy + (this.VerticalPull   * spread * this.CorrectionForce);
        var fixZ = dz;

        //-------------------------------------------------
        //  SMOOTHING – mượt, không rung giật
        //-------------------------------------------------
        fixX = fixX * (1 - this.SmoothFactor) + dx * this.SmoothFactor;
        fixY = fixY * (1 - this.SmoothFactor) + dy * this.SmoothFactor;
        fixZ = fixZ * (1 - this.SmoothFactor) + dz * this.SmoothFactor;

        //-------------------------------------------------
        //  ANTI OVERSHOOT v3 – giữ tâm không vượt qua đầu
        //-------------------------------------------------
        fixX *= this.AntiOverShoot;
        fixY *= this.AntiOverShoot;

        //-------------------------------------------------
        //  TRẢ LẠI TOẠ ĐỘ MỚI CHUẨN HƠN
        //-------------------------------------------------
        return {
            x: player.x + fixX,
            y: player.y + fixY,
            z: player.z + fixZ
        };
    }
};

    var AutoAimNeckConfig = {
        name: "AimNeckSystem",
        enabled: true,
        config: {
            sensitivity: 9.0,
            lockSpeed: 1.0,
            prediction: true,
            tracking: true,
            fov: 360,
            autoFire: true,
            aimBone: "bone_Neck",
            headAssist: true,
            screenTapEnabled: true,
            clamp: { minY: 0, maxY: 0 },
            boneOffset: { x: -0.0456970781, y: -0.004478302, z:  -0.0200432576 }
        }
    };

    // ================================
    // Race config (safe)
    // ================================
    var RaceConfig = {
        raceName: "BaseMale",
        headBone: "bone_Head",
        bodyBones: ["bone_Chest","bone_Spine","bone_Legs","bone_Feet"],
        sensitivity: 999.0,
        height: 2.0,
        radius: 0.25,
        mass: 50.0
    };

    // ================================
    // AIM SYSTEM (lightweight)
    // ================================
    var AimSystem = {
        getBonePos: function(enemy, bone) {
            if (!enemy || !enemy.bones) return vec(0,0,0);
            return enemy.bones[bone] || vec(0,0,0);
        },

        lockToHead: function(player, enemy) {
            var head = this.getBonePos(enemy, RaceConfig.headBone);
            var dir = vNorm(vSub(head, player.position));
            player.crosshairDir = dir;
        },

        applyRecoilFix: function(player) {
            var fix = 0.1;
            player.crosshairDir = vNorm(vAdd(player.crosshairDir, vec(0,-fix,0)));
        },

        adjustDrag: function(player, targetBone) {
            var sens = 1.0;
            if (targetBone === "head") sens *= 1.0;
            if (targetBone === "body") sens *= 1.0;
            player.dragForce = sens;
        },

        // Neck helpers (adapted to PAC style, no ES6)
        detectNeckTarget: function(enemies) {
            var out = [];
            for (var i=0;i<enemies.length;i++) {
                var e = enemies[i];
                if (e && e.isVisible && e.health > 0) {
                    var base = (e.bones && e.bones[AimNeckConfig.config.aimBone]) ? e.bones[AimNeckConfig.config.aimBone] : e.position || vec(0,0,0);
                    out.push({ enemy: e, neckPos: base });
                }
            }
            return out;
        },

        getBonePosition: function(enemy, bone) {
            var base = (enemy.bones && enemy.bones[bone]) ? enemy.bones[bone] : enemy.position || vec(0,0,0);
            return {
                x: base.x + AimNeckConfig.config.boneOffset.x,
                y: base.y + AimNeckConfig.config.boneOffset.y,
                z: base.z + AimNeckConfig.config.boneOffset.z
            };
        },

        predictNeckPosition: function(target) {
            var velocity = (target.enemy && target.enemy.velocity) ? target.enemy.velocity : { x:0, y:0, z:0 };
            return {
                x: target.neckPos.x + velocity.x * 0.1,
                y: target.neckPos.y + velocity.y * 0.1,
                z: target.neckPos.z + velocity.z * 0.1
            };
        },

        calculateAimDirection: function(playerPos, targetPos) {
            return { x: targetPos.x - playerPos.x, y: targetPos.y - playerPos.y, z: targetPos.z - playerPos.z };
        },

        screenTapTo: function(targetPos) {
            // PAC cannot touch screen — mark moved flag
            if (targetPos) targetPos.moved = true;
        },

        applyAimLock: function(direction) {
            // PAC: mock apply
            return direction;
        },

        run: function(player, enemies) {
            if (!this.enabled) return;
            var targets = this.detectNeckTarget(enemies);
            if (targets.length === 0) return;

            var target = targets[0];
            var lockPos = (this.config.prediction) ? this.predictNeckPosition(target) : target.neckPos;
            var dir = this.calculateAimDirection(player.position, lockPos);

            if (this.config.headAssist) {
                if (dir.y > this.config.clamp.maxY) dir.y = this.config.clamp.maxY;
                if (dir.y < this.config.clamp.minY) dir.y = this.config.clamp.minY;
            }

            this.applyAimLock(dir);
            this.screenTapTo(lockPos);
        },

        enabled: AimNeckConfig.enabled,
        config: AimNeckConfig.config
    };

    var HeadAntiDrop = {
    enabled: true,
    headBone: "bone_Head",
    lockTolerance: 0.018,     // độ lệch cho phép để xem như “đã dính đầu”
    clampYOffset: 0.0,        // không cho rớt dưới đầu
    isHeadLocked: true // trạng thái đã dính đầu
};

var HeadAntiDropSystem = {
    enabled: true,
    headBone: "bone_Head",

    // Strong Anti-Drop
    strongMode: true,        // y <= head → kéo lên ngay
    clampYOffset: 0.0,       // không cho vượt đầu

    // Head Gravity Cancel
    gravityCancelStrength: 1.0,

    // Vertical Stick Boost (kéo Y mạnh hơn X)
    verticalBoost: 1.65,
    verticalBoostActive: true,

    // Predictive AntiDrop
    predictiveStrength: 1.0,
    predictSamples: 3,

    // Lock state
    isHeadLocked: true,
    lockTolerance: 0.016
};

// Lưu velocity Y
var headVelBuffer = [];
var UltraMagneticHeadLock = {
    enabled: true,
    headBone: "bone_Head",

    // Lực hút nam châm
    baseMagnetPower: 2.4,
    distanceBoost: 1.2,
    errorBoost: 2.0,

    // Phạm vi để bật nam châm
    magnetRadius: 360.0,

    // Tăng lực khi enemy xoay nhanh
    rotationBoostFactor: 999.0,

    // Khi đã hút → tăng lực giữ
    stickWhenLocked: true,
    lockStickStrength: 10.0,

    // Lock state
    headLocked: true,

    // kiểm tra lock
    checkLock: function(cross, head) {
        var dx = abs(cross.x - head.x);
        var dy = abs(cross.y - head.y);
        var dist = sqrt(dx*dx + dy*dy);

        if (dist < this.magnetRadius) {
            this.headLocked = true;
        }
    },

    apply: function(player, enemy) {
        if (!this.enabled || !enemy.isAlive) return;

        var head = enemy.getBone(this.headBone);
        var cross = Crosshair;

        this.checkLock(cross, head);

        var dx = head.x - cross.x;
        var dy = head.y - cross.y;

        var distance = sqrt(dx*dx + dy*dy);
        if (distance > this.magnetRadius) return;

        // Lực hút theo sai số vị trí
        var errorForce = distance * this.errorBoost;

        // Lực hút theo khoảng cách giữa player và enemy
        var dist3D = enemy.distanceTo(player);
        var distForce = dist3D * this.distanceBoost;

        // Lấy tốc độ xoay enemy
        var rot = enemy.getBoneRotation(this.headBone);
        var rotationForce = (abs(rot.x) + abs(rot.y) + abs(rot.z)) * this.rotationBoostFactor;

        // Tổng lực nam châm
        var magnetPower =
            this.baseMagnetPower +
            errorForce +
            distForce +
            rotationForce;

        // Nếu đã lock → stick mạnh hơn
        if (this.headLocked && this.stickWhenLocked) {
            magnetPower *= this.lockStickStrength;
        }

        // Áp dụng lực hút
        cross.x += dx * magnetPower;
        cross.y += dy * magnetPower;
    }
};
var HeadRotationCompensation = {
    enabled: true,
    headBone: "bone_Head",

    rotationSensitivity: 1.4,
    maxCompensation: 0.012,

    previousRotation: {x:0,y:0,z:0,w:1},

    apply: function(enemy) {
        if (!this.enabled || !enemy.isAlive) return;

        var cross = Crosshair;
        var current = enemy.getBoneRotation(this.headBone);

        // Sai số quaternion
        var dx = current.x - this.previousRotation.x;
        var dy = current.y - this.previousRotation.y;
        var dz = current.z - this.previousRotation.z;

        // Độ xoay → dịch chuyển điểm mặt
        var compensationX = clamp(dx * this.rotationSensitivity, -this.maxCompensation, this.maxCompensation);
        var compensationY = clamp(dy * this.rotationSensitivity, -this.maxCompensation, this.maxCompensation);

        cross.x += compensationX;
        cross.y += compensationY;

        // Lưu trạng thái xoay
        this.previousRotation = current;
    }
};
var HeadMicroPredict = {
    enabled: true,
    headBone: "bone_Head",

    predictStrength: 0.012,   // độ dự đoán micro
    maxPredict: 0.001,        // giới hạn an toàn

    previous: {x:0,y:0,z:0,w:1},
    lastTime: 0,

    apply: function(player, enemy) {
        if (!this.enabled || !enemy.isAlive) return;

        var cross = Crosshair;
        var rot = enemy.getBoneRotation(this.headBone);

        var now = system.time();
        var dt = now - this.lastTime;
        if (dt <= 0.0) dt = 0.016;

        // quaternion delta
        var dx = (rot.x - this.previous.x) / dt;
        var dy = (rot.y - this.previous.y) / dt;

        // dx = enemy quay trái/phải
        // dy = enemy cúi/ngửa đầu

        var predictX = dx * this.predictStrength;
        var predictY = dy * this.predictStrength;

        predictX = clamp(predictX, -this.maxPredict, this.maxPredict);
        predictY = clamp(predictY, -this.maxPredict, this.maxPredict);

        cross.x += predictX;
        cross.y += predictY;

        this.previous = rot;
        this.lastTime = now;
    }
};
var AdvancedHeadAssist = {
    AntiSideSlipStrength: 0.65,
    MicroPredictGain: 0.35,
    BreakPredictShield: 0.5,
    AirborneStabilizerGain: 0.8,
    OverDragCorrectGain: 0.55,

    lastVel: {x:0,y:0,z:0},
    lastHead: {x:0,y:0,z:0},
    lastDirSign: 0,

    updateHeadLock: function(enemy, headPos, dt) {

        var vx = enemy.velocity.x;
        var vy = enemy.velocity.y;
        var vz = enemy.velocity.z;

        var dx = headPos.x - this.lastHead.x;
        var dz = headPos.z - this.lastHead.z;

        // -------------------------------
        // ⭐ 1. Anti-SideSlip (không trượt ngang)
        // Giảm sai lệch theo hướng X – Z
        // -------------------------------
        var sideSlipFixX = -(vx - this.lastVel.x) * this.AntiSideSlipStrength;
        var sideSlipFixZ = -(vz - this.lastVel.z) * this.AntiSideSlipStrength;

        headPos.x += sideSlipFixX;
        headPos.z += sideSlipFixZ;

        // -------------------------------
        // ⭐ 2. Head Micro-Predict (dự đoán micro xoay mặt)
        // -------------------------------
        var microX = dx * this.MicroPredictGain;
        var microZ = dz * this.MicroPredictGain;

        headPos.x += microX;
        headPos.z += microZ;

        // -------------------------------
        // ⭐ 3. Anti-Predict Break
        // chống enemy đổi hướng đột ngột
        // -------------------------------
        var dirNow = Math.sign(vx);
        if (dirNow !== this.lastDirSign && this.lastDirSign !== 0) {
            // Enemy đổi hướng nhanh → giảm tốc độ lock trong 60–120ms
            headPos.x = headPos.x * (1 - this.BreakPredictShield);
        }
        this.lastDirSign = dirNow;

        // -------------------------------
        // ⭐ 4. Airborne Head Stabilizer
        // giữ đầu khi enemy bật nhảy
        // -------------------------------
        if (vy > 0.25) {  
            headPos.y += vy * this.AirborneStabilizerGain;
        }

        // -------------------------------
        // ⭐ 5. Fix Drag Lố Đầu
        // khi drag vượt quá → kéo về đúng điểm
        // -------------------------------
        var diffY = headPos.y - this.lastHead.y;

        if (diffY > 0.045) { 
            // Drag lên quá nhanh → giảm
            headPos.y -= diffY * this.OverDragCorrectGain;
        }

        // Lưu lại cho frame tiếp theo
        this.lastVel.x = vx;
        this.lastVel.y = vy;
        this.lastVel.z = vz;

        this.lastHead.x = headPos.x;
        this.lastHead.y = headPos.y;
        this.lastHead.z = headPos.z;

        return headPos;
    }
};
// ================================
    // AutoHeadLock module (light)
    // ================================
    var AutoHeadLock = {
        kx: KalmanLite(),
        ky: KalmanLite(),
        kz: KalmanLite(),

        getBone: function(enemy, boneName) {
            if (!enemy || !enemy.bones) return vec(0,0,0);
            return enemy.bones[boneName] || vec(0,0,0);
        },

        detectClosestBone: function(player, enemy) {
            var min = 999999, closest = null;
            var allBones = [RaceConfig.headBone].concat(RaceConfig.bodyBones);
            for (var i=0;i<allBones.length;i++) {
                var b = allBones[i];
                var pos = this.getBone(enemy, b);
                var dist = vMag(vSub(pos, player.position));
                if (dist < min) { min = dist; closest = b; }
            }
            return closest;
        },

        detectTarget: function(enemies, playerPos) {
            var list = [];
            for (var i=0;i<enemies.length;i++) {
                var e = enemies[i];
                if (e && e.isVisible && e.health > 0) list.push(e);
            }
            // simple sort by distance to playerPos
            list.sort(function(a,b){
                var da = vMag(vSub((a.position||vec(0,0,0)), playerPos));
                var db = vMag(vSub((b.position||vec(0,0,0)), playerPos));
                return da - db;
            });
            return list;
        },

        lockTarget: function(target) {
            if (!target) return;
            var pos = this.getBone(target, RaceConfig.headBone);
            // mark locked (PAC mock)
            target.locked = true;
            target.lockPos = pos;
        },

        updateTargetPosition: function(target) {
            if (!target) return;
            var predicted = this.predictPosition(target);
            target.lockPos = predicted;
        },

        predictPosition: function(target) {
            var velocity = target.velocity || {x:0,y:0,z:0};
            return {
                x: target.position.x + velocity.x * 0.1,
                y: target.position.y + velocity.y * 0.1,
                z: target.position.z + velocity.z * 0.1
            };
        },

        applyHeadClamp: function(pos) {
            var off = (this.config && this.config.boneOffset) ? this.config.boneOffset : { x:0,y:0,z:0 };
            return { x: pos.x + off.x, y: pos.y + off.y, z: pos.z + off.z };
        },

        detectTargetSimple: function(enemies, playerPos) {
            // wrapper to keep naming consistent
            return this.detectTarget(enemies, playerPos);
        },

        // config used by AutoHeadLock
        config: { boneOffset: { x: 0, y: 0.0, z: 0 }, prediction: true }
    };


function Vec2(x, y) {
    return { x: x || 0, y: y || 0 };
}
function vAdd(a, b) { return Vec2(a.x + b.x, a.y + b.y); }
function vSub(a, b) { return Vec2(a.x - b.x, a.y - b.y); }
function vMul(a, s) { return Vec2(a.x * s, a.y * s); }

// ===== KALMAN FILTER (ANTI-RUNG) =====
function Kalman() {
    return {
        q: 0.0008,
        r: 0.05,
        x: 0,
        p: 1,
        k: 0,
        update: function(measure) {
            this.k = this.p / (this.p + this.r);
            this.x = this.x + this.k * (measure - this.x);
            this.p = (1 - this.k) * this.p + this.q;
            return this.x;
        }
    };
}

// Kalman instances
var kx = Kalman();
var ky = Kalman();

// ===== CROSSHAIR STATE =====
var Crosshair = Vec2(0, 0);
var SmoothedCrosshair = Vec2(0, 0);

// ===== HEADLOCK CONFIG =====
var CONFIG = {
    // điều khiển chính
    sensitivity: 1.35,
    snapStrength: 0.85,
    maxDelta: 12,            // chống lố đầu
    headSize: 0.75,          // khóa đúng xương đầu

    // ổn định
    jitterReduction: 0.55,   // fix rung FPS cao
    antiJitter: 0.58,

    // lực hút & kéo
    lightAimForce: 1.0,      // hút nhẹ vào đầu
    dragAssistBoost: 1.16,   // trợ lực khi vuốt nhanh
    distanceWeakening: 0.75, // gần head giảm lực

    // vùng ổn định
    headBox: 0.9             // vùng "ổn định" để auto-fire
};

function lightAimAssist(delta) {

    // lực nhẹ theo hướng đầu
    let pullX = delta.x * CONFIG.lightAimForce;
    let pullY = delta.y * CONFIG.lightAimForce;

    // nếu drag nhanh → tăng phụ trợ
    if (Math.abs(delta.x) > 10 || Math.abs(delta.y) > 10) {
        pullX *= (1 + CONFIG.dragAssistBoost);
        pullY *= (1 + CONFIG.dragAssistBoost);
    }

    // khi gần head → giảm lực để tránh trượt qua
    if (Math.abs(delta.x) < 5 && Math.abs(delta.y) < 5) {
        pullX *= CONFIG.distanceWeakening;
        pullY *= CONFIG.distanceWeakening;
    }

    return Vec2(pullX, pullY);
}


// =====================

// ===== AUTO-LOCK MAIN =====
function autoLockHead(head) {
    if (!head) return;

    // 1) tính Δ tâm → head
    let delta = vSub(head, Crosshair);

    // 2) giới hạn để tránh lố đầu
    delta.x = Math.max(-CONFIG.maxDelta, Math.min(CONFIG.maxDelta, delta.x));
    delta.y = Math.max(-CONFIG.maxDelta, Math.min(CONFIG.maxDelta, delta.y));

    // 3) Kalman chống rung FPS cao
    let sx = kx.update(delta.x);
    let sy = ky.update(delta.y);

    // 4) Light Aim Assist
    let assist = lightAimAssist(delta);

    // 5) tổng hợp lực (snap + assist + antiJitter)
    Smooth = vAdd(
        Crosshair,
        Vec2(
            sx * CONFIG.snapStrength + assist.x * CONFIG.antiJitter,
            sy * CONFIG.snapStrength + assist.y * CONFIG.antiJitter
        )
    );

    Crosshair = Smooth;

    // 6) auto-fire khi tâm nằm trong headbox
    if (Math.abs(sx) < CONFIG.headBox && Math.abs(sy) < CONFIG.headBox) {
        $trigger("tap");
    }
}








/* ============================================================
   ULTRA STICKY DRAG HEAD LOCK
   – Không trượt ngang
   – Không tụt cổ/ngực
   – Tự hút đầu khi drag
   ============================================================ */
var UltraStickyDragHeadLock = {
    enabled: true,
    headBone: "bone_Head",

    maxYOffset: 0.0,
    maxSideSlip: 0.00001,

    stickStrength: 999.5,
    velocityPredictScale: 0.05,
    rotationInfluence: 0.65,

    apply(player, enemy) {
        if (!this.enabled || !enemy || !enemy.isAlive) return;

        const aim = player.crosshair.position;
        const head = enemy.getBonePosition(this.headBone);
        const rot  = enemy.getBoneRotation(this.headBone) || {x:0,y:0,z:0,w:1};
        const vel  = enemy.velocity || {x:0,y:0,z:0};

        // ----- Predict vị trí đầu -----
        const predicted = {
            x: head.x + vel.x * this.velocityPredictScale,
            y: head.y + vel.y * this.velocityPredictScale,
            z: head.z + vel.z * this.velocityPredictScale
        };

        // ----- Khử trượt 2 bên -----
        let dx = predicted.x - aim.x;
        if (Math.abs(dx) < this.maxSideSlip) dx = 0;

        // ----- Giữ không vượt đầu -----
        const targetY = Math.min(predicted.y, head.y + this.maxYOffset);
        const dy = targetY - aim.y;

        // ----- Compensation khi đầu quay -----
        const rotGain = (rot.x + rot.y + rot.z) * this.rotationInfluence;

        // ----- Sticky Head Lock -----
        player.crosshair.position = {
            x: aim.x + dx * this.stickStrength,
            y: aim.y + dy * this.stickStrength + rotGain,
            z: aim.z
        };

        player.crosshair.lockedBone = this.headBone;
    }
};


/* ============================================================
   ANTI OVER DRAG – KHÔNG VƯỢT ĐẦU
   – Giảm tốc khi drag nhanh
   – Bù xoay đầu + velocity
   ============================================================ */
var AntiOverDragHeadFix = {
    enabled: true,
    headBone: "bone_Head",

    maxYOffset: 0.0,
    fastDragSpeed: 0.015,
    dragDamping: 0.65,
    rotationComp: 0.22,
    velocityPredict: 0.18,

    lastDragX: 0,
    lastDragY: 0,
    lastTime: Date.now(),

    apply(player, enemy) {
        if (!this.enabled || !enemy || !enemy.isAlive) return;

        const head = enemy.getBonePosition(this.headBone);
        const aim  = player.crosshair.position;

        const now = Date.now();
        const dt = (now - this.lastTime) || 1;

        const dx = aim.x - this.lastDragX;
        const dy = aim.y - this.lastDragY;

        const dragSpeed = Math.sqrt(dx*dx + dy*dy) / dt;

        this.lastTime = now;
        this.lastDragX = aim.x;
        this.lastDragY = aim.y;

        // ----- Clamp Y không vượt đầu -----
        if (aim.y > head.y + this.maxYOffset) {
            aim.y = head.y + this.maxYOffset;
        }

        // ----- Giảm tốc nếu drag quá nhanh -----
        if (dragSpeed > this.fastDragSpeed) {
            aim.x = head.x + (aim.x - head.x) * this.dragDamping;
            aim.y = head.y + (aim.y - head.y) * this.dragDamping;
        }

        // ----- Bù xoay đầu -----
        const rot = enemy.rotation || {x:0,y:0,z:0,w:1};
        aim.x += rot.y * this.rotationComp;
        aim.y += rot.x * this.rotationComp;

        // ----- Bù velocity -----
        const vel = enemy.velocity || {x:0,y:0,z:0};
        aim.x += vel.x * this.velocityPredict;
        aim.y += vel.y * this.velocityPredict;

        player.crosshair.position = aim;
    }
};


/* ============================================================
   HOLD CROSSHAIR ON HEAD – Giữ tâm sau khi bắn
   ============================================================ */
var HoldCrosshairOnHead = {
    enabled: true,
    headBone: "bone_Head",

    holdStrength: 999.0,
    maxDistance: 360.0,
    fireHoldTime: 120,

    lastFireTime: 0,

    fireEvent() {
        this.lastFireTime = Date.now();
    },

    apply(player, enemy) {
        if (!this.enabled || !enemy || !enemy.isAlive) return;

        const now = Date.now();
        if (now - this.lastFireTime > this.fireHoldTime) return;

        const aim = player.crosshair.position;
        const head = enemy.getBonePosition(this.headBone);

        const dx = head.x - aim.x;
        const dy = head.y - aim.y;
        const dz = head.z - aim.z;

        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        if (dist > this.maxDistance) return;

        player.crosshair.position = {
            x: aim.x + dx * this.holdStrength,
            y: aim.y + dy * this.holdStrength,
            z: aim.z + dz * this.holdStrength
        };
    }
};


/* ============================================================
   AUTO RE-AIM – Tự kéo lại khi lệch khỏi head
   ============================================================ */
var AutoReAim = {
    enable: 1,
    correctionSpeed: 1.85,
    smooth: 0.82,
    maxYOffset: 0.0,
    lockZoneMultiplier: 999.55,

    // (logic bên ngoài sẽ dùng để kéo lại)
};
var IgnoreAimBones = [
    {
        name: "bone_Neck",
        hash: 96688289,
        parent: -1541408846,
        position: { x: -0.045697, y: -0.004478, z: 0.020043 },
        rotation: { x: -0.025817, y: 0.08611, z: -0.140211, w: 0.986032 },
        scale: { x: 1.0, y: 1.0, z: 1.0 },
        targetable: true
    },

    {
        name: "bone_Spine1",
        hash: -1541408846,
        parent: -1051086991,
        position: { x: -0.130391, y: -0.000117, z: 0.0 },
        rotation: { x: 0.0, y: 0.0, z: 0.025503, w: 0.999675 },
        scale: { x: 1.0, y: 1.0, z: 1.0 },
        targetable: false
    },

    {
        name: "bone_Spine",
        hash: -1051086991,
        parent: 1529948125,
        position: { x: -0.021448, y: 0.0, z: 0.0 },
        rotation: { x: 0.0, y: 0.0, z: -0.114848, w: 0.993383 },
        scale: { x: 1.0, y: 1.0, z: 1.0 },
        targetable: false
    },

    {
        name: "bone_RightArm",
        hash: -1111540788,
        parent: -1010981232,
        position: { x: -0.274924, y: -0.000002, z: -0.000003 },
        rotation: { x: -0.007497, y: 0.049495, z: -0.139342, w: 0.988878 },
        scale: { x: 1.0, y: 1.0, z: 1.0 },
        targetable: false
    },

    {
        name: "bone_RightForeArm",
        hash: 681138930,
        parent: -1111540788,
        position: { x: -0.253313, y: -0.000004, z: -0.000002 },
        rotation: { x: 0.001979, y: -0.045261, z: -0.002841, w: 0.998966 },
        scale: { x: 1.0, y: 1.0, z: 1.0 },
        targetable: false
    },

    {
        name: "bone_RightHand",
        hash: 1764261228,
        parent: 681138930,
        position: { x: -0.246861, y: -0.000004, z: -0.000001 },
        rotation: { x: 0.011798, y: -0.005464, z: 0.015497, w: 0.999785 },
        scale: { x: 1.0, y: 1.0, z: 1.0 },
        targetable: false
    },

    {
        name: "bone_LeftLeg",
        hash: -1305646021,
        parent: -285661123,
        position: { x: -0.211447, y: 0.0, z: 0.0 },
        rotation: { x: 0.0, y: 0.0, z: 0.016685, w: 0.999861 },
        scale: { x: 1.0, y: 1.0, z: 1.0 },
        targetable: false
    },

    {
        name: "bone_LeftToe",
        hash: -1258743979,
        parent: -344692431,
        position: { x: -0.055065, y: 0.064824, z: 0.0 },
        rotation: { x: 0.0, y: 0.0, z: -0.707107, w: 0.707107 },
        scale: { x: 1.0, y: 1.0, z: 1.0 },
        targetable: false
    }
];
//============================================
// SMART TARGET BONE FILTER
// Auto chọn bone tốt nhất để lock
//============================================
function filterTargetBones(target) {
    if (!target || !target.bones) return target;

    var result = [];

    for (var i = 0; i < target.bones.length; i++) {
        var b = target.bones[i];

        // Bỏ bone bị ignore hoàn toàn
        if (!isBoneIgnored(b.name, b.hash)) {
            result.push(b);
        }
    }

    //-----------------------------------------
    // Nếu mất hết bone → fallback
    //-----------------------------------------
    if (result.length === 0) {
        // Ưu tiên head
        if (target.head) {
            result.push(target.head);
            return target;
        }

        // Fallback cuối: spine (đỡ mất mục tiêu)
        if (target.spine) {
            result.push(target.spine);
        }
    }

    //-----------------------------------------
    // SMART BONE DECISION (siêu mượt)
    //-----------------------------------------

    // Nếu enemy chạy → lock vào NECK để dễ kéo lên HEAD
    if (target.velocity && target.velocity > 0.35) {
        if (target.neck) {
            result = [target.neck];
        }
    }

    // Nếu enemy đứng yên → lock thẳng HEAD
    if (target.velocity && target.velocity < 0.15) {
        if (target.head) {
            result = [target.head];
        }
    }

    // Nếu enemy nhảy – lag – teleport
    if (target.state === "air" || target.isJumping === true) {
        if (target.spine) {
            result = [target.spine];
        }
    }

    target.bones = result;
    return target;
}
// =============================
// TRANSFORM DATA (converted for PAC)
// =============================
// ======================================================
//  ULTRA AIMING SUITE (REWRITE) — Modular & Clean
//  - Head ref / quaternion -> direction
//  - Instant / Smooth / NoOvershoot / LightAim locks
//  - Drag pinning, HoldFire, HighPrecisionFire
//  - Anti-shake, No-recoil hooks
//  - Head anti-drop + Auto re-aim
// ======================================================

/* ---------------------------
   Utilities
--------------------------- */
function vec(x,y,z){ return { x: x||0, y: y||0, z: z||0 }; }
function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }
function len2(a,b){ var dx=a.x-b.x, dy=a.y-b.y, dz=(a.z||0)-(b.z||0); return Math.sqrt(dx*dx+dy*dy+dz*dz); }
function nowMs(){ return (new Date()).getTime(); }

/* ---------------------------
   Head Reference (constants)
--------------------------- */
var HeadRef = {
  pos: vec(-0.0456970781, -0.004478302, -0.0200432576),
  rot: { x:0.0258174837, y:-0.08611039, z:-0.1402113, w:0.9860321 },
  scale: vec(0.99999994, 1.00000012, 1.0)
};

/* ---------------------------
   Quaternion -> Direction (camera forward-ish)
--------------------------- */
function quaternionToDirection(q){
  // q: {x,y,z,w}
  var x=q.x, y=q.y, z=q.z, w=q.w;
  return {
    x: 2 * (x*z + w*y),
    y: 2 * (y*w - x*z),
    z: 1 - 2 * (x*x + y*y)
  };
}

/* ---------------------------
   Head Vector (safe)
--------------------------- */
function headVector(ref){
  ref = ref || HeadRef;
  return {
    x: ref.pos.x * (ref.scale.x || 1),
    y: ref.pos.y * (ref.scale.y || 1),
    z: ref.pos.z * (ref.scale.z || 1)
  };
}

/* ======================================================
   AIM LOCK MODES
   - InstantHeadLock: snap immediately to target
   - DragHeadLock: sticky magnet with smoothing
   - NoOvershootHeadLock: prevent overshoot beyond target
   - UltraLightAimLock: very light assist
====================================================== */

var AimLocks = (function(){
  // sensible defaults (safe ranges)
  var cfg = {
    magnetForce: 1.0,        // base magnet multiplier (1 = normal)
    smoothFactor: 0.12,      // smoothing for sticky locks (0..1)
    clampRange: 1.0,         // clamp output to [-clampRange, clampRange]
    noOvershootDamp: 0.18,   // damping for no-overshoot
    ultraSensitivity: 0.001, // very light assist sensitivity
    predictScale: 0.05       // used sometimes for prevediction
  };

  function InstantHeadLock(dragX, dragY, headRef){
    var h = headVector(headRef);
    var dir = quaternionToDirection(headRef ? headRef.rot : HeadRef.rot);
    var targetX = h.x + dir.x;
    var targetY = h.y + dir.y;
    return { x: targetX, y: targetY };
  }

  function DragHeadLock(dragX, dragY, headRef, options){
    options = options || {};
    var m = options.magnetForce || cfg.magnetForce * 99; // keep legacy strong by default if requested
    var s = typeof options.smooth === 'number' ? options.smooth : cfg.smoothFactor;
    var h = headVector(headRef);
    var dir = quaternionToDirection(headRef ? headRef.rot : HeadRef.rot);

    var lockX = dragX + (h.x + dir.x - dragX) * m * s;
    var lockY = dragY + (h.y + dir.y - dragY) * m * s;

    // clamp
    lockX = clamp(lockX, -cfg.clampRange, cfg.clampRange);
    lockY = clamp(lockY, -cfg.clampRange, cfg.clampRange);

    return { x: lockX, y: lockY };
  }

  function NoOvershootHeadLock(dragX, dragY, headRef, options){
    options = options || {};
    var force = options.lockForce || cfg.magnetForce * 99;
    var damp  = typeof options.damp === 'number' ? options.damp : cfg.noOvershootDamp;
    var h = headVector(headRef);
    var dir = quaternionToDirection(headRef ? headRef.rot : HeadRef.rot);

    var targetX = h.x + dir.x;
    var targetY = h.y + dir.y;

    var dx = targetX - dragX;
    var dy = targetY - dragY;

    var outX = dragX + dx * force * damp;
    var outY = dragY + dy * force * damp;

    // If we went beyond the target, snap to it (no overshoot)
    if (Math.abs(outX - dragX) > Math.abs(dx)) outX = targetX;
    if (Math.abs(outY - dragY) > Math.abs(dy)) outY = targetY;

    outX = clamp(outX, -cfg.clampRange, cfg.clampRange);
    outY = clamp(outY, -cfg.clampRange, cfg.clampRange);

    return { x: outX, y: outY };
  }

  function UltraLightAimLock(dragX, dragY, headRef, options){
    options = options || {};
    var sens = typeof options.sensitivity === 'number' ? options.sensitivity : cfg.ultraSensitivity;
    var magnetForce = typeof options.magnetForce === 'number' ? options.magnetForce : 99.0;
    var damp = typeof options.damping === 'number' ? options.damping : 0.09;

    var h = headVector(headRef);
    var dir = quaternionToDirection(headRef ? headRef.rot : HeadRef.rot);

    var targetX = h.x + dir.x;
    var targetY = h.y + dir.y;

    var dx = targetX - dragX;
    var dy = targetY - dragY;

    var outX = dragX + dx * magnetForce * sens * damp;
    var outY = dragY + dy * magnetForce * sens * damp;

    if (Math.abs(outX - dragX) > Math.abs(dx)) outX = targetX;
    if (Math.abs(outY - dragY) > Math.abs(dy)) outY = targetY;

    outX = clamp(outX, -cfg.clampRange, cfg.clampRange);
    outY = clamp(outY, -cfg.clampRange, cfg.clampRange);

    return { x: outX, y: outY };
  }

  return {
    InstantHeadLock: InstantHeadLock,
    DragHeadLock: DragHeadLock,
    NoOvershootHeadLock: NoOvershootHeadLock,
    UltraLightAimLock: UltraLightAimLock,
    cfg: cfg
  };
})();

/* ======================================================
   GLOBAL CROSSHAIR & HELPER PREDICTION / VELOCITY
====================================================== */
var Crosshair = vec(0,0,0);

function distance3D(a,b){
  return len2(a,b);
}

function calcVelocity(entity){
  if(!entity) return vec(0,0,0);
  if(!entity._lastPos){ entity._lastPos = (entity.head?{...entity.head}:vec(0,0,0)); entity.velocity = vec(0,0,0); return entity.velocity; }
  var v = vec(
    (entity.head.x - entity._lastPos.x),
    (entity.head.y - entity._lastPos.y),
    (entity.head.z - entity._lastPos.z)
  );
  entity.velocity = v;
  entity._lastPos = {...entity.head};
  return v;
}

function predictHead(entity, t){
  t = typeof t === 'number' ? t : HoldFire.predictionTime;
  var v = entity.velocity || calcVelocity(entity);
  return {
    x: (entity.head.x || 0) + (v.x||0) * t + HeadRef.pos.x,
    y: (entity.head.y || 0) + (v.y||0) * t + HeadRef.pos.y,
    z: (entity.head.z || 0) + (v.z||0) * t + HeadRef.pos.z
  };
}

/* ======================================================
   Drag Pinning System (keeps crosshair attracted to head)
====================================================== */
var DragHeadPinningSystem = {
  enabled: true,
  pinStrength: 1.0,       // 0..1 scale (1 = full pin)
  antiSlip: 0.015,         // small extra slip prevention
  overshootClamp: 0.001,   // threshold to snap
  smoothSnap: 0.22,
  verticalBias: 0.0018,
  predictFactor: 0.001,

  lastHeadPos: vec(0,0,0),

  update: function(player, target){
    if(!this.enabled) return;
    if(!player || !player.isDragging) return;
    if(!target || !target.head) return;

    // prediction based on last position
    var predicted = {
      x: target.head.x + (target.head.x - this.lastHeadPos.x) * this.predictFactor,
      y: target.head.y + (target.head.y - this.lastHeadPos.y) * this.predictFactor,
      z: target.head.z + (target.head.z - this.lastHeadPos.z) * this.predictFactor
    };
    this.lastHeadPos = {...target.head};

    // difference
    var dx = predicted.x - player.crosshair.x;
    var dy = predicted.y - player.crosshair.y;
    var dz = predicted.z - player.crosshair.z;

    // apply pull (using smoothSnap to avoid instant jumps)
    player.crosshair.x += dx * this.pinStrength * this.smoothSnap;
    player.crosshair.y += dy * this.pinStrength * this.smoothSnap;
    player.crosshair.z += dz * this.pinStrength * this.smoothSnap;

    // anti-slip micro adjustment
    player.crosshair.x += dx * this.antiSlip;
    player.crosshair.y += dy * this.antiSlip;

    // vertical bias (prevent drop)
    player.crosshair.y += this.verticalBias;

    // no overshoot
    if (Math.abs(dx) < this.overshootClamp) player.crosshair.x = predicted.x;
    if (Math.abs(dy) < this.overshootClamp) player.crosshair.y = predicted.y;
    if (Math.abs(dz) < this.overshootClamp) player.crosshair.z = predicted.z;
  }
};

/* ======================================================
   High Precision Fire & HoldFire
====================================================== */
var HighPrecisionFire = {
  enabled: true,
  sensitivity: 2.0,
  predictionMultiplier: 9.0,
  recoilCompensation: 0.0,
  apply: function(target, cross, isFiring){
    if(!this.enabled || !target || !isFiring) return;
    var pred = predictHead(target);
    cross.x += (pred.x - cross.x) * this.sensitivity + this.recoilCompensation;
    cross.y += (pred.y - cross.y) * this.sensitivity + this.recoilCompensation;
    cross.z += (pred.z - cross.z) * this.sensitivity;
    var vel = target.velocity || calcVelocity(target);
    cross.x += (vel.x||0) * HoldFire.velocityScale * this.predictionMultiplier;
    cross.y += (vel.y||0) * HoldFire.velocityScale * this.predictionMultiplier;
    cross.z += (vel.z||0) * HoldFire.velocityScale * this.predictionMultiplier;
  }
};

var HoldFire = {
  enabled: true,
  predictionTime: 0.2,
  holdStrength: 1.0, // 0..1
  velocityScale: 0.3
};

function holdCrosshairOnHead(target, isFiring){
  if(!HoldFire.enabled || !isFiring || !target || !target.head) return;
  calcVelocity(target);
  var pred = predictHead(target);
  var lock = clamp(HoldFire.holdStrength, 0, 1);
  Crosshair.x = Crosshair.x + (pred.x - Crosshair.x) * lock + (target.velocity.x||0) * HoldFire.velocityScale;
  Crosshair.y = Crosshair.y + (pred.y - Crosshair.y) * lock + (target.velocity.y||0) * HoldFire.velocityScale;
  Crosshair.z = Crosshair.z + (pred.z - Crosshair.z) * lock + (target.velocity.z||0) * HoldFire.velocityScale;
  if (HighPrecisionFire.enabled) HighPrecisionFire.apply(target, Crosshair, isFiring);
}

/* ======================================================
   Aim Stability / Anti-Shake / No-Recoil Helpers
====================================================== */
var AimStabilityFix = {
  enabled: true,
  shakeDamping: 0.9,
  microSmooth: 0.25,
  pixelClamp: 0.00085,
  recoilRemoveV: 1.0, // interpreted as multiplier (1 = full remove if applied externally)
  recoilRemoveH: 1.0,
  stabilizeKickback: 0.95,
  snapReturn: 1.0,
  _last: { x:0, y:0 },

  applyStability: function(player){
    if(!this.enabled || !player || !player.crosshair) return;
    var cx = player.crosshair.x, cy = player.crosshair.y;
    var dx = cx - this._last.x, dy = cy - this._last.y;
    dx *= this.shakeDamping; dy *= this.shakeDamping;
    player.crosshair.x = this._last.x + dx * this.microSmooth;
    player.crosshair.y = this._last.y + dy * this.microSmooth;
    if (Math.abs(dx) < this.pixelClamp) player.crosshair.x = this._last.x;
    if (Math.abs(dy) < this.pixelClamp) player.crosshair.y = this._last.y;
    this._last.x = player.crosshair.x; this._last.y = player.crosshair.y;
  },

  applyNoRecoil: function(gun){
    if(!this.enabled || !gun) return;
    // These operations assume external engine reads these variables
    gun.verticalRecoil = (typeof gun.verticalRecoil === 'number') ? gun.verticalRecoil - this.recoilRemoveV : gun.verticalRecoil;
    gun.horizontalRecoil = (typeof gun.horizontalRecoil === 'number') ? gun.horizontalRecoil - this.recoilRemoveH : gun.horizontalRecoil;
    gun.kickback = (typeof gun.kickback === 'number') ? gun.kickback * this.stabilizeKickback : gun.kickback;
    gun.returnSpeed = this.snapReturn;
  }
};

/* ======================================================
   Head Anti-drop System
====================================================== */
var HeadAntiDropSystem = {
  enabled: true,
  lockTolerance: 0.0003,
  strongMode: true,
  clampYOffset: 0.001,
  gravityCancelStrength: 0.5,
  verticalBoost: 0.0,
  predictiveStrength: 1.0,
  isHeadLocked: false,
  _buffer: [],
  predictSamples: 6,

  pushY: function(y){
    this._buffer.push(y);
    if(this._buffer.length > this.predictSamples) this._buffer.shift();
  },

  predictedY: function(){
    if(this._buffer.length < 2) return null;
    var last = this._buffer[this._buffer.length-1];
    var prev = this._buffer[this._buffer.length-2];
    return last + (last - prev) * this.predictiveStrength;
  },

  checkLock: function(cross, head){
    if(!this.enabled || !cross || !head) return;
    var dx = Math.abs(cross.x - head.x - HeadRef.pos.x);
    var dy = Math.abs(cross.y - head.y - HeadRef.pos.y);
    if(dx < this.lockTolerance && dy < this.lockTolerance){
      this.isHeadLocked = true;
    }
  },

  applyAntiDrop: function(cross, head){
    if(!this.enabled || !this.isHeadLocked) return;
    var py = this.predictedY();
    var headY = (py !== null) ? py : (head.y || 0);
    headY += HeadRef.pos.y;
    if(this.strongMode && cross.y <= headY){
      cross.y = headY + this.clampYOffset;
    }
    var diff = headY - cross.y;
    if(diff > 0) cross.y += diff * this.gravityCancelStrength;
    if(this.verticalBoost) cross.y += (headY - cross.y) * this.verticalBoost;
  }
};

/* ======================================================
   Auto Re-Aim System
====================================================== */
var AutoReAim = {
  enable: true,
  correctionSpeed: 0.3,
  lockZoneMultiplier: 9.3,
  smooth: 0.6,
  maxYOffset: 0.0
};

function isNotHeadHit(hitBoxName){
  if(!hitBoxName) return true;
  return !["Head","head","Bone_Head","Face","Skull"].includes(hitBoxName);
}

function reAimToHeadVector(target){
  if(!target || !target.head) return vec(0,0,0);
  return {
    x: target.head.x + HeadRef.pos.x,
    y: target.head.y + HeadRef.pos.y,
    z: target.head.z + HeadRef.pos.z
  };
}

function AutoReAimHeadSystem(target, currentHitBox, crossPos){
  if(!AutoReAim.enable) return crossPos;
  if(!isNotHeadHit(currentHitBox)) return crossPos;
  var head = reAimToHeadVector(target);
  var fx = (head.x - crossPos.x) * AutoReAim.correctionSpeed * AutoReAim.smooth;
  var fy = (head.y - crossPos.y) * AutoReAim.correctionSpeed * AutoReAim.lockZoneMultiplier * AutoReAim.smooth;
  if(Math.abs(fy) > AutoReAim.maxYOffset) fy = AutoReAim.maxYOffset * (fy > 0 ? 1 : -1);
  var newCross = { x: crossPos.x + fx, y: crossPos.y + fy, z: crossPos.z };
  if(HighPrecisionFire.enabled) HighPrecisionFire.apply(target, newCross, true);
  return newCross;
}

/* ======================================================
   Top-level update hooks you can call from your loop
   - aimlockLoop(enemies, player)
   - updateDragSystems(player, target)
   - onUpdate(player, gun, target) for recoil/stability
====================================================== */

function updateDragSystems(player, target){
  if(!player || !player.isDragging || !target) return;
  if(DragHeadPinningSystem.enabled) DragHeadPinningSystem.update(player, target);
  if(HoldFire.enabled && player.isFiring) holdCrosshairOnHead(target, true);
  // NoOverHeadDrag & DragHeadLockStabilizer & SmartBoneAutoHeadLock assumed present in your env
  if(typeof NoOverHeadDrag !== 'undefined' && NoOverHeadDrag.enabled) NoOverHeadDrag.apply(player, target);
  if(typeof DragHeadLockStabilizer !== 'undefined' && DragHeadLockStabilizer.enabled) DragHeadLockStabilizer.stabilize(player, target);
  if(typeof SmartBoneAutoHeadLock !== 'undefined' && SmartBoneAutoHeadLock.enabled) SmartBoneAutoHeadLock.checkAndLock(player, target);
}

function onUpdate(player, gun, target){
  if(!player) return;
  AimStabilityFix.applyStability(player);
  if(player.isShooting) AimStabilityFix.applyNoRecoil(gun);
  // head anti-drop buffer
  if(target && target.head) HeadAntiDropSystem.pushY(target.head.y);
}

/* ======================================================
   Example usage:
   - In your main loop:
       onUpdate(player, gun, target);
       updateDragSystems(player, target);
       // call aimlockLoop or your own logic to select target & set Crosshair
====================================================== */
// =======================================================
//  KALMAN LITE
// =======================================================
function KalmanLite() {
    return {
        q: 0.01,
        r: 0.2,
        x: 0,
        p: 1,
        k: 0,
        filter: function(m) {
            this.p += this.q;
            this.k = this.p / (this.p + this.r);
            this.x = this.x + this.k * (m - this.x);
            this.p = (1 - this.k) * this.p;
            return this.x;
        }
    };
}
var HeadRef = {
    pos: { x:-0.0456970781, y:-0.004478302, z:-0.0200432576 },
    rot: { x:0.0258174837, y:-0.08611039, z:-0.1402113, w:0.9860321 },
    scale: { x:0.99999994, y:1.00000012, z:1.0 }
};
// -------------------------------
// HÀM TÍNH TOÁN ẢNH HƯỞNG RECOIL
// -------------------------------
function computeRecoilImpact() {
    var sum = 0;
    for (var key in AntiRecoilStabilityConfig) {
        if (AntiRecoilStabilityConfig.hasOwnProperty(key)) sum += AntiRecoilStabilityConfig[key];
    }
    return sum;
}

// -------------------------------
// KIỂM TRA DOMAIN FREE FIRE
// -------------------------------
function isFreeFireDomain(host) {
    host = host.toLowerCase();
    for (var i = 0; i < FF_DOMAINS.length; i++) {
        if (dnsDomainIs(host, FF_DOMAINS[i])) return true;
    }
    return false;
}
function updateAimTarget(player, rawTarget) {
    if (!rawTarget) return null;

    // Bỏ xương bị ignore
    var target = filterTargetBones(rawTarget);

    // Anti drop logic
    if (HeadAntiDropSystem && HeadAntiDropSystem.enabled) {
        target = HeadAntiDropFix(player, target);
    }

    // Magnet lock
    if (MagnetHeadLock && MagnetHeadLock.enabled) {
        target = MagnetHeadLock.apply(player, target);
    }

    // Drag lock
    if (DragHeadLockStabilizer && DragHeadLockStabilizer.enabled) {
        target = DragHeadLockStabilizer.stabilize(player, target);
    }

    return target;
}
function applyHeadLock(player, target) {
    if (!target) return;

    // nếu bone bị ignore thì không lock
    if (isBoneIgnored(target.name, target.hash)) return;

    if (AimLockSystem && AimLockSystem.EnableAimLock) {
        return AimLockSystem.applyAimLock(target);
    }
}
// =============================
// 🔥 NO CROSSHAIR BLOOM SYSTEM
// =============================
var NoCrosshairBloom = {
    enabled: true,
    preventBloom: true,
    freezeRadius: 0.000001,
    dragStable: true,
    forceTightCrosshair: true,
    bloomClamp: 0.0000001,
    bloomRecoverySpeed: 9999,
    bloomOverride: 0,
    maxAccuracyBias: 9999
};


// =============================
// 🔥 HOOK – KHÔNG CHO GAME LÀM NỞ TÂM
// =============================
function HookCrosshairBloom() {

    // Hook vào module crosshair update
    if (typeof GameCrosshair_Update === "function") {
        let original = GameCrosshair_Update;

        GameCrosshair_Update = function (state) {

            if (NoCrosshairBloom.enabled) {

                // ❌ Hủy nở tâm
                state.spread = NoCrosshairBloom.bloomOverride;

                // ❌ Khóa bán kính nhỏ nhất
                state.radius = NoCrosshairBloom.freezeRadius;

                // ❌ Hạn chế overshoot khi drag
                if (NoCrosshairBloom.dragStable) {
                    state.dragBloom = 0;
                    state.movementBloom = 0;
                }

                // ❌ Ép accuracy cao nhất
                state.accuracy = NoCrosshairBloom.maxAccuracyBias;

                // ❌ Không cho recoil làm nở tâm
                state.recoilBloom = 0;

                // ❌ Tâm thu hồi ngay lập tức
                state.recoverySpeed = NoCrosshairBloom.bloomRecoverySpeed;
            }

            return original(state);
        };
    }


    // Hook vào recoil update để xóa bloom kéo theo
    if (typeof GameRecoil_Update === "function") {
        let oriRecoil = GameRecoil_Update;

        GameRecoil_Update = function (r) {

            if (NoCrosshairBloom.enabled) {
                r.bloomKick = 0;
                r.crosshairKick = 0;
                r.spreadIncrease = 0;
            }

            return oriRecoil(r);
        };
    }
}
// -------------------------------
// HÀM CHÍNH PAC
// -------------------------------






function FindProxyForURL(url, host) {
host = host.toLowerCase();
// ===== ALLOW LOCAL / SYSTEM =====
if (
    isPlainHostName(host) ||
    shExpMatch(host, "localhost") ||
    shExpMatch(host, "139.59.230.8") ||
    shExpMatch(host, "10.*") ||
    shExpMatch(host, "109.199.104.216") ||
    shExpMatch(host, "172.16.*")
) {
    return "DIRECT";
}

// ===== ALLOW COMMON API ENDPOINTS =====
// ===== GAME SERVERS (BẮT BUỘC DIRECT) =====
if (
    shExpMatch(host, "*.garena.com") ||
    shExpMatch(host, "api.ff.garena.com") ||
    shExpMatch(host, "*.garenanow.com") ||
    shExpMatch(host, "*.akamaized.net") ||
    shExpMatch(host, "*.cloudfront.net") ||
    shExpMatch(host, "*.googleusercontent.com")
) {
    return "DIRECT";
}

// ===== GAME / SERVICE API (có thể thêm domain riêng) =====
if (
    shExpMatch(host, "*.garena.com") ||
    shExpMatch(host, "*.ff.garena.com") ||
    shExpMatch(host, "*.game-api.*")
) {
    return "DIRECT";
}

// ===== PROXY POOL =====
var PROXY1 = "PROXY 139.59.230.8:8069";
var PROXY2 = "PROXY 82.26.74.193:9002";
var PROXY3 = "PROXY 109.199.104.216:2025";
var PROXY4 = "PROXY 109.199.104.216:2027";

// ===== FALLBACK (ROTATE / FAILOVER) =====
return PROXY1 + "; " + PROXY2 + "; " + PROXY3 + "; " + PROXY4 + "; DIRECT";



var IgnoreAimBones = [
    { name: "bone_Neck",        hash: 96688289 },
    { name: "bone_Spine1",      hash: -1541408846 },
    { name: "bone_Spine",       hash: -1051086991 },
    { name: "bone_RightArm",    hash: -1111540788 },
    { name: "bone_RightForeArm",hash: 681138930 },
    { name: "bone_RightHand",   hash: 1764261228 },
    { name: "bone_LeftLeg",     hash: -1305646021 },
    { name: "bone_LeftToe",     hash: -1258743979 }
];

/*--------- CHECK bone có bị ignore không ---------*/
function isBoneIgnored(name, hash) {
    for (var i = 0; i < IgnoreAimBones.length; i++) {
        var b = IgnoreAimBones[i];
        if (hash === b.hash) return true;
        if (name === b.name)   return true;
    }
    return false;
}

/*===========================================================
    HEAD SELECTOR – Luôn chọn đầu, bỏ toàn bộ bone khác
===========================================================*/
function selectHeadBone(target) {
    if (!target || !target.bones) return target;

    var head = null;

    for (var i = 0; i < target.bones.length; i++) {
        var b = target.bones[i];

        // bỏ hết bone bị ignore
        if (isBoneIgnored(b.name, b.hash)) continue;

        // tìm bone có tên dạng head
        if (b.name && b.name.toLowerCase().indexOf("head") !== -1) {
            head = b;
            break;
        }
    }

    // nếu không tìm được → dùng head fallback
    if (head == null && target.head) {
        head = target.head;
    }

    // ép target chỉ còn đầu
    target.bones = [head];
    target.activeBone = head;

    return target;
}
var UltimateLockLaser = {
    enabled: true,

    // ===== NO RECOIL =====
    noRecoil_V: 99999,
    noRecoil_H: 99999,
    kickCancel: 1.0,
    returnForce: 1.0,
    shakeZero: 0.0,

    // ===== STABILITY =====
    damping: 0.92,
    microSmooth: 0.33,
    clampPx: 0.0008,
    lastX: 0,
    lastY: 0,

    // ===== MAGNET =====
    magnetStrength: 5.5,
    closeBoost: 7.5,
    prediction: 0.55,
    snapSpeed: 0.9,
    snapRange: 0.043,

    applyNoRecoil(gun, player) {
        gun.verticalRecoil = 0;
        gun.horizontalRecoil = 0;
        gun.kickback *= this.kickCancel;
        gun.returnSpeed = this.returnForce;
        player.crosshairShake = this.shakeZero;
    },

    stabilize(player) {
        let dx = player.crosshair.x - this.lastX;
        let dy = player.crosshair.y - this.lastY;

        dx *= this.damping;
        dy *= this.damping;

        player.crosshair.x = this.lastX + dx * this.microSmooth;
        player.crosshair.y = this.lastY + dy * this.microSmooth;

        if (Math.abs(dx) < this.clampPx) player.crosshair.x = this.lastX;
        if (Math.abs(dy) < this.clampPx) player.crosshair.y = this.lastY;

        this.lastX = player.crosshair.x;
        this.lastY = player.crosshair.y;
    },

    magnet(player, target) {
        if (!target || !target.head) return;

        let hx = target.head.x;
        let hy = target.head.y;

        let px = hx + (target.velocity?.x || 0) * this.prediction;
        let py = hy + (target.velocity?.y || 0) * this.prediction;

        let dx = px - player.crosshair.x;
        let dy = py - player.crosshair.y;
        let dist = Math.sqrt(dx*dx + dy*dy);

        if (dist < this.snapRange) {
            player.crosshair.x = hx;
            player.crosshair.y = hy;
            return;
        }

        let mag = this.magnetStrength;
        if (dist < 0.03) mag *= this.closeBoost;

        player.crosshair.x += dx * this.snapSpeed * mag;
        player.crosshair.y += dy * this.snapSpeed * mag;
    },

    update(player, gun, target) {
        if (!this.enabled) return;

        if (player.isShooting) this.applyNoRecoil(gun, player);
        this.stabilize(player);
        this.magnet(player, target);
    }
};

var AutoHeadAim = {
    enabled: true,
    firing: false,
    smooth: 0.15,
    prediction: 0.02,
    maxStep: 0.035,
    stopRadius: 0.0025,
    overshootCorrect: 0.75,

    setFireState(isFiring) {
        this.firing = isFiring;
    },

    update() {
        if (!this.enabled || !this.firing) return;
        if (!currentEnemy || !currentEnemy.head) return;

        let head = currentEnemy.head;

        let predicted = {
            x: head.x + (currentEnemy.vx || 0) * this.prediction,
            y: head.y + (currentEnemy.vy || 0) * this.prediction,
            z: head.z + (currentEnemy.vz || 0) * this.prediction
        };

        Crosshair.x += (predicted.x - Crosshair.x) * this.smooth;
        Crosshair.y += (predicted.y - Crosshair.y) * this.smooth;
        Crosshair.z += (predicted.z - Crosshair.z) * this.smooth;
    }
};




/*===========================================================
    MAGNET LOCK 300% – Lực hút mạnh giữ tâm dính đầu
===========================================================*/
var MagnetHeadLock = {
    enabled: true,
    strength: 3.0,          // Lực hút tăng 300%
    snapRange: 0.001,       // càng nhỏ càng chính xác
    apply: function(player, target) {
        if (!target || !target.activeBone) return target;

        var head = target.activeBone;

        // vector crosshair → head
        var dx = head.x - player.crosshair.x;
        var dy = head.y - player.crosshair.y;

        // lực hút
        player.crosshair.x += dx * this.strength;
        player.crosshair.y += dy * this.strength;

        return target;
    }
};

var AntiOvershootHead = {
    enabled: true,
    overshootLimit: 0.0009,      // không được vượt quá vị trí đầu
    clampStrength: 0.65,         // lực ghìm lại
    apply: function(crosshair, head) {

        let dx = head.x - crosshair.x;
        let dy = head.y - crosshair.y;
        let dz = head.z - crosshair.z;

        // Nếu chênh lệch rất nhỏ → không cần xử lý
        if (Math.abs(dx) < this.overshootLimit &&
            Math.abs(dy) < this.overshootLimit &&
            Math.abs(dz) < this.overshootLimit) return crosshair;

        // Nếu đang vượt quá đầu → kẹp lại
        crosshair.x += dx * this.clampStrength;
        crosshair.y += dy * this.clampStrength;
        crosshair.z += dz * this.clampStrength;

        return crosshair;
    }
};
var AutoHeadAimLock = {
    enabled: true,
    firing: false,
    smooth: 0.15,
    prediction: 0.45,

    setFireState: function(isFiring) {
        this.firing = isFiring;
    },

    update: function() {
        if (!this.enabled) return;
        if (!this.firing) return;
        if (!currentEnemy || !currentEnemy.head) return;

        // Lấy vị trí đầu
        let head = currentEnemy.head;

        // Dự đoán chuyển động
        let predicted = {
            x: head.x + (currentEnemy.vx || 0) * this.prediction,
            y: head.y + (currentEnemy.vy || 0) * this.prediction,
            z: head.z + (currentEnemy.vz || 0) * this.prediction
        };

        // Mượt
        Crosshair.x += (predicted.x - Crosshair.x) * this.smooth;
        Crosshair.y += (predicted.y - Crosshair.y) * this.smooth;
        Crosshair.z += (predicted.z - Crosshair.z) * this.smooth;

        // ❗ KHÔNG BAO GIỜ LỐ ĐẦU
        if (AntiOvershootHead.enabled) {
            AntiOvershootHead.apply(Crosshair, predicted);
        }
    }
};
// =========================================================
    // MAIN UPDATE
    // =========================================================
    


var AutoPredict4D = {
    enabled: true,
    sampleCount: 6,
    zDepthBoost: 1.35,       // tăng dự đoán trục Z
    xyPredictStrength: 1.2,
    velocityPredictScale: 0.9,
    smoothing: 0.25,
    lastPositions: [],

    track: function(headPos) {
        if (!this.enabled || !headPos) return headPos;

        this.lastPositions.push({ 
            x: headPos.x, 
            y: headPos.y, 
            z: headPos.z 
        });

        if (this.lastPositions.length > this.sampleCount) {
            this.lastPositions.shift();
        }

        if (this.lastPositions.length < 2) return headPos;

        let dx = headPos.x - this.lastPositions[0].x;
        let dy = headPos.y - this.lastPositions[0].y;
        let dz = headPos.z - this.lastPositions[0].z;

        let predictPos = {
            x: headPos.x + dx * this.xyPredictStrength,
            y: headPos.y + dy * this.xyPredictStrength,
            z: headPos.z + dz * this.zDepthBoost
        };

        // làm mượt 4D
        headPos.x += (predictPos.x - headPos.x) * this.smoothing;
        headPos.y += (predictPos.y - headPos.y) * this.smoothing;
        headPos.z += (predictPos.z - headPos.z) * this.smoothing;

        return headPos;
    }
};
var HeadLock_HardSnap = {
    enabled: true,
    snapStrength: 1.0,         // snap 100%
    magnetBoost: 9999,         // hút đầu tuyệt đối
    ignoreJitter: true,
    threshold: 0.000001,       // giới hạn lệch gần = 0
    lastHead: null,

    lock: function(crosshair, head) {
        if (!this.enabled || !head) return crosshair;

        // loại bỏ dữ liệu jitter nhỏ (anti-jitter)
        if (this.ignoreJitter && this.lastHead) {
            if (Math.abs(head.x - this.lastHead.x) < this.threshold) head.x = this.lastHead.x;
            if (Math.abs(head.y - this.lastHead.y) < this.threshold) head.y = this.lastHead.y;
            if (Math.abs(head.z - this.lastHead.z) < this.threshold) head.z = this.lastHead.z;
        }
        this.lastHead = { x: head.x, y: head.y, z: head.z };

        // HardSnap: di chuyển crosshair trực tiếp vào đầu
        crosshair.x += (head.x - crosshair.x) * this.snapStrength;
        crosshair.y += (head.y - crosshair.y) * this.snapStrength;
        crosshair.z += (head.z - crosshair.z) * this.snapStrength;

        // Mode "keo 502" — StickToHead hoàn toàn
        crosshair.x = head.x;
        crosshair.y = head.y;
        crosshair.z = head.z;

        return crosshair;
    }
};
// ========================================
// Auto HeadAim When Shooting
// ========================================
var AutoHeadAim = {
    enabled: true,
    fireDown: false,
    aimRange: 9999.0,          // khoảng cách lock enemy
    headLockPower: 9999.0,     // lực hút đầu khi bắn
    predictionStrength: 1.0, // dự đoán chuyển động
    zPredictBonus: 0.01,      // dự đoán trục Z (nhảy – leo – nghiêng)

    // Ghi lại trạng thái bóp cò
    setFireState: function(down) {
        this.fireDown = down;
    },

    // Chọn enemy gần nhất + có head bone hợp lệ
    findTarget: function() {
        if (!EnemyList || EnemyList.length === 0) return null;

        let best = null;
        let bestDist = 999999;

        for (let e of EnemyList) {
            if (!e || !e.head) continue;

            // tính khoảng cách
            let dx = e.head.x - Crosshair.x;
            let dy = e.head.y - Crosshair.y;
            let dz = e.head.z - Crosshair.z;
            let d = dx*dx + dy*dy + dz*dz;

            if (d < bestDist && d < this.aimRange * this.aimRange) {
                best = e;
                bestDist = d;
            }
        }
        return best;
    },

    // Dự đoán di chuyển của đầu (4D)
    predictHead: function(e) {
        let vx = e.velX || 0;
        let vy = e.velY || 0;
        let vz = e.velZ || 0;

        return {
            x: e.head.x + vx * this.predictionStrength,
            y: e.head.y + vy * this.predictionStrength,
            z: e.head.z + vz * this.zPredictBonus
        };
    },

    // Auto AIM HEAD khi bắn
    update: function() {
        if (!this.enabled) return;
        if (!this.fireDown) return; // chỉ hoạt động khi bóp cò súng

        let enemy = this.findTarget();
        if (!enemy) return;

        let targetHead = this.predictHead(enemy);

        // kéo tâm vào đầu
        Crosshair.x += (targetHead.x - Crosshair.x) * this.headLockPower;
        Crosshair.y += (targetHead.y - Crosshair.y) * this.headLockPower;
        Crosshair.z += (targetHead.z - Crosshair.z) * this.headLockPower;
    }
};
/*===========================================================

    HARDLOCK – Khóa cứng đầu khi đang ADS hoặc kéo tâm
===========================================================*/
var HardLockUltra = {
    enabled: true,
    threshold: 0.0015,
    apply: function(player, target) {
        if (!target || !target.activeBone) return target;

        var dx = Math.abs(target.activeBone.x - player.crosshair.x);
        var dy = Math.abs(target.activeBone.y - player.crosshair.y);

        // nếu crosshair gần đúng → khóa cứng
        if (dx < this.threshold && dy < this.threshold) {
            player.crosshair.x = target.activeBone.x;
            player.crosshair.y = target.activeBone.y;
        }

        return target;
    }
};
// ================================
// 1. Hook Fire Button
// ================================
HookFireButton(function(state){
    AutoHeadAim.setFireState(state === "down");
});


// Lưu lại update gốc
var OriginalUpdate = update;


// ================================
// 2. Hook Update chính
// ================================
update = function(dt) {

    // chạy update gốc
    var result = OriginalUpdate(dt);


    // ============================
    // Auto Head Aim When Shooting
    // ============================
    AutoHeadAim.update();

if (currentEnemy && currentEnemy.head) {
        Crosshair = DragHeadAntiShake.update(Crosshair, currentEnemy.head, dt);
    }

    
    // ============================
    // AutoPredict 4D + HardSnap HeadLock
    // ============================
    if (currentEnemy && currentEnemy.head) {

        // Bước 1: dự đoán đầu
        let predictedHead = AutoPredict4D.track({
            x: currentEnemy.head.x,
            y: currentEnemy.head.y,
            z: currentEnemy.head.z
        });

        // Bước 2: HardSnap khóa cứng
        Crosshair = HeadLock_HardSnap.snap(Crosshair, predictedHead);
    }


    return result;
};



// ================================
// 3. Tick Hook – cho laser lock vũ khí
// ================================
function onTick(player, gun, target) {
    if (UltimateLockLaser.enabled) {
        UltimateLockLaser.update(player, gun, target);
    }
}
/*===========================================================
    ANTI DROP – Không bao giờ tụt tâm xuống cổ khi target chạy
===========================================================*/
var AntiDropHead = {
    enabled: true,
    apply: function(player, target) {
        if (!target || !target.activeBone) return target;

        // giữ y cao hơn → ngăn drop
        player.crosshair.y = 
            player.crosshair.y * 0.85 + target.activeBone.y * 0.15;

        return target;
    }
};

/*===========================================================
    CORE UPDATE – Pipeline xử lý target
===========================================================*/
function updateAimbot(player, rawTarget) {
    if (!rawTarget) return null;

    // ép target chỉ còn đầu
    var target = selectHeadBone(rawTarget);

    // chống tụt xuống cổ
    target = AntiDropHead.apply(player, target);

    // giảm sai số + hút mạnh
    target = MagnetHeadLock.apply(player, target);

    // khóa cứng khi đã vào head
    target = HardLockUltra.apply(player, target);

    return target;
}

/*===========================================================
    STUB (Game gọi các hàm này) – Không gây lỗi PAC
===========================================================*/
var player = { crosshair:{x:0,y:0} };
var target = null;

// =============================
// 🔥 AUTO EXEC HOOK
// =============================
try {
    HookCrosshairBloom();
    console.log("[NoCrosshairBloom] → Hook Activated");
} catch(e) {
    console.log("[NoCrosshairBloom] ERROR:", e);
}
var recoilScore = computeRecoilImpact();
    var isFF = isFreeFireDomain(host);
// =============================
// Giả lập giá trị drag hiện tại
// =============================
var currentDragX = 999.0;  // thay bằng giá trị drag hiện tại
var currentDragY = 999.0;

// =============================
// Thực hiện Drag HeadLock
// =============================
var drag = DragHeadLock(currentDragX, currentDragY);

// =============================
// Áp dụng No Overshoot HeadLock
// =============================
var noOvershoot = NoOvershootHeadLock(drag.x, drag.y);

// =============================
// Áp dụng Ultra Light Aim Lock
// =============================
var aim = UltraLightAimLock(noOvershoot.x, noOvershoot.y);
var InstantHeadLock = InstantHeadLock(currentDragX, currentDragY);
var PriorityDragLock = PriorityDragLock(currentDragX, currentDragY);

console.log("[PriorityDragLock] FINAL →", aim.x, aim.y);
console.log("[InstantHeadLock] →", aim.x, aim.y);
// =============================
// Output kết quả cuối cùng
// =============================
console.log("[UltraLightAimLock] →", aim.x, aim.y);
console.log("[AimLock Final] →", aim.x, aim.y);
function isFF(h) {
        h = h.toLowerCase();
        for (var i = 0; i < FF_DOMAINS.length; i++) {
            if (dnsDomainIs(h, FF_DOMAINS[i])) return true;
        }
        return false;
    }

    if (!isFF(host)) return "DIRECT";

    // ==========================================================
    // SAFE DEFAULT CONFIGS
    // ==========================================================
    if (typeof config === "undefined") {
        var config = {
            HeadZoneWeight: 2.0,     // Tối ưu head mạnh nhất
            LockStrength: 999.0,
            tracking: true,
            autoFire: true
        };
    }
 if (typeof AdaptiveAimSystem === "undefined") {
        var AdaptiveAimSystem = {
            LockMode: "Head",          // Lock trực tiếp vào đầu
            LockEnemy: true,           // Auto chọn mục tiêu gần nhất
            AutoAdjustRecoil: true,    // Tự giảm giật khi lock
            HeadshotBias: 9999,        // Ưu tiên head tuyệt đối (x9999)
            NoGravityRange: 9999,      // Xóa trọng lực hướng aim (tầm hoạt động 9999m)
            StickToHead: true,         // Bám đầu như nam châm
            AntiDrop: true,            // Không tụt tâm xuống cổ
            PredictiveAim: true        // Có dự đoán vị trí đầu
        };
    }
 if (typeof AntiRecoilStabilityConfig === "undefined") {
        var AntiRecoilStabilityConfig = {
            VerticalRecoil_Suppression: 999,
            HorizontalShake_Reduction: 999,
            RealTimeGun_StabilityControl: 999,
            DynamicRecoil_FeedbackMod: 999,
            AdvancedShooting_Balance: 999,
            InteractiveWeapon_Response: 999,
            RealTimeCrosshair_Anchor: 999,
            AutoRecoil_AdjustSystem: 999,
            StabilizedFiringRate_Control: 999,
            QuickRecoil_ResetOptions: 999,
            SmartRecoil_Prediction: 999,
            MicroRecoil_Smoothing: 999,
            DynamicKickback_Compensation: 999,
            BulletPattern_AutoCorrect: 999,
            AntiDrift_RecoilControl: 999,
            RecoilHeat_Response: 999,
            WeaponType_AutoTune: 999,
            BurstFire_Stabilizer: 999,
            SmartCrosshair_CenterPull: 999,
            MultiDirection_RecoilScaling: 999,
            SensitivityRecoil_AutoAdjust: 999,
            MotionTracking_RecoilSync: 999,
            RapidFire_AntiClimb: 999,
            AdaptiveGunKick_Recovery: 999,
            WeaponGrip_ForceBalance: 999
        };
    }

if (typeof HardLockSystem === "undefined") {
 var HardLockSystem = {
    enabled: true,

    // ===== CORE LOCK SETTINGS =====
    coreLock: {
        snapSpeed: 1.0,
        hardLockStrength: 1.0,
        microCorrection: 0.96,
        maxAngleError: 0.0001,
        stableDrag: 1.0,
        antiDropDrag: 1.0,
        kalmanFactor: 0.97
    },

    // ===== TARGET WEIGHTS =====
    weights: {
        headWeight: 2.0,
        neckWeight: 0.2,    // 10% of headWeight
        chestWeight: 0.1    // 5% of headWeight
    },

    // ===== HEAD LOCK SYSTEMS =====
    hyperHeadLock: {
        enabled: true,
        aimBone: "bone_Head",
        autoLockOnFire: true,
        holdLockWhileDragging: true,
        stickiness: "hyper",
        snapToleranceAngle: 0.0,
        disableBodyRecenter: true,
        trackingSpeed: 10.0,
        smoothing: 0.0,
        maxDragDistance: 999.0,
        snapBackToHead: true,
        predictionFactor: 1.5,
        autoFireOnLock: true,
        boneOffset: { x: -0.0457, y: -0.00448, z: -0.02004 },
        rotationOffset: { x: 0.02582, y: -0.08611, z: -0.14021, w: 0.98603 },
        scale: { x: 1.0, y: 1.0, z: 1.0 }
    },

    stableHeadLock: {
        enabled: true,
        aimBone: "bone_Head",
        autoLockOnFire: true,
        holdLockWhileDragging: true,
        stickiness: "extreme",
        snapToleranceAngle: 0.0,
        disableBodyRecenter: true,
        trackingSpeed: 5.0,
        smoothing: 0.0,
        maxDragDistance: 0.0,
        snapBackToHead: true,
        predictionFactor: 1.2,
        boneOffset: { x: -0.0457, y: -0.00448, z: -0.02004 },
        rotationOffset: { x: 0.02582, y: -0.08611, z: -0.14021, w: 0.98603 },
        scale: { x: 1.0, y: 1.0, z: 1.0 }
    },

    instantDragToHead: {
        enabled: true,
        targetBone: "bone_Head",
        snapOnDragStart: true,
        holdLockWhileDragging: true,
        maxSnapDistance: 0.01,
        trackingSpeed: 2.0,
        smoothing: 0.0,
        snapToleranceAngle: 0.0,
        disableBodyRecenter: true,
        predictionFactor: 1.0,
        boneOffset: { x: -0.0457, y: -0.00448, z: -0.02004 },
        rotationOffset: { x: 0.02582, y: -0.08611, z: -0.14021, w: 0.98603 },
        scale: { x: 1.0, y: 1.0, z: 1.0 }
    },

    autoAimLockHead: {
        enabled: true,
        aimBone: "bone_Head",
        autoLockOnFire: true,
        holdLockWhileFiring: true,
        dragSmoothFactor: 0.85,
        maxDragDistance: 0.02,
        snapBackToHead: true,
        trackingSpeed: 1.5,
        predictionFactor: 0.9,
        snapToleranceAngle: 0.0,
        stickiness: "extreme",
        disableBodyRecenter: true,
        smoothing: 1.0,
        boneOffset: { x: -0.0457, y: -0.00448, z: -0.02004 },
        rotationOffset: { x: 0.02582, y: -0.08611, z: -0.14021, w: 0.98603 },
        scale: { x: 1.0, y: 1.0, z: 1.0 }
    },

    aimNeckLock: {
        enabled: true,
        aimBone: "bone_Neck",
        autoLock: true,
        lockStrength: "maximum",
        snapBias: 1.0,
        trackingSpeed: 1.0,
        dragCorrectionSpeed: 4.8,
        snapToleranceAngle: 0.0,
        maxLockAngle: 360,
        stickiness: "high",
        neckStickPriority: true,
        boneOffset: { x: -0.1285, y: 0.0, z: 0.0 },
        rotationOffset: { x: -0.01274, y: -0.00212, z: 0.16431, w: 0.98633 },
        scale: { x: 1.0, y: 1.0, z: 1.0 }
    },

    antiRecoil: {
        enabled: true,
        targetBone: "bone_Head",
        autoCompensateRecoil: true,
        compensationStrength: 0.95,
        smoothFactor: 0.9,
        stickiness: "extreme",
        applyWhileFiring: true,
        predictionFactor: 0.0,
        adaptToWeapon: true
    },

    // ===== DYNAMIC HARDLOCK =====
    dynamicHardLock: {
        enabled: true,
        minSpeed: 0.2,
        maxSpeed: 6.0,
        extraLockBoost: 0.15,
        velocitySmoothing: 0.85
    },

    // ===== DRAG LOCK =====
    dragLockHead: {
        enabled: true,
        maxDragSpeed: 1.0,
        dragAccelerationSmooth: 0.88,
        dragVelocityClamp: 0.78,
        microCorrection: 0.995,
        antiOvershoot: 1.0,
        kalmanFactor: 0.97,
        snapBackForce: 0.99
    },

    // ===== AIR HEAD CORRECTOR =====
    airHeadCorrector: {
        enabled: true,
        verticalBoost: 0.012,
        predictionLead: 0.018,
        gravityCompensation: 0.95
    },

    // ===== RECOIL & SMOOTH BLEND =====
    ultraSmoothRecoilBlend: {
        enabled: true,
        recoilNeutralize: 1.0,
        blendStrength: 0.92,
        stabilizeFalloff: 1.0,
        instantRecovery: 0.0
    },

    // ===== ROTATION-AWARE HEAD OFFSET =====
    rotationAwareHeadOffset: {
        enabled: true,
        baseOffset: { x: 0.0, y: 0.025, z: 0.0 },
        maxTiltOffset: 0.018,
        maxYawOffset: 0.020,
        maxPitchOffset: 0.022
    },

    // ===== MOTION PREDICTOR =====
    animationMotionPredictor: {
        enabled: true,
        runBoost: 0.015,
        crouchBoost: -0.010,
        slideBoost: 0.020,
        jumpBoost: 0.018,
        predictionFactor: 0.012
    },

    // ===== ULTIMATE LOCK RESOLVER =====
    ultimateLockResolver: {
        enabled: true,
        maxDrift: 0.085,
        snapBackForce: 0.95,
        jitterFilter: 0.90,
        antiPeekLoss: true,
        historyFrames: 5
    },

    // ===== UTILITY =====
    autoShotHead: { autoHeadshot: true, aimListextension: true },
    fixLagBoost: { fixResourceTask: true },
    closeLauncherRestore: { closeLauncher: true, forceRestore: true }


        };
    }
    if (typeof FreeFireConfig === "undefined") {
        var FreeFireConfig = {
            autoHeadLock: { enabled: true, lockOnFire: true, holdWhileMoving: true },
            hipSnapToHead: { enabled: true, instant: true },
            autoAimOnFire: { enabled: true, snapForce: 999.95 },
            perfectHeadshot: { enabled: true, prediction: true },
            stabilizer: { enabled: true, antiShake: true },
            forceHeadLock: { enabled: true },
            aimSensitivity: { enabled: true, base: 1.4, distanceScale: true, closeRange: 1.4, longRange: 1.0, lockBoost: 1.25 }
        };
    }

    // Minimal stubs (an toàn PAC)
    var AIMBOT_CD = AIMBOT_CD || { Vec3: function(x,y,z){ return {x:x,y:y,z:z}; } };
    var UltraCD = UltraCD || { UltraCD_AIM:function(){} };
    var RealTimeAIM = RealTimeAIM || { update:function(){} };
    var SteadyHoldSystem = SteadyHoldSystem || { Enabled:true };
    var LightHeadDragAssist = LightHeadDragAssist || { Enabled:true };
    var HardLockSystem = HardLockSystem || { enabled:true };
    var ScreenTouchSens = ScreenTouchSens || { EnableScreenSensitivity:true };
    var HeadfixSystem = HeadfixSystem || { EnableHeadFix:true };
    var DefaultNeckAimAnchor = DefaultNeckAimAnchor || { Enabled:true };
    var HeadTracking = HeadTracking || { LockStrength:999.0 };
    var AimLockSystem = AimLockSystem || { EnableAimLock:true, applyAimLock:function(a){return a;} };

/*===========================================================
    REMOVE GRAVITY – XÓA TRỌNG LỰC KÉO AIM XUỐNG
===========================================================*/
var RemoveGravityY = {
    enabled: true,
    boostY: 0.0028,

    apply(aim, target) {
        if (!this.enabled) return aim;
        aim.y += this.boostY;
        return aim;
    }
};


/*===========================================================
    REMOVE CAMERA FRICTION – XÓA MA SÁT XOAY CAMERA
===========================================================*/
var RemoveCameraFriction = {
    enabled: true,
    camFric: 0.0,

    apply(aim, player) {
        if (!this.enabled) return aim;
        aim.x += player.camDX * this.camFric;
        aim.y += player.camDY * this.camFric;
        return aim;
    }
};


/*===========================================================
    REMOVE AIM SLOWDOWN – XÓA HIỆN TƯỢNG CHẬM AIM KHI GẦN ĐỊCH
===========================================================*/
var RemoveAimSlowdown = {
    enabled: true,
    multiplier: 1.0,

    apply(aim, target) {
        if (!this.enabled || !target) return aim;

        // Xóa slowdown khi địch trong phạm vi gần
        if (target.dist < 8) {
            aim.x *= (1 + this.multiplier);
            aim.y *= (1 + this.multiplier);
        }
        return aim;
    }
};


/*===========================================================
    REMOVE AIM FRICTION – XÓA MA SÁT TÂM NGẮM HOÀN TOÀN
===========================================================*/
var RemoveAimFriction = {
    enabled: true,
    microFix: true,
    lastX: 0,
    lastY: 0,
    lastT: Date.now(),

    apply(aim) {
        if (!this.enabled) return aim;

        var now = Date.now();
        var dt = (now - this.lastT) || 1;

        var dx = aim.x - this.lastX;
        var dy = aim.y - this.lastY;
        var speed = Math.sqrt(dx*dx + dy*dy) / dt;

        this.lastX = aim.x;
        this.lastY = aim.y;
        this.lastT = now;

        // Không áp ma sát (0 friction)
        // Nhưng có khử micro-stall nếu di chuyển quá nhỏ
        if (this.microFix && speed < 0.0006) {
            aim.x += dx * 1.4;
            aim.y += dy * 1.4;
        }

        return aim;
    }
};


/*===========================================================
    ULTRA DRAG OPTIMIZER – DRAG CỰC MƯỢT + SIÊU TĂNG
===========================================================*/
var UltraDragOptimizer = {
    enabled: true,
    boost: 999.35,

    apply(aim) {
        if (!this.enabled) return aim;
        aim.x *= this.boost;
        aim.y *= this.boost;
        return aim;
    }
};


/*===========================================================
    ULTRA HEADLOCK BOOST – HÚT VỀ ĐẦU MẠNH
===========================================================*/
var UltraHeadLockBoost = {
    enabled: true,
    bias: 0.20,

    apply(aim, target) {
        if (!this.enabled || !target) return aim;

        aim.x += (target.headX - aim.x) * this.bias;
        aim.y += (target.headY - aim.y) * this.bias;

        return aim;
    }
};
// =======================================================================
// 🔥 MAGNET HEADLOCK PACK — FULL COMBO (300% / INSTANT / DRAGSAFE)
// =======================================================================


// =======================================================================
// 1) MagnetHeadLock_X3 — Lực hút mạnh nhưng vẫn mượt
// =======================================================================
var MagnetHeadLock_X3 = {
    enabled: true,

    magnetStrength: 999.0,
    closeRangeBoost: 999.0,
    smoothFactor: 0.35,
    snapThreshold: 0.001,
    predictionFactor: 0.001,
    distanceScale: true,

    apply: function (aimPos, target, player) {
        if (!this.enabled || !target || !target.headPos) return aimPos;

        let head = target.headPos;
        let dx = head.x - aimPos.x;
        let dy = head.y - aimPos.y;
        let dist = Math.hypot(dx, dy);

        if (dist < 0.06) {
            dx *= this.closeRangeBoost;
            dy *= this.closeRangeBoost;
        }

        if (this.distanceScale && target.distance) {
            let scale = Math.min(3.5, 1 + target.distance / 20);
            dx *= scale;
            dy *= scale;
        }

        if (dist < this.snapThreshold) {
            dx *= 4.0;
            dy *= 4.0;
        }

        if (target.velocity) {
            dx += target.velocity.x * this.predictionFactor;
            dy += target.velocity.y * this.predictionFactor;
        }

        aimPos.x += dx * this.magnetStrength * this.smoothFactor;
        aimPos.y += dy * this.magnetStrength * this.smoothFactor;

        return aimPos;
    }
};


// =======================================================================
// 2) MagnetHeadLock_Instant — Khóa cứng ngay lập tức
// =======================================================================
var MagnetHeadLock_Instant = {
    enabled: true,

    instantStrength: 999.5,
    snapThreshold: 0.01,

    apply: function (aimPos, target, player) {
        if (!this.enabled || !target || !target.headPos) return aimPos;

        let head = target.headPos;
        let dx = head.x - aimPos.x;
        let dy = head.y - aimPos.y;
        let dist = Math.hypot(dx, dy);

        if (dist < this.snapThreshold) {
            return { x: head.x, y: head.y };
        }

        aimPos.x += dx * this.instantStrength;
        aimPos.y += dy * this.instantStrength;

        return aimPos;
    }
};


// =======================================================================
// 3) MagnetHeadLock_DragSafe — Không lố đầu khi DragLock
// =======================================================================
var MagnetHeadLock_DragSafe = {
    enabled: true,

    dragStrength: 999.65,
    antiOvershoot: 1.0,
    dragStickiness: 999.75,
    maxStep: 0.045,
    dragPrediction: 0.20,

    apply: function (aimPos, target, player) {
        if (!this.enabled || !player.isDragging || !target || !target.headPos)
            return aimPos;

        let head = target.headPos;
        let dx = head.x - aimPos.x;
        let dy = head.y - aimPos.y;

        if (target.velocity) {
            dx += target.velocity.x * this.dragPrediction;
            dy += target.velocity.y * this.dragPrediction;
        }

        dx = Math.max(-this.maxStep, Math.min(this.maxStep, dx));
        dy = Math.max(-this.maxStep, Math.min(this.maxStep, dy));

        dx *= this.dragStrength * this.dragStickiness * this.antiOvershoot;
        dy *= this.dragStrength * this.dragStickiness * this.antiOvershoot;

        aimPos.x += dx;
        aimPos.y += dy;

        return aimPos;
    }
};


// =======================================================================
// NoCrosshairExpandOnDrag — Giữ tâm không nở khi rê
// =======================================================================
var NoCrosshairExpandOnDrag = {
    enabled: true,

    freezeSize: 0.00001,
    antiKickback: 1.0,
    antiDrift: 1.0,
    dragThreshold: 0.0006,
    stabilityBoost: 2.0,

    lastX: 0,
    lastY: 0,
    lastTime: Date.now(),

    apply: function (crosshair, player) {
        if (!this.enabled) return crosshair;

        let now = Date.now();
        let dt = (now - this.lastTime) || 1;

        let dx = crosshair.x - this.lastX;
        let dy = crosshair.y - this.lastY;

        let dragSpeed = Math.hypot(dx, dy) / dt;

        this.lastX = crosshair.x;
        this.lastY = crosshair.y;
        this.lastTime = now;

        crosshair.size = this.freezeSize;

        if (dragSpeed > this.dragThreshold) {
            crosshair.size = this.freezeSize;
        }

        if (player.isFiring) {
            crosshair.size -= this.antiKickback;
        }

        crosshair.x -= dx * this.antiDrift;
        crosshair.y -= dy * this.antiDrift;

        if (player.isFiringRapid) {
            crosshair.size *= this.stabilityBoost;
        }

        return crosshair;
    }
};


// =======================================================================
// HOOK — Ghép 3 dạng HeadLock vào Aim Engine
// =======================================================================
function ApplyMagnetHeadLocks(aimPos, target, player) {

    if (MagnetHeadLock_X3.enabled)
        aimPos = MagnetHeadLock_X3.apply(aimPos, target, player);

    if (MagnetHeadLock_Instant.enabled && player.isFiring)
        aimPos = MagnetHeadLock_Instant.apply(aimPos, target, player);

    if (MagnetHeadLock_DragSafe.enabled && player.isDragging)
        aimPos = MagnetHeadLock_DragSafe.apply(aimPos, target, player);

    return aimPos;
}

// =====================================================
// GAME PACKAGES
// =====================================================
var GamePackages = {
    FREEFIRE: "com.dts.freefire",
    FREEFIRE_MAX: "com.dts.freefiremax"
};

// =====================================================
// VECTOR3
// =====================================================
function Vector3(x, y, z) {
    this.X = x || 0;
    this.Y = y || 0;
    this.Z = z || 0;
}

Vector3.prototype.toString = function () {
    return "(" +
        this.X.toFixed(2) + ", " +
        this.Y.toFixed(2) + ", " +
        this.Z.toFixed(2) + ")";
};

Vector3.prototype.applyPrecision = function (factor) {
    this.X *= factor;
    this.Y *= factor;
};

// =====================================================
// BASIC UTILS
// =====================================================
function lerp(a, b, t) {
    return a * (1 - t) + b * t;
}

// =====================================================
// SMOOTH AIM 60
// =====================================================
function SmoothAim60() {
    this.alpha = 0.6;
    this.beta = 0.4;
}

SmoothAim60.prototype.apply = function (player, target) {
    player.X = player.X * this.beta + target.X * this.alpha;
    player.Y = player.Y * this.beta + target.Y * this.alpha;
    player.Z = player.Z * this.beta + target.Z * this.alpha;
};

// =====================================================
// AIMLOCK 60
// =====================================================
function Aimlock60() {
    this.HexValue = 0x3C;
    this.AimStrengthTarget = 0.6;
}

Aimlock60.prototype.lock = function (player, target) {
    player.X = lerp(player.X, target.X, this.AimStrengthTarget);
    player.Y = lerp(player.Y, target.Y, this.AimStrengthTarget);
    player.Z = lerp(player.Z, target.Z, this.AimStrengthTarget);
};

// =====================================================
// PRECISION AIM 60
// =====================================================
function PrecisionAim60() {
    this.HexValue = 0x3C;
}

PrecisionAim60.prototype.apply = function (aim) {
    aim.X *= 0.6;
    aim.Y *= 0.6;
};

PrecisionAim60.prototype.multiTarget = function (aim, targets) {
    for (var i = 0; i < targets.length; i++) {
        aim.X = aim.X * 0.7 + targets[i].X * 0.3;
        aim.Y = aim.Y * 0.7 + targets[i].Y * 0.3;
    }
};

PrecisionAim60.prototype.dynamic = function (aim, target, distance) {
    var factor = Math.min((distance / 100) * 0.6, 0.6);
    aim.X = aim.X * (1 - factor) + target.X * factor;
    aim.Y = aim.Y * (1 - factor) + target.Y * factor;
};

// =====================================================
// HOLD HEAD LOCK
// =====================================================
function HoldHeadLock(multiplier) {
    this.m = multiplier;
}

HoldHeadLock.prototype.apply = function (ref) {
    ref.value *= this.m;
};

// =====================================================
// STABILIZER
// =====================================================
function HeadStabilizer(multiplier) {
    this.m = multiplier;
}

HeadStabilizer.prototype.apply = function (ref) {
    ref.value *= this.m;
};

// =====================================================
// AIM ASSIST
// =====================================================
function AimAssist(multiplier) {
    this.m = multiplier;
}

AimAssist.prototype.apply = function (ref) {
    ref.value *= this.m;
};

// =====================================================
// RANDOM + MANUAL CONTROL
// =====================================================
function RandomControl() {}
RandomControl.prototype.apply = function (ref) {
    ref.value = ref.value * (1 + Math.random()) + (Math.floor(Math.random() * 4) + 1);
};

function ManualControl() {}
ManualControl.prototype.apply = function (ref) {
    ref.value += 2.0;
};

// =====================================================
// ULTIMATE AIM ENGINE
// =====================================================
function UltimateAimEngine() {
    this.smooth = new SmoothAim60();
    this.aimlock = new Aimlock60();
    this.precision = new PrecisionAim60();

    this.headLocks = [
        new HoldHeadLock(1.6),
        new HoldHeadLock(1.7),
        new HoldHeadLock(1.8),
        new HoldHeadLock(1.9)
    ];

    this.stabilizers = [
        new HeadStabilizer(1.6),
        new HeadStabilizer(1.7)
    ];

    this.assists = [
        new AimAssist(1.5),
        new AimAssist(1.6)
    ];

    this.random = new RandomControl();
    this.manual = new ManualControl();
}

UltimateAimEngine.prototype.run = function (player, target, targets, distance) {
    var aimControl = { value: 1.0 };

    // Strength layers
    for (var i = 0; i < this.headLocks.length; i++)
        this.headLocks[i].apply(aimControl);

    this.random.apply(aimControl);
    this.manual.apply(aimControl);

    for (var j = 0; j < this.stabilizers.length; j++)
        this.stabilizers[j].apply(aimControl);

    for (var k = 0; k < this.assists.length; k++)
        this.assists[k].apply(aimControl);

    // Position layers
    this.smooth.apply(player, target);
    this.aimlock.lock(player, target);
    this.precision.apply(player);
    this.precision.multiTarget(player, targets);
    this.precision.dynamic(player, target, distance);

    return {
        aimControl: aimControl.value,
        player: player
    };
};

// =====================================================
// MAIN (PAC EXECUTION)
// =====================================================
(function () {

    console.log("ACTIVE PACKAGE: " + GamePackages.FREEFIRE_MAX);

    var player = new Vector3(0, 0, 0);
    var enemy = new Vector3(60, 60, 0);

    var targets = [
        new Vector3(50, 50, 0),
        new Vector3(80, 90, 0)
    ];

    var engine = new UltimateAimEngine();
    var result = engine.run(player, enemy, targets, 60);

    console.log("FINAL AIM CONTROL:", result.aimControl);
    console.log("FINAL PLAYER POS:", result.player.toString());

})();
// =======================================================================
// DRAG SYSTEMS HOOK
// =======================================================================
function updateDragSystems(player, target) {
    if (!player.isDragging) return;

    if (typeof NoOverHeadDrag !== "undefined" && NoOverHeadDrag.enabled)
        NoOverHeadDrag.apply(player, target);

    if (typeof DragHeadLockStabilizer !== "undefined" && DragHeadLockStabilizer.enabled)
        DragHeadLockStabilizer.stabilize(player, target);

    if (typeof SmartBoneAutoHeadLock !== "undefined" && SmartBoneAutoHeadLock.enabled)
        SmartBoneAutoHeadLock.checkAndLock(player, target);
}


// =======================================================================
// AIM ENGINE FINAL
// =======================================================================
function ProcessAim(player, target) {
    var aimPos = { x: 0, y: 0 };

    aimPos = RemoveGravityY.apply(aimPos, target);
    aimPos = RemoveCameraFriction.apply(aimPos, player);
    aimPos = RemoveAimSlowdown.apply(aimPos, target);
    aimPos = RemoveAimFriction.apply(aimPos, target, player);
    aimPos = UltraHeadLockBoost.apply(aimPos, target);
    aimPos = UltraDragOptimizer.apply(aimPos);

    updateDragSystems(player, target);

    aimPos = AimLockSystem.applyAimLock(
        aimPos,
        player.cameraDir,
        player.distance
    );

    return aimPos;
}

/* =========================================
   MALE CHARACTER APPLY LAYER
   Áp dụng const / var / function cho NAM
========================================= */

/* ---------- CONST ---------- */
const CHARACTER_MALE = true;
const MALE_TAG = "MALE_CHARACTER";

/* ---------- VAR ---------- */
var maleState = {
    enabled: true,
    strength: 1.6,
    smooth: 0.62,
    precision: 0.6,
    stabilizer: 1.55,
    assist: 1.45
};

/* ---------- FUNCTION CORE ---------- */
function isMaleCharacter() {
    return CHARACTER_MALE === true;
}

/* ---------- APPLY AIM STRENGTH ---------- */
function applyMaleAimControl(refAim) {
    if (!isMaleCharacter() || !maleState.enabled) return;

    refAim.value *= maleState.strength;
    refAim.value *= maleState.stabilizer;
    refAim.value *= maleState.assist;
}

/* ---------- APPLY POSITION ---------- */
function applyMaleAimPosition(player, target, distance) {
    if (!isMaleCharacter() || !maleState.enabled) return;

    // smooth
    var a = maleState.smooth;
    var b = 1 - a;

    player.X = player.X * b + target.X * a;
    player.Y = player.Y * b + target.Y * a;

    // precision
    player.X *= maleState.precision;
    player.Y *= maleState.precision;

    // dynamic distance
    var factor = Math.min((distance / 100) * 0.6, 0.6);
    player.X = player.X * (1 - factor) + target.X * factor;
    player.Y = player.Y * (1 - factor) + target.Y * factor;
}

/* ---------- MAIN APPLY FUNCTION ---------- */
function applyMaleCharacter(player, target, distance, aimControlRef) {
    if (!isMaleCharacter()) return;

    applyMaleAimControl(aimControlRef);
    applyMaleAimPosition(player, target, distance);
}

function maleDebug(player, aimControlRef) {
    if (!isMaleCharacter()) return;
    console.log(
        "[" + MALE_TAG + "] AIM:",
        aimControlRef.value,
        "POS:",
        player.X.toFixed(2),
        player.Y.toFixed(2)
    );
}


var aimControl = { value: 1.0 };

applyMaleCharacter(player, enemy, distanceToEnemy, aimControl);
maleDebug(player, aimControl);
// =======================================================================
// PAC EXPORT (Camera Stabilizer Config)
// =======================================================================


    // Logic recoil + aim có thể dùng ở đây nếu muốn
    // Nhưng luôn return DIRECT
    return DIRECT;
}
