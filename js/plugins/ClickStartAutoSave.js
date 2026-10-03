//=============================================================================
// ClickStartAutoSave.js
//=============================================================================
/*:
 * @target MZ
 * @plugindesc 타이틀 메뉴 없이 클릭 한 번으로 시작하고, 진행 상황을 자동으로 저장/이어하기합니다.
 * @author Claude
 *
 * @param startText
 * @text 안내 문구
 * @desc 타이틀 화면에 깜빡이며 표시할 문구입니다. 비워두면 아무것도 표시하지 않습니다.
 * @type string
 * @default 클릭하여 시작
 *
 * @param textY
 * @text 안내 문구 Y 위치
 * @desc 문구의 세로 위치(픽셀)입니다. -1이면 화면 아래쪽에 자동으로 배치합니다.
 * @type number
 * @min -1
 * @default -1
 *
 * @param fontSize
 * @text 안내 문구 크기
 * @type number
 * @min 8
 * @default 28
 *
 * @param blink
 * @text 문구 깜빡임
 * @type boolean
 * @on 깜빡임
 * @off 고정
 * @default true
 *
 * @param autosaveInterval
 * @text 주기적 자동 저장(초)
 * @desc 맵에서 이 시간(초)마다 자동 저장합니다. 이벤트 진행 중에는 끝날 때까지 기다립니다. 0이면 끕니다.
 * @type number
 * @min 0
 * @default 60
 *
 * @param saveOnTransfer
 * @text 맵 이동·전투 후 저장
 * @desc 장소 이동이 끝났을 때와 전투가 끝났을 때 자동 저장합니다. (시스템 1의 자동 저장 설정과 상관없이 동작)
 * @type boolean
 * @default true
 *
 * @param saveOnExit
 * @text 창 닫을 때 저장
 * @desc 게임 창의 X 버튼으로 닫을 때 저장합니다. (PC 실행/테스트 플레이 전용, 전투 중에는 저장하지 않음)
 * @type boolean
 * @default true
 *
 * @param saveOnToTitle
 * @text 타이틀로 갈 때 저장
 * @desc 메뉴의 [게임 종료 → 타이틀로]를 고르면 먼저 저장합니다.
 * @type boolean
 * @default true
 *
 * @param hideSaveCommand
 * @text 메뉴에서 저장 숨기기
 * @desc 자동 저장만 쓰도록 메뉴의 [저장] 항목을 없앱니다.
 * @type boolean
 * @default true
 *
 * @param shiftNewGame
 * @text Shift+클릭으로 처음부터
 * @desc Shift를 누른 채 클릭하면 저장을 무시하고 새 게임으로 시작합니다. (기존 저장은 다음 자동 저장 때 덮어써집니다)
 * @type select
 * @option 테스트 플레이에서만
 * @value playtest
 * @option 항상
 * @value always
 * @option 끄기
 * @value off
 * @default playtest
 *
 * @help
 * ============================================================================
 * 무엇을 하나요?
 * ============================================================================
 * 1) 타이틀 화면의 [새 게임 / 이어하기 / 옵션] 메뉴를 없앱니다.
 * 2) 화면을 클릭(또는 Enter/Space/Z)하면 바로 시작합니다.
 *    - 저장 기록이 있으면 가장 최근 저장에서 이어합니다.
 *    - 저장 기록이 없으면 새 게임을 시작합니다.
 * 3) 플레이어가 직접 저장하지 않아도 자동으로 저장합니다.
 *    - 맵 이동이 끝났을 때, 전투가 끝났을 때
 *    - 맵에서 일정 시간마다 (이벤트 진행 중이 아닐 때)
 *    - 게임 창을 닫을 때, 메뉴에서 타이틀로 돌아갈 때
 *
 * ============================================================================
 * 알아두기
 * ============================================================================
 * - 자동 저장은 저장 슬롯 0번(자동 저장 슬롯)에 기록됩니다.
 * - 이벤트 명령 [저장 금지 변경]으로 저장을 금지하면 자동 저장도 멈춥니다.
 * - 게임 오버 상태는 저장하지 않습니다. 게임 오버 후 클릭하면
 *   마지막 자동 저장 지점에서 다시 시작합니다.
 * - 클릭할 때 나는 소리는 데이터베이스 > 시스템 1 > 효과음의
 *   [결정](새 게임)과 [로드](이어하기) 소리입니다.
 * - 옵션(음량 등)은 게임 중 메뉴(Esc)에서 열 수 있습니다.
 * - 저장 기록을 지우고 완전히 처음부터 하려면 프로젝트 폴더의
 *   save 폴더를 지우세요. (테스트 플레이에서는 Shift+클릭으로도 가능)
 */

(() => {
    "use strict";

    const pluginName = (() => {
        const script = document.currentScript;
        const match = script && script.src.match(/([^/]+)\.js$/);
        return match ? decodeURIComponent(match[1]) : "ClickStartAutoSave";
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

    const P = {
        startText: params.startText !== undefined ? String(params.startText) : "클릭하여 시작",
        textY: toNumber(params.textY, -1),
        fontSize: toNumber(params.fontSize, 28),
        blink: toBool(params.blink, true),
        autosaveInterval: toNumber(params.autosaveInterval, 60),
        saveOnTransfer: toBool(params.saveOnTransfer, true),
        saveOnExit: toBool(params.saveOnExit, true),
        saveOnToTitle: toBool(params.saveOnToTitle, true),
        hideSaveCommand: toBool(params.hideSaveCommand, true),
        shiftNewGame: params.shiftNewGame || "playtest"
    };

    const AUTOSAVE_SLOT = 0;

    //-------------------------------------------------------------------------
    // Save helpers
    //-------------------------------------------------------------------------

    let pendingSave = null;
    let periodicTimer = 0;

    const isPlaytest = () => Utils.isOptionValid("test");

    const canSaveNow = () => {
        if (DataManager.isBattleTest() || DataManager.isEventTest()) return false;
        if (!$gameSystem || !$gameMap || !$gameParty) return false;
        if (!$gameSystem.isSaveEnabled()) return false;
        if ($gameMap.mapId() <= 0) return false;
        if ($gameParty.isAllDead()) return false;
        return true;
    };

    // Saves to the autosave slot. If a save is already running, returns it.
    const saveNow = () => {
        if (pendingSave) return pendingSave;
        if (!canSaveNow()) return Promise.resolve(false);
        periodicTimer = 0;
        $gameSystem.onBeforeSave();
        pendingSave = DataManager.saveGame(AUTOSAVE_SLOT)
            // saveGame does not wait for the save list (global) to be written.
            // Wait for it here so a save made right before quitting is complete.
            .then(() => StorageManager.saveObject("global", DataManager._globalInfo))
            .then(() => true)
            .catch(error => {
                console.error("[" + pluginName + "] 자동 저장 실패", error);
                return false;
            })
            .then(result => {
                pendingSave = null;
                return result;
            });
        return pendingSave;
    };

    const waitPendingSave = () => pendingSave || Promise.resolve(true);

    // Waits for any running save, then saves the current state.
    const saveAfterPending = () => waitPendingSave().then(() => saveNow());

    const latestSavefileId = () => {
        const info = DataManager._globalInfo || [];
        let bestId = -1;
        let bestTime = -Infinity;
        for (let id = 0; id < info.length; id++) {
            const item = info[id];
            if (item && item.timestamp > bestTime && DataManager.savefileExists(id)) {
                bestId = id;
                bestTime = item.timestamp;
            }
        }
        if (bestId < 0 && DataManager.savefileExists(AUTOSAVE_SLOT)) {
            bestId = AUTOSAVE_SLOT;
        }
        return bestId;
    };

    const isGameplayScene = scene =>
        scene instanceof Scene_Map || scene instanceof Scene_MenuBase;

    const shouldSaveOnExit = () => {
        const scene = SceneManager._scene;
        const next = SceneManager._nextScene;
        if (!isGameplayScene(scene)) return false;
        if (next && !isGameplayScene(next)) return false;
        return canSaveNow();
    };

    //-------------------------------------------------------------------------
    // Scene_Title: no command window, click to start
    //-------------------------------------------------------------------------

    const _Scene_Title_create = Scene_Title.prototype.create;
    Scene_Title.prototype.create = function() {
        _Scene_Title_create.call(this);
        this.createClickStartText();
    };

    const _Scene_Title_createCommandWindow = Scene_Title.prototype.createCommandWindow;
    Scene_Title.prototype.createCommandWindow = function() {
        _Scene_Title_createCommandWindow.call(this);
        // Keep the window object (other code expects it) but never show or use it.
        this._commandWindow.hide();
        this._commandWindow.deactivate();
    };

    Scene_Title.prototype.createClickStartText = function() {
        this._clickStartFrame = 0;
        if (!P.startText) return;
        const height = Math.ceil(P.fontSize * 1.8);
        const bitmap = new Bitmap(Graphics.width, height);
        bitmap.fontFace = $gameSystem.mainFontFace();
        bitmap.fontSize = P.fontSize;
        bitmap.outlineColor = "rgba(0, 0, 0, 0.8)";
        bitmap.outlineWidth = Math.max(3, Math.round(P.fontSize / 6));
        bitmap.drawText(P.startText, 0, 0, Graphics.width, height, "center");
        const sprite = new Sprite(bitmap);
        const centerY = P.textY >= 0 ? P.textY : Math.floor(Graphics.height * 0.8);
        sprite.y = Math.floor(centerY - height / 2);
        this._clickStartSprite = sprite;
        this.addChild(sprite);
    };

    const _Scene_Title_update = Scene_Title.prototype.update;
    Scene_Title.prototype.update = function() {
        _Scene_Title_update.call(this);
        this.updateClickStartText();
        if (!this._clickStarted && !this.isBusy() && this.isClickStartTriggered()) {
            this.startByClick();
        }
    };

    Scene_Title.prototype.isClickStartTriggered = function() {
        return TouchInput.isTriggered() || Input.isTriggered("ok");
    };

    Scene_Title.prototype.updateClickStartText = function() {
        const sprite = this._clickStartSprite;
        if (!sprite) return;
        if (this._clickStarted || !P.blink) {
            sprite.opacity = 255;
            return;
        }
        this._clickStartFrame++;
        sprite.opacity = 150 + Math.round(105 * Math.cos(this._clickStartFrame / 22));
    };

    Scene_Title.prototype.wantsNewGameByShift = function() {
        if (P.shiftNewGame === "off") return false;
        if (P.shiftNewGame === "playtest" && !isPlaytest()) return false;
        return Input.isPressed("shift");
    };

    Scene_Title.prototype.startByClick = function() {
        this._clickStarted = true;
        const forceNewGame = this.wantsNewGameByShift();
        waitPendingSave().then(() => {
            const savefileId = forceNewGame ? -1 : latestSavefileId();
            if (savefileId < 0) {
                this.startClickNewGame();
                return;
            }
            DataManager.loadGame(savefileId)
                .then(() => this.onClickLoadSuccess())
                .catch(error => {
                    console.error("[" + pluginName + "] 불러오기 실패, 새 게임으로 시작합니다.", error);
                    this.startClickNewGame();
                });
        });
    };

    Scene_Title.prototype.startClickNewGame = function() {
        SoundManager.playOk();
        DataManager.setupNewGame();
        this.fadeOutAll();
        SceneManager.goto(Scene_Map);
    };

    // Same steps as Scene_Load.prototype.onLoadSuccess.
    Scene_Title.prototype.onClickLoadSuccess = function() {
        SoundManager.playLoad();
        this.fadeOutAll();
        if ($gameSystem.versionId() !== $dataSystem.versionId) {
            const mapId = $gameMap.mapId();
            const x = $gamePlayer.x;
            const y = $gamePlayer.y;
            const d = $gamePlayer.direction();
            $gamePlayer.reserveTransfer(mapId, x, y, d, 0);
            $gamePlayer.requestMapReload();
        }
        SceneManager.goto(Scene_Map);
        this._clickLoadSuccess = true;
    };

    // Same as Scene_Load.prototype.terminate: restore BGM and play time.
    const _Scene_Title_terminate = Scene_Title.prototype.terminate;
    Scene_Title.prototype.terminate = function() {
        _Scene_Title_terminate.call(this);
        if (this._clickLoadSuccess) {
            $gameSystem.onAfterLoad();
        }
    };

    //-------------------------------------------------------------------------
    // Autosave on map transfer / after battle (uses the built-in hooks)
    //-------------------------------------------------------------------------

    if (P.saveOnTransfer) {
        Scene_Base.prototype.isAutosaveEnabled = function() {
            return canSaveNow();
        };
    }

    Scene_Base.prototype.executeAutosave = function() {
        saveNow().then(success => {
            if (success) {
                this.onAutosaveSuccess();
            } else {
                this.onAutosaveFailure();
            }
        });
    };

    //-------------------------------------------------------------------------
    // Periodic autosave on the map
    //-------------------------------------------------------------------------

    const _Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        _Scene_Map_update.call(this);
        if (P.autosaveInterval > 0) {
            periodicTimer++;
            if (periodicTimer >= P.autosaveInterval * 60 && this.canPeriodicAutosave()) {
                saveNow();
            }
        }
    };

    Scene_Map.prototype.canPeriodicAutosave = function() {
        return (
            SceneManager._scene === this &&
            this.isActive() &&
            !SceneManager.isSceneChanging() &&
            !this.isBusy() &&
            !$gameMap.isEventRunning() &&
            !$gameMessage.isBusy() &&
            !$gamePlayer.isTransferring() &&
            canSaveNow()
        );
    };

    //-------------------------------------------------------------------------
    // Save before [Game End -> To Title]
    //-------------------------------------------------------------------------

    const _Scene_GameEnd_commandToTitle = Scene_GameEnd.prototype.commandToTitle;
    Scene_GameEnd.prototype.commandToTitle = function() {
        if (P.saveOnToTitle) {
            saveAfterPending();
        }
        _Scene_GameEnd_commandToTitle.call(this);
    };

    //-------------------------------------------------------------------------
    // Save when the game window is closed (NW.js only)
    //-------------------------------------------------------------------------

    if (P.saveOnExit && Utils.isNwjs()) {
        const win = nw.Window.get();
        // main.js registers a close handler that quits at once
        // (nw.App.quit). Replace it so the save can finish first.
        win.removeAllListeners("close");
        let closing = false;
        const quit = () => nw.App.quit();
        win.on("close", () => {
            if (closing) return;
            closing = true;
            const timeout = setTimeout(quit, 3000);
            const saving = shouldSaveOnExit() ? saveAfterPending() : Promise.resolve(true);
            saving.then(() => {
                clearTimeout(timeout);
                quit();
            });
        });
    }

    //-------------------------------------------------------------------------
    // Hide [Save] in the main menu
    //-------------------------------------------------------------------------

    if (P.hideSaveCommand) {
        Window_MenuCommand.prototype.addSaveCommand = function() {
            // Autosave only.
        };
    }
})();
