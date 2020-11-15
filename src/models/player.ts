import {
    AbstractMesh,
    ArcRotateCamera,
    Camera,
    MeshBuilder,
    Nullable,
    Scene,
    TargetCamera,
    Vector3
} from "@babylonjs/core";
import {Hoverbot} from "./hoverbot";
import {ThirdPersonCameraBuilder} from "./third-person-camera-builder";

export class Player {

    private _hoverbot: Nullable<Hoverbot> = null;
    private _camera: Nullable<ArcRotateCamera> = null;

    constructor() {
    }

    bindHoverBot(bot: Hoverbot) {
        this._hoverbot = bot;
    }

    bindCamera(camera: ArcRotateCamera) {
        this._camera = camera;

        if (this._hoverbot) {
            this._camera.setTarget(this._hoverbot.cameraTarget);
        }

    }

}
