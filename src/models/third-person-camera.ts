import {ArcRotateCamera, Nullable, AbstractMesh, Scene, Tools, Vector3, Mesh} from "@babylonjs/core";
import {ThirdPersonCameraInput} from "./third-person-camera-input";


export class ThirdPersonCamera {
    static alphaDeg: number = 90;
    static betaDeg: number = 130;
    static radius: number = -60;

    private readonly _camera: ArcRotateCamera;
    private readonly _scene: Scene;
    private _target: AbstractMesh;

    constructor (scene: Scene) {
        this._target = new Mesh('target-mesh-placeholder');
        this._scene = scene;
        this._camera = new ArcRotateCamera('player_camera',
            Tools.ToRadians(ThirdPersonCamera.alphaDeg),
            Tools.ToRadians(ThirdPersonCamera.betaDeg),
            ThirdPersonCamera.radius,
            this._target.position.clone(),
            this._scene
        )

        this._init();
    }

    public attachTarget(target: AbstractMesh) {
        this._target = target;
        this._camera.setTarget(this._target)
    }

    public syncPositionWithTarget() {
        let targetPosition = this._target.position.clone();
        this._camera.setTarget(targetPosition);
    }

    private _init() {
        this._camera.inputs.clear();
        this._camera.inputs.add(new ThirdPersonCameraInput())

        let canvas = this._scene.getEngine().getRenderingCanvas();

        if (canvas) {
            this._camera.attachControl(canvas);
        }
    }
}
