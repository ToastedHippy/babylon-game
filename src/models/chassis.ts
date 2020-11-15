import {AbstractMesh} from "@babylonjs/core";
import {ReactiveEngine} from "./reactive-engine";

export class Chassis {

    public mesh: AbstractMesh;

    constructor(mesh: AbstractMesh) {
        this.mesh = mesh;
    }

    attachHoverEngine(engine: ReactiveEngine) {
        this.mesh.addChild(engine.mesh);
    }

}
