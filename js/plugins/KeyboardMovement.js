//=============================================================================
// KeyboardMovement.js
//=============================================================================
/*:
 * @target MZ
 * @plugindesc 맵에서 마우스 클릭 이동을 끄고, WASD 키로도 움직일 수 있게 합니다.
 * @author Claude
 *
 * @param disableClickMove
 * @text 마우스 클릭 이동 끄기
 * @desc 맵을 클릭해도 캐릭터가 움직이지 않습니다. (대화 넘기기, 메뉴 클릭 등은 그대로)
 * @type boolean
 * @default true
 *
 * @param rightClickMenu
 * @text 우클릭으로 메뉴 열기
 * @desc 맵에서 마우스 우클릭으로 메뉴를 열 수 있게 둡니다.
 * @type boolean
 * @default true
 *
 * @param wasd
 * @text WASD 이동
 * @desc W/A/S/D를 위/왼쪽/아래/오른쪽으로 씁니다. 방향키도 그대로 쓸 수 있고, 메뉴 커서도 WASD로 움직입니다.
 * @type boolean
 * @default true
 *
 * @param pageDownKey
 * @text 다음 페이지 키
 * @desc 원래 W 키가 하던 [다음 페이지](메뉴에서 다음 캐릭터로 넘기기)를 맡을 키입니다. (이전 페이지는 Q 그대로)
 * @parent wasd
 * @type select
 * @option E
 * @value E
 * @option R
 * @value R
 * @option 없음 (PageDown 키만)
 * @value none
 * @default E
 *
 * @help
 * ============================================================================
 * 키 배치 (기본 설정)
 * ============================================================================
 *   이동        : W A S D 또는 방향키
 *   결정/조사   : Enter, Space, Z
 *   취소/메뉴   : Esc, X, (우클릭)
 *   대시        : Shift
 *   이전/다음 페이지 : Q / E
 *
 * 마우스는 타이틀 시작, 대화 넘기기, 메뉴 선택에는 그대로 쓸 수 있고
 * 맵에서 캐릭터를 움직이는 데만 쓰이지 않습니다.
 */

(() => {
    "use strict";

    const pluginName = (() => {
        const script = document.currentScript;
        const match = script && script.src.match(/([^/]+)\.js$/);
        return match ? decodeURIComponent(match[1]) : "KeyboardMovement";
    })();
    const params = PluginManager.parameters(pluginName);
    const toBool = (value, fallback) => {
        if (value === undefined || value === "") return fallback;
        return value === "true";
    };

    const P = {
        disableClickMove: toBool(params.disableClickMove, true),
        rightClickMenu: toBool(params.rightClickMenu, true),
        wasd: toBool(params.wasd, true),
        pageDownKey: params.pageDownKey || "E"
    };

    //-------------------------------------------------------------------------
    // WASD
    //-------------------------------------------------------------------------

    if (P.wasd) {
        Input.keyMapper[87] = "up"; // W (was pagedown)
        Input.keyMapper[65] = "left"; // A
        Input.keyMapper[83] = "down"; // S
        Input.keyMapper[68] = "right"; // D
        if (P.pageDownKey === "E") {
            Input.keyMapper[69] = "pagedown"; // E
        } else if (P.pageDownKey === "R") {
            Input.keyMapper[82] = "pagedown"; // R
        }
    }

    //-------------------------------------------------------------------------
    // No click-to-move on the map
    //-------------------------------------------------------------------------

    if (P.disableClickMove) {
        Scene_Map.prototype.processMapTouch = function() {
            this._touchCount = 0;
        };
    }

    if (!P.rightClickMenu) {
        Scene_Map.prototype.isMenuCalled = function() {
            return Input.isTriggered("menu");
        };
    }
})();
