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
import {ThirdPersonCamera} from "./third-person-camera";

export class Player {

    private _hoverbot: Nullable<Hoverbot> = null;
    private _camera: Nullable<ThirdPersonCamera> = null;
    private readonly _scene: Scene;

    constructor(scene: Scene) {
        this._scene = scene;
    }

    bindHoverBot(bot: Hoverbot) {
        this._hoverbot = bot;
        this._hoverbot.addToScene(this._scene);
    }

    bindCamera(camera: ThirdPersonCamera) {
        this._camera = camera;

        if (this._hoverbot) {
            this._camera.setTarget(this._hoverbot.cameraTarget);
        }

    }

}
