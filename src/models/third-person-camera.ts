import {ArcRotateCamera} from "babylonjs/Cameras/arcRotateCamera";
import {Vector3} from "babylonjs/Maths/math.vector";
import {Scene} from "babylonjs/scene";
import {AbstractMesh} from "babylonjs/Meshes/abstractMesh";
import {Nullable} from "babylonjs/types";


export class ThirdPersonCamera extends ArcRotateCamera {

    private targetMeh: Nullable<AbstractMesh> = null;

    constructor(name: string, alpha: number, beta: number, radius: number, scene: Scene, setActiveOnSceneIfNoneActive?: boolean) {
        super(name, alpha, beta, radius, Vector3.Zero(), scene)
    }

    attachTarget(mesh: AbstractMesh) {
        this.targetMeh = mesh;
    }

}
