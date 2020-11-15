import {Chassis} from "./chassis";
import {AbstractMesh, Scene, Vector3} from "@babylonjs/core";

export class Hoverbot {

    private readonly _chassis: Chassis;
    public readonly cameraTarget: AbstractMesh;

    get position() {
        return this._chassis.mesh.position;
    }

    set position(p: Vector3) {
        this._chassis.mesh.position = p;
    }

    constructor(chassis: Chassis) {
        this._chassis = chassis;
        this.cameraTarget = this._chassis.mesh;
    }

    addToScene(scene: Scene) {
        scene.addMesh(this._chassis.mesh);
    }
}
