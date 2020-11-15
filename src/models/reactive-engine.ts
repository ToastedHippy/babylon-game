import {AbstractMesh} from "@babylonjs/core";


export class ReactiveEngine {
    public mesh: AbstractMesh;

    constructor(mesh: AbstractMesh) {
        this.mesh = mesh;
    }
}
