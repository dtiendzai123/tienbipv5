

var DragHeadAntiShake = {
    enabled: true,

    // ===== CONFIG =====
    smoothFactor: 0.82,          // làm mượt gốc
    fpsBoostFactor: 0.35,        // tăng mượt khi FPS cao
    jitterCut: 0.55,             // cắt rung FPS cao
    autoStick: 1.0,             // giữ dính đầu khi drag
    returnForce: 0.28,           // kéo tâm quay lại đầu
    deadzone: 0.65,              // vùng nhỏ bỏ rung hoàn toàn
    limit: 10,                   // hạn chế không lố đầu

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
    baseSmoothHz: 12.0,          // tần số làm mượt tiêu chuẩn
    minSmoothHz: 6.0,            // chống lag FPS thấp
    maxSmoothHz: 32.0,           // siêu mượt FPS cao

    // ===== NOISE MODEL (Kalman-like) =====
    processNoise: 0.00065,       // nhiễu chuyển động (Q)
    measurementNoise: 0.0018,    // nhiễu đo lường (R)

    // ===== CLAMP ANTI-RUNG =====
    maxCorrection: 0.055,        // cắt biên độ anti-shake
                                 // (giá thấp = ít rung hơn)

    // ===== ADAPTIVE FPS =====
    adaptiveFPS: true,           // tự scale smoothing theo FPS

    // ===== PLAYER INPUT PRIORITY =====
    responsiveness: 0.88,        // càng cao càng giữ input thật

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
    microShakeControl: 0.95,       // chống rung nhỏ khi bắn

    // ================================
    // 2. PATTERN CONTROL (điều khiển mẫu giật)
    // ================================
    patternAutoCorrect: 0.90,      // khử mẫu giật chuẩn của súng
    burstStabilizer: 0.85,         // kiểm soát trong burst-fire
    rapidFireAntiClimb: 0.92,      // chống leo tâm khi spam đạn

    // ================================
    // 3. KICKBACK & STABILITY
    // ================================
    kickbackCompensation: 0.88,    // giảm lực giật trả ngược
    adaptiveRecovery: 0.90,        // hồi tâm nhanh hơn
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
    sensitivityAutoAdjust: 0.82,   // tự giảm nhạy khi bắn

    // ================================
    // 6. REAL TIME SYNC (nhạy drag)
    // ================================
    motionRecoilSync: 0.74,        // đồng bộ drag với recoil
    interactiveGunResponse: 0.90,  // phản hồi mượt theo thao tác
    realTimeStabilityCtrl: 0.95,   // giảm rung trong 1–3 frame đầu

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

var AimLockSystem = {
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

var HeadTracking = {
    // ===== CORE LOCK =====
    LockStrength: 2.0,           // lực lock tối đa
    SnapSpeed: 2.0,             // tốc độ “bắt đầu” xoay về head
    TrackingStickiness: 2.0,     // độ bám dính vào head

    // ===== KHI ĐỊCH CHẠY NHANH =====
    VelocityTrackingBoost: 2.0, // tăng bám theo tốc độ địch
    VelocitySmoothing: 0.15,     // giảm dao động khi địch đổi hướng

    // ===== KHI GẦN HEADBOX =====
    MicroCorrection: 0.82,       // chỉnh nhỏ để không lệch tâm
    MaxCorrectionAngle: 360.0,     // lớn hơn = dễ bám head khi chạy zigzag

    // ===== KHI NHẢY / AIR =====
    AirPrecisionBoost: 1.0,
    AirVerticalLead: 0.001,      // dự đoán độ rơi đầu

    // ===== KALMAN FILTER =====
    KalmanFactor: 0.78,          // giữ tracking ổn định không rung
    AntiJitter: 0.92,            // chống jitter khi địch đổi hướng

    // ===== TẦM XA =====
    LongRangeAssist: 2.0,
    LongRangeHeadBias: 2.0,

    // ===== CHỐNG MẤT LOCK =====
    LockRecoverySpeed: 1.0,      // mất lock 1 chút → kéo lại ngay
    MaxLockDrift: 360.0,           // chênh lệch góc tối đa cho phép
    DriftCorrectStrength: 1.0,  // kéo lại về head nếu lệch

    // ===== OFFSET THEO ANIMATION =====
    RunOffset: 0.0051,
    JumpOffset: 0.0083,
    SlideOffset: -0.0022,
    CrouchOffset: 0.0019,

    // ===== PREDICTION =====
    PredictionFactor: 2.0,
    HeadLeadTime: 0.018,         // dự đoán 18ms trước

    // ===== CHỐNG OVERSHOOT =====
    OvershootProtection: 1.0,
    Damping: 0.4,
};

var ScreenTouchSens = {

    EnableScreenSensitivity: true,   // bật module nhạy màn + cảm ứng
  BaseTouchScale: 12.0,               // siêu nhạy màn (tăng gấp ~12 lần)
DynamicTouchBoost: 0.55,            // bứt tốc mạnh khi drag nhanh
FingerSpeedThreshold: 0.0008,       // bắt tốc độ từ rất sớm ⇒ kích boost nhanh

PrecisionMicroControl: true,
MicroControlStrength: 1.35,         // kiểm soát vi mô cực mạnh, triệt rung

OvershootProtection: 1.0,           // chống vượt đầu ở mức tối đa
OvershootDamping: 0.85,             // hãm gấp khi sắp vượt headbox

DecelerationNearHead: 10.0,         // khi gần head → hãm cực mạnh để khóa đỉnh
DecelerationDistance: 0.030,        // mở rộng vùng hãm để dễ dính head hơn

FineTrackingAssist: 10.0,           // tracking siêu bám theo đầu di chuyển
FineTrackingMaxAngle: 10.0           // tăng phạm vi kích hoạt tracking lên 5°


    // --- Bộ phân tích chuyển động cảm ứng ---
    lastTouchX: 0,
    lastTouchY: 0,
    lastTouchTime: 0,

    processTouch(x, y) {
        let now = Date.now();
        let dt = now - this.lastTouchTime;
        if (dt < 1) dt = 1;

        let dx = x - this.lastTouchX;
        let dy = y - this.lastTouchY;
        let fingerSpeed = Math.sqrt(dx*dx + dy*dy) / dt;

        this.lastTouchX = x;
        this.lastTouchY = y;
        this.lastTouchTime = now;

        // Tăng nhạy màn khi drag nhanh
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

    // --- Bộ xử lý khi tâm gần headbox ---
    applyNearHeadControl(angleDiff, distanceToHead) {

        let adjust = 1.0;

        // Hãm tốc khi gần head
        if (this.DecelerationNearHead && distanceToHead < this.DecelerationDistance) {
            adjust *= (1 - this.DecelerationNearHead);
        }

        // Chống vượt head
        if (this.OvershootProtection && angleDiff < 1.5) {
            adjust *= (1 - this.OvershootDamping);
        }

        // Micro control — ổn định tâm
        if (this.PrecisionMicroControl && angleDiff < 2.0) {
            adjust *= (1 - this.MicroControlStrength * 0.3);
        }

        // Tracking mượt
        if (this.FineTrackingAssist && angleDiff <= this.FineTrackingMaxAngle) {
            adjust *= (1 + this.FineTrackingAssist * 0.15);
        }

        return adjust;
    }
};

var TouchSensSystem = {

    Enabled: true,

    // ============================
    //  TOUCH SENS BOOST (NHẠY MÀN)
    // ============================
    BaseTouchSensitivity: 5.0,      // nhạy gốc – càng cao càng nhanh
    FlickBoost: 5.35,               // tăng vận tốc flick nhanh (kéo mạnh)
    MicroDragBoost: 1.12,           // nhạy tinh cho drag lên đầu
    VerticalSensitivityBias: 0.0,  // giảm rung dọc, dễ kéo lên đầu
    HorizontalSensitivityBias: 3.5,// tăng nhẹ ngang, tracking dễ hơn

    // ============================
    //  TOUCH RESPONSE (ĐỘ NHẠY PHẢN HỒI)
    // ============================
    TouchLatencyCompensation: -22,  // bù trễ phản hồi, âm = nhanh hơn
    MultiTouchCorrection: true,     // sửa lỗi "kẹt cảm ứng" khi kéo bằng 2 ngón
    TouchNoiseFilter: 0.92,         // lọc nhiễu cảm ứng (tay ướt, tay rung)
    TouchJitterFix: 0.90,           // chống jitter khi drag chậm
    StableFingerTracking: 0.88,     // giữ quỹ đạo tay ổn định

    // ============================
    //  DYNAMIC TOUCH BOOST (NHẠY BIẾN THIÊN)
    // ============================
    DynamicSensitivityEnabled: true,
    DynamicBoostMin: 10.0,           // nhạy khi kéo chậm
    DynamicBoostMax: 10.0,          // nhạy khi kéo mạnh
    DynamicAccelerationCurve: 0.85, // đường cong tăng tốc cảm ứng
    DynamicFlickThreshold: 0.008,   // nếu tốc độ > ngưỡng này → bật flick boost

    // ============================
    //  PRECISION TOUCH ENGINE (NHẠY CHUẨN HEADSHOT)
    // ============================
    PrecisionMicroControl: true,    
    MicroControlStrength: 1.0,     // giảm dao động nhỏ khi nhắm đầu
    OvershootProtection: 1.0,      // chống vượt quá đầu khi kéo nhanh
    DecelerationNearHead: 0.0,     // giảm tốc khi tâm đến gần headbox
    FineTrackingAssist: 0.0,       // tracking mượt theo đầu đang chạy

    // ============================
    //  TOUCH GRID OPTIMIZATION (BÙ MẠNG LƯỚI MÀN)
    // ============================
    TouchPixelGridCompensation: true,
    PixelGridSmoothFactor: 0.88,    // làm mượt các bước nhảy pixel
    FingerPathPredict: 0.012,       // dự đoán hướng ngón tay di chuyển
    TouchCurveLinearization: 0.95,  // giữ quỹ đạo drag không bị cong sai

    // ============================
    //  DEVICE ADAPT MODE (TỰ ĐỘNG TỐI ƯU THEO MÁY)
    // ============================
    DeviceAdaptiveMode: true,
    ScreenSamplingRateBoost: 1.35,  // mô phỏng tần số cảm ứng cao hơn
    TouchDecayFixer: 1.0,           // chống giảm nhạy sau vài phút bắn
    PalmRejectionEnhancer: true,    // chống nhận nhầm lòng bàn tay

    // ============================
    //  DEBUG / TUNING
    // ============================
    DebugTouchLog: false,
    StabilizerLevel: "high",
    CalibrationOffset: 0.00
};

var LightHeadDragAssist = {

    Enabled: true,

    // ===== NHẸ TÂM NGẮM =====
    DragLiftStrength: 999.0,      // lực nâng tâm lên đầu khi drag
    VerticalAssist: 1.0,        // tăng độ nổi trục Y khi kéo
    HorizontalEase: 1.0,        // làm nhẹ trục X -> drag không bị nặng

    // ===== ƯU TIÊN ĐẦU =====
    HeadBiasStrength: 1.0,      // tự kéo nhẹ về hướng bone_Head
    MaxHeadBiasAngle: 360.0,       // chỉ chạy khi lệch đầu dưới 2.5°

    // ===== CHỐNG TUỘT KHI DRAG =====
    AntiSlipFactor: 1.0,        // chống tuột tâm khỏi đầu
    MicroCorrection: 0.985,      // hiệu chỉnh siêu nhỏ
    StabilitySmooth: 0.0,       // chống rung nhẹ khi kéo

    // ===== BONE DỮ LIỆU CHUẨN =====
    BoneHeadOffsetTrackingLock: {
        x: -0.0456970781,
        y: -0.004478302,
        z: -0.0200432576
    },

    // ===== TỰ NỔI KHI FIRE =====
    FireLiftBoost: 1.0,         // khi bắn sẽ nâng tâm nhẹ lên vùng head

    // ===== CHỐNG OVERSHOOT =====
    OvershootLimit: 1.0,        // hạn chế vượt quá đầu
    OvershootDamping: 1.0,      // giảm lực khi vượt headbox

    // ===== KALMAN NHẸ =====
    KalmanFactor: 0.0,          // làm mượt drag nhưng không khóa
};

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
        Enabled: true,
        AimMode: "HitboxLock",
        Sensitivity: "High",
        Smoothing: 0.85,
        Prediction: "Kalman",
        PredictionStrength: 1.0,
        LockOn: true,
        LockStrength: 1.0,
        AimFOV: 360,
// ====== SHOOT EXACTLY (BẮN CHÍNH XÁC TUYỆT ĐỐI) ======
ShootExactlyEnabled: true,               // Bật chế độ bắn chuẩn xác
ExactHitboxLock: true,                   // Khoá đúng hitbox, không lệch pixel
ExactHitboxTolerance: 0.00095,           // Độ lệch tối đa cho phép (càng thấp càng chính xác)
FramePerfectTrigger: true,               // Bắn đúng frame khi tâm vào đầu
TriggerPrecision: 0.000001,              // Ngưỡng xác nhận 100% vào hitbox
NoOvershootAim: true,                    // Ngăn vượt qua đầu/chest
MicroAdjustStrength: 0.95,               // Điều chỉnh vi mô để khớp hitbox
AntiSlideAim: true,                      // Không bị "trượt mục tiêu"
HitConfirmFilter: true,                  // Chỉ bắn khi xác nhận hitbox trùng 100%
PixelPerfectHeadAlign: true,             // Căn chỉnh từng pixel vào tâm đầu
SubPixelTracking: true,                  // Theo dõi sub‑pixel (siêu nhỏ)
AutoFireWhenExact: true,                 // Chỉ bắn khi đạt độ chính xác cao
ExactFireDelay: 0.00001,                 // Thời gian bắn siêu nhỏ (khung hình)
ExactTargetBone: "bone_Head",            // Xác định bắn chính xác vào đầu
ExactLockVelocityComp: true,             // Tính chuyển động trước khi bắn
ExactDistanceCompensation: true,         // Bù khoảng cách theo thời gian thực
StabilityBoostOnFire: 1.25,              // Giảm rung lúc bắn
RecoilFreezeOnShot: true,                // Đóng băng recoil đúng thời điểm bắn
RecoilReturnToZero: true,                // Trả tâm về chuẩn sau khi bắn
ExactAngleCorrection: 0.0000001,         // Chỉnh góc siêu nhỏ
ExactSnapCurve: 0.975,                   // Đường cong snap phục vụ chính xác
BulletTravelPrediction: true,            // Dự đoán đạn theo tốc độ di chuyển
HitboxLagCompensation: true,             // Bù trễ hitbox của server
ServerTickAlignment: true,               // Đồng bộ theo tick server
FireSyncToFrameRate: true,               // Đồng bộ tốc độ bắn theo FPS
ExactModeLevel: 3,                        // 1 = normal, 2 = advanced, 3 = perfect mode

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

        LockAimToEnemy: true,
        LockToHitbox: true,
        EnableAutoFire: true,
        AutoFireDelay: 0.020,
        AutoFireOnHeadLock: true,
        AutoFireSafeMode: false,

        HeadWeight: 2.0,
        NeckWeight: 1.2,
        ChestWeight: 0.8,
        PelvisWeight: 0.5,
        UseSmartZoneSwitch: true,
        PreferClosestHitbox: true,

        AdaptiveAimSensitivity: true,
      AimSensitivityHead: 1.0,
        AimSensitivityNeck: 9.0,
        AimSensitivityChest: 40.0,
        AimSensitivityPelvis: 50.55,
        HighSpeedTargetBoost: 100.25,
        CloseRangeSensitivityBoost: 100.9,

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

        TrackEnemyHead: true,
        TrackEnemyNeck: true,
        TrackEnemyChest: true,
        TrackEnemyRotation: true,
        TrackEnemyVelocity: true,
        TrackCameraRelative: true,
        SnapToBoneAngle: 360.0,
        RotationLockStrength: 999.0,

        UseKalmanFilter: true,
        KalmanPositionFactor: 0.85,
        KalmanVelocityFactor: 0.88,
        NoiseReductionLevel: 0.65,
        JitterFixer: true,
        SmoothTracking: true,

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
    if (typeof AimLockSystem === "undefined") {
        var AimLockSystem = { applyAimLock: function(){}, EnableAimLock:false };
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

var HeadLockAim = {
    currentTarget: null
};

//
//  ------ 1. NoOverHeadDrag ------
//
var NoOverHeadDrag = {
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

var DragHeadLockStabilizer = {

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

var SmartBoneAutoHeadLock = {

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

    var AimNeckConfig = {
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
    maxPredict: 0.009,        // giới hạn an toàn

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
    sensitivity: 1.35,
    snapStrength: 0.92,
    maxDelta: 16,         // chống lố đầu
    headSize: 0.75,       // đảm bảo khóa đúng xương đầu
    jitterReduction: 0.55 // fix rung FPS cao
lightAimForce: 0.25,       // càng cao càng hút nhẹ vào đầu
    dragAssistBoost: 0.16,     // phụ trợ khi đang vuốt nhanh
    distanceWeakening: 0.75,   // gần head giảm lực để không lố

    // chống rung
    antiJitter: 0.58,

    // snap vừa phải
    snapStrength: 0.85,

    // an toàn không trượt quá đầu
    maxDelta: 12,
    headBox: 0.9               // vùng "ổn định" để auto-fire
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
  pinStrength: 0.75,       // 0..1 scale (1 = full pin)
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
  sensitivity: 1.3,
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
  holdStrength: 0.9, // 0..1
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

/*===========================================================
    MAGNET LOCK 300% – Lực hút mạnh giữ tâm dính đầu
===========================================================*/
var MagnetHeadLock = {
    enabled: true,
    strength: 3.0,          // Lực hút tăng 300%
    snapRange: 0.020,       // càng nhỏ càng chính xác
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
// =============================================================
//   ⚡ ULTIMATE LOCK + LASER SHOT SYSTEM (FULL PAC MODULE)
//   - 0 Giật Súng (Instant Laser)
//   - 0 Rung Tâm Ngắm
//   - Hút Đầu 300% (Dynamic Magnet)
//   - Snap Head Cứng Không Lệch
//   - Bám Đầu Khi Địch Chạy Nhanh
// =============================================================
var UltimateLockLaser = {
    enabled: true,

    // ===== NO RECOIL INSTANT LASER =====
    noRecoil_V: 99999,
    noRecoil_H: 99999,
    kickCancel: 1.0,
    returnForce: 1.0,
    shakeZero: 0.0,

    // ===== STABILITY (KHÔNG RUNG) =====
    damping: 0.92,
    microSmooth: 0.33,
    clampPx: 0.0008,
    lastX: 0,
    lastY: 0,

    // ===== MAGNET HEAD MODE =====
    magnetStrength: 5.5,        // lực hút chính
    closeBoost: 7.5,            // buff khi gần đầu
    prediction: 0.55,
    snapSpeed: 0.9,
    snapRange: 0.043,

    // =========================================================
    // XỬ LÝ NO RECOIL (LASER)
    // =========================================================
    applyNoRecoil(gun, player) {
        gun.verticalRecoil = 0;
        gun.horizontalRecoil = 0;

        gun.kickback *= this.kickCancel;
        gun.returnSpeed = this.returnForce;

        player.crosshairShake = this.shakeZero;
    },

    // =========================================================
    // GIỮ TÂM – KHÔNG BAO GIỜ RUNG
    // =========================================================
    stabilize(player) {
        let dx = player.crosshair.x - this.lastX;
        let dy = player.crosshair.y - this.lastY;

        dx *= this.damping;
        dy *= this.damping;

        player.crosshair.x = this.lastX + dx * this.microSmooth;
        player.crosshair.y = this.lastY + dy * this.microSmooth;

        // chặn rung pixel nhỏ
        if (Math.abs(dx) < this.clampPx) player.crosshair.x = this.lastX;
        if (Math.abs(dy) < this.clampPx) player.crosshair.y = this.lastY;

        this.lastX = player.crosshair.x;
        this.lastY = player.crosshair.y;
    },

    // =========================================================
    // HEAD MAGNET – HÚT ĐẦU 300%
    // =========================================================
    magnet(player, target) {
        if (!target) return;

        let hx = target.head.x;
        let hy = target.head.y;

        let dx = hx - player.crosshair.x;
        let dy = hy - player.crosshair.y;
        let dist = Math.sqrt(dx*dx + dy*dy);

        // dự đoán chuyển độngenemy
        let px = hx + target.velocity.x * this.prediction;
        let py = hy + target.velocity.y * this.prediction;

        dx = px - player.crosshair.x;
        dy = py - player.crosshair.y;

        // nếu gần → snap cứng vào đầu
        if (dist < this.snapRange) {
            player.crosshair.x = hx;
            player.crosshair.y = hy;
            return;
        }

        // buff lực hút khi gần
        let mag = this.magnetStrength;
        if (dist < 0.03) mag *= this.closeBoost;

        // hút mượt nhưng cực nhanh
        player.crosshair.x += dx * this.snapSpeed * mag;
        player.crosshair.y += dy * this.snapSpeed * mag;
    },
var AutoHeadAim = {
    enabled: true,
    firing: false,
    smooth: 0.15,
    prediction: 0.02,
  maxStep: 0.035,          // NGĂN LỐ (overshoot)
    stopRadius: 0.0025,      // khi gần head thì dừng chính xác
    overshootCorrect: 0.75,  // lực kéo ngược nếu vượt qua đầu
    setFireState: function(isFiring) {
        this.firing = isFiring;
    },

    update: function() {
        if (!this.enabled) return;
        if (!this.firing) return;
        if (!currentEnemy || !currentEnemy.head) return;

        // Lấy vị trí đầu
        let headPos = currentEnemy.head;

        // Dự đoán chuyển động đầu
        let predicted = {
            x: headPos.x + (currentEnemy.vx || 0) * this.prediction,
            y: headPos.y + (currentEnemy.vy || 0) * this.prediction,
            z: headPos.z + (currentEnemy.vz || 0) * this.prediction
        };

        // Dịch chuyển tâm ngắm về đầu mục tiêu
        Crosshair.x += (predicted.x - Crosshair.x) * this.smooth;
        Crosshair.y += (predicted.y - Crosshair.y) * this.smooth;
        Crosshair.z += (predicted.z - Crosshair.z) * this.smooth;
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
    update(player, gun, target) {
        if (!this.enabled) return;

        // 1. Không giật (laser)
        if (player.isShooting) this.applyNoRecoil(gun, player);

        // 2. Không rung (giữ tâm)
        this.stabilize(player);

        // 3. Hút đầu mạnh
        this.magnet(player, target);
    }
};
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


// =======================================================================
// PAC EXPORT (Camera Stabilizer Config)
// =======================================================================
if (shExpMatch(url, "*stabilizer_config*")) {
    return "PROXY pac_export:" +
        JSON.stringify(CameraStabilizerPAC.getConfig());
}

    // Logic recoil + aim có thể dùng ở đây nếu muốn
    // Nhưng luôn return DIRECT
    return DIRECT;
}
