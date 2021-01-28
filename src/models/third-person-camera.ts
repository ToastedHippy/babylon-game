import {ArcRotateCamera, Nullable, AbstractMesh, Scene, Tools, Vector3, Mesh} from "@babylonjs/core";
import {ThirdPersonCameraInput} from "./third-person-camera-input";

export class ThirdPersonCamera {

    static alphaDeg: number = 90;
    static betaDeg: number = 143;
    static radius: number = -60;
    static acceleration: number = 0.1;
    static maxVelocity: number = 10;
    static playerLookingRadius: number = 1;

    private _target: Nullable<AbstractMesh> = null;
    private _camera: ArcRotateCamera;
    private _scene: Scene;
    private _velocity: number = 0;

    constructor (scene: Scene) {
        this._scene = scene;
        this._camera = new ArcRotateCamera('player_camera',
            Tools.ToRadians(ThirdPersonCamera.alphaDeg),
            Tools.ToRadians(ThirdPersonCamera.betaDeg),
            ThirdPersonCamera.radius,
            Vector3.Zero(),
            scene
        )

        this._init();
    }

    public setTarget(target: AbstractMesh) {
        this._target = target;
        this._camera.setTarget(target);
    }

    private _init() {
        let canvas = this._scene.getEngine().getRenderingCanvas();

        this._camera.inputs.clear();
        this._camera.inputs.add(new ThirdPersonCameraInput())

        if (canvas) {
            this._camera.attachControl(canvas);
        }

        this._scene.registerBeforeRender(() => this._updatePosition())
    }

    private _updatePosition() {

        if (!this._target) return;

        let lookAtPosition = this._camera.getTarget();
        let playerPositionDiff = lookAtPosition.subtract(this._target.position);
        let diffDistance = playerPositionDiff.length();

        if (diffDistance > ThirdPersonCamera.playerLookingRadius) {

            this._velocity += ThirdPersonCamera.acceleration;

            if (this._velocity >= ThirdPersonCamera.maxVelocity) {
                this._velocity = ThirdPersonCamera.maxVelocity;
            }

        } else {
            this._velocity -= ThirdPersonCamera.acceleration;

            if (this._velocity <= 0) {
                this._velocity = 0;
            }
        }

        if (this._velocity > 0) {

            const deltaTime = this._scene.getEngine().getDeltaTime() / 1000;

            const pos = Vector3.Lerp(this._camera.position, this._target.position, this._velocity * deltaTime);

            this._camera.position.set(pos.x, pos.y, pos.z);
        }
    }

}
