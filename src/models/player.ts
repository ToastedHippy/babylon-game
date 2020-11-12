import {ThirdPersonCamera} from "./third-person-camera";
import {AbstractMesh, MeshBuilder, Nullable, Scene, Vector3} from "@babylonjs/core";

export class Player {

    private _camera: ThirdPersonCamera;
    private _mesh: AbstractMesh;

    public get position() {
        return this._mesh.position;
    }
    public set position(position: Vector3) {
        this._mesh.position = position;
        // this._camera.syncPositionWithTarget();
    }

    constructor(scene: Scene) {
        this._mesh = MeshBuilder.CreateBox('player', {size: 3}, scene);
        this._camera = new ThirdPersonCamera(scene);
        this._camera.attachTarget(this._mesh);
    }
}
