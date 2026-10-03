//=============================================================================
// TerrainFootsteps.js
//=============================================================================
/*:
 * @target MZ
 * @plugindesc 걸을 때마다 밟은 지형(지형 태그·리전)에 맞는 발소리를 냅니다.
 * @author Claude
 *
 * @requiredAssets audio/se/Step_Default
 * @requiredAssets audio/se/Step_Grass
 * @requiredAssets audio/se/Step_Dirt
 * @requiredAssets audio/se/Step_Stone
 * @requiredAssets audio/se/Step_Wood
 * @requiredAssets audio/se/Step_Water
 * @requiredAssets audio/se/Step_Snow
 *
 * @param tag0
 * @text 지형 태그 0 (태그 없음)
 * @desc 지형 태그를 정하지 않은 타일의 발소리입니다. 효과음을 비우면 소리가 나지 않습니다.
 * @type struct<StepSound>
 * @default {"name":"Step_Default","volume":"35","pitch":"100"}
 *
 * @param tag1
 * @text 지형 태그 1 (풀)
 * @type struct<StepSound>
 * @default {"name":"Step_Grass","volume":"40","pitch":"100"}
 *
 * @param tag2
 * @text 지형 태그 2 (흙·모래)
 * @type struct<StepSound>
 * @default {"name":"Step_Dirt","volume":"40","pitch":"100"}
 *
 * @param tag3
 * @text 지형 태그 3 (돌·포장길)
 * @type struct<StepSound>
 * @default {"name":"Step_Stone","volume":"40","pitch":"100"}
 *
 * @param tag4
 * @text 지형 태그 4 (나무 바닥)
 * @type struct<StepSound>
 * @default {"name":"Step_Wood","volume":"40","pitch":"100"}
 *
 * @param tag5
 * @text 지형 태그 5 (얕은 물)
 * @type struct<StepSound>
 * @default {"name":"Step_Water","volume":"45","pitch":"100"}
 *
 * @param tag6
 * @text 지형 태그 6 (눈)
 * @type struct<StepSound>
 * @default {"name":"Step_Snow","volume":"40","pitch":"100"}
 *
 * @param tag7
 * @text 지형 태그 7 (빈칸: 카펫 등 소리 없음)
 * @type struct<StepSound>
 * @default {"name":"","volume":"40","pitch":"100"}
 *
 * @param regionSounds
 * @text 리전별 발소리
 * @desc 리전 ID를 칠한 칸은 지형 태그보다 이 설정이 먼저 적용됩니다.
 * @type struct<RegionSound>[]
 * @default []
 *
 * @param pitchVariance
 * @text 피치 흔들림(±)
 * @desc 걸음마다 피치를 이만큼 무작위로 바꿔서 같은 소리의 반복이 덜 기계적으로 들리게 합니다.
 * @type number
 * @min 0
 * @max 30
 * @default 8
 *
 * @param volumeVariance
 * @text 음량 흔들림(±%)
 * @type number
 * @min 0
 * @max 50
 * @default 10
 *
 * @param stepInterval
 * @text 몇 걸음마다
 * @desc 1이면 한 칸 걸을 때마다, 2면 두 칸마다 소리를 냅니다.
 * @type number
 * @min 1
 * @default 1
 *
 * @param disableSwitch
 * @text 발소리 끄기 스위치
 * @desc 이 스위치가 ON이면 발소리가 나지 않습니다. 0이면 사용하지 않습니다.
 * @type switch
 * @default 0
 *
 * @param duringMoveRoute
 * @text 이동 루트 중에도 소리
 * @desc 이벤트의 [이동 루트 설정]으로 주인공을 움직일 때도 발소리를 냅니다.
 * @type boolean
 * @default true
 *
 * @param followers
 * @text 동료 발소리
 * @desc 뒤따라오는 동료도 발소리를 냅니다.
 * @type boolean
 * @default false
 *
 * @param followerVolume
 * @text 동료 발소리 음량(%)
 * @parent followers
 * @type number
 * @min 0
 * @max 100
 * @default 60
 *
 * @help
 * ============================================================================
 * 무엇을 하나요?
 * ============================================================================
 * 주인공이 한 칸 걸을 때마다, 도착한 칸의 지형에 맞는 발소리를 냅니다.
 * 탈것을 타고 있거나 투명 상태일 때는 소리가 나지 않습니다.
 *
 * ============================================================================
 * 지형 정하기 1: 지형 태그 (추천)
 * ============================================================================
 * 데이터베이스 > 타일셋 > 오른쪽의 [지형 태그] 버튼을 누른 뒤,
 * 타일을 클릭할 때마다 숫자가 올라갑니다(우클릭은 내려감).
 *   0: 태그 없음(기본 발소리)  1: 풀  2: 흙·모래  3: 돌·포장길
 *   4: 나무 바닥  5: 얕은 물  6: 눈  7: 소리 없음(카펫 등)
 * 한 번 정해두면 그 타일셋을 쓰는 모든 맵에 적용됩니다.
 * 각 번호의 소리는 플러그인 설정에서 다른 효과음으로 바꿀 수 있습니다.
 *
 * ============================================================================
 * 지형 정하기 2: 리전 (맵마다 따로)
 * ============================================================================
 * 맵 편집 화면의 R 탭에서 리전 번호를 칠하고, 플러그인 설정의
 * [리전별 발소리]에 그 번호와 효과음을 추가하세요.
 * 리전이 칠해진 칸은 지형 태그보다 리전 설정이 먼저 적용됩니다.
 *
 * ============================================================================
 * 맵 메모
 * ============================================================================
 * 맵 속성의 메모란에 <NoFootsteps> 라고 쓰면 그 맵에서는 발소리가 꺼집니다.
 *
 * ============================================================================
 * 기본 효과음
 * ============================================================================
 * Step_Default / Step_Grass / Step_Dirt / Step_Stone / Step_Wood /
 * Step_Water / Step_Snow 는 이 플러그인용으로 만든 합성 효과음입니다.
 * 더 실감 나는 녹음 소리를 구하면 audio/se 폴더에 넣고 설정에서 바꾸세요.
 */
/*~struct~StepSound:
 * @param name
 * @text 효과음
 * @desc 비워두면 소리가 나지 않습니다.
 * @type file
 * @dir audio/se/
 * @require 1
 *
 * @param volume
 * @text 음량
 * @type number
 * @min 0
 * @max 100
 * @default 40
 *
 * @param pitch
 * @text 피치
 * @type number
 * @min 50
 * @max 150
 * @default 100
 */
/*~struct~RegionSound:
 * @param regionId
 * @text 리전 ID
 * @type number
 * @min 1
 * @max 255
 * @default 1
 *
 * @param name
 * @text 효과음
 * @desc 비워두면 그 리전에서는 소리가 나지 않습니다.
 * @type file
 * @dir audio/se/
 * @require 1
 *
 * @param volume
 * @text 음량
 * @type number
 * @min 0
 * @max 100
 * @default 40
 *
 * @param pitch
 * @text 피치
 * @type number
 * @min 50
 * @max 150
 * @default 100
 */

(() => {
    "use strict";

    const pluginName = (() => {
        const script = document.currentScript;
        const match = script && script.src.match(/([^/]+)\.js$/);
        return match ? decodeURIComponent(match[1]) : "TerrainFootsteps";
    })();
    const params = PluginManager.parameters(pluginName);

    const toNumber = (value, fallback) => {
        const n = Number(value);
        return value !== undefined && value !== "" && !isNaN(n) ? n : fallback;
    };
    const toBool = (value, fallback) => {
        if (value === undefined || value === "") return fallback;
        return value === "true";
    };
    const parseJson = (text, fallback) => {
        try {
            return text ? JSON.parse(text) : fallback;
        } catch (e) {
            return fallback;
        }
    };
    const parseSound = (obj, fallbackName, fallbackVolume) => {
        if (!obj) return { name: fallbackName, volume: fallbackVolume, pitch: 100 };
        return {
            name: obj.name !== undefined ? String(obj.name) : fallbackName,
            volume: toNumber(obj.volume, fallbackVolume),
            pitch: toNumber(obj.pitch, 100)
        };
    };

    const DEFAULT_TAGS = [
        ["Step_Default", 35],
        ["Step_Grass", 40],
        ["Step_Dirt", 40],
        ["Step_Stone", 40],
        ["Step_Wood", 40],
        ["Step_Water", 45],
        ["Step_Snow", 40],
        ["", 40]
    ];

    const tagSounds = DEFAULT_TAGS.map(([name, volume], tag) =>
        parseSound(parseJson(params["tag" + tag], null), name, volume)
    );

    const regionSounds = {};
    for (const item of parseJson(params.regionSounds, [])) {
        const obj = typeof item === "string" ? parseJson(item, null) : item;
        if (!obj) continue;
        const regionId = toNumber(obj.regionId, 0);
        if (regionId > 0) {
            regionSounds[regionId] = parseSound(obj, "", 40);
        }
    }

    const P = {
        pitchVariance: toNumber(params.pitchVariance, 8),
        volumeVariance: toNumber(params.volumeVariance, 10),
        stepInterval: Math.max(1, toNumber(params.stepInterval, 1)),
        disableSwitch: toNumber(params.disableSwitch, 0),
        duringMoveRoute: toBool(params.duringMoveRoute, true),
        followers: toBool(params.followers, false),
        followerVolume: toNumber(params.followerVolume, 60)
    };

    //-------------------------------------------------------------------------
    // Helpers
    //-------------------------------------------------------------------------

    const randomRange = range => (range > 0 ? Math.random() * range * 2 - range : 0);

    const footstepSoundAt = (x, y) => {
        const regionId = $gameMap.regionId(x, y);
        if (regionId > 0 && regionSounds[regionId]) {
            return regionSounds[regionId];
        }
        return tagSounds[$gameMap.terrainTag(x, y)] || null;
    };

    const footstepsEnabled = () => {
        if (P.disableSwitch > 0 && $gameSwitches.value(P.disableSwitch)) return false;
        if ($dataMap && $dataMap.meta && $dataMap.meta.NoFootsteps) return false;
        return true;
    };

    const canCharacterStep = character => {
        if (character.isTransparent()) return false;
        if (!P.duringMoveRoute && character.isMoveRouteForcing()) return false;
        return true;
    };

    const playFootstep = (sound, volumeRate) => {
        if (!sound || !sound.name) return;
        const pitch = Math.round(sound.pitch + randomRange(P.pitchVariance));
        const volume = Math.round(
            sound.volume * volumeRate * (1 + randomRange(P.volumeVariance) / 100)
        );
        AudioManager.playSe({
            name: sound.name,
            volume: volume.clamp(0, 100),
            pitch: pitch.clamp(50, 150),
            pan: 0
        });
    };

    //-------------------------------------------------------------------------
    // Player
    //-------------------------------------------------------------------------

    let stepCounter = 0;

    const _Game_Player_increaseSteps = Game_Player.prototype.increaseSteps;
    Game_Player.prototype.increaseSteps = function() {
        _Game_Player_increaseSteps.call(this);
        if (this.isInVehicle() || !footstepsEnabled() || !canCharacterStep(this)) {
            return;
        }
        stepCounter++;
        if (stepCounter >= P.stepInterval) {
            stepCounter = 0;
            playFootstep(footstepSoundAt(this.x, this.y), 1);
        }
    };

    //-------------------------------------------------------------------------
    // Followers (optional)
    //-------------------------------------------------------------------------

    Game_Follower.prototype.increaseSteps = function() {
        Game_Character.prototype.increaseSteps.call(this);
        if (!P.followers || !this.isVisible()) return;
        if ($gamePlayer.isInVehicle() || !footstepsEnabled() || !canCharacterStep(this)) return;
        playFootstep(footstepSoundAt(this.x, this.y), P.followerVolume / 100);
    };
})();
