import {ArcRotateCamera, Nullable, AbstractMesh, Scene, Tools, Vector3, Mesh} from "@babylonjs/core";
import {ThirdPersonCameraInput} from "./third-person-camera-input";

export interface CameraOptions {
    alphaDeg: number;
    betaDeg: number;
    radius: number;
}

export class ThirdPersonCameraBuilder {

    static createCamera(scene: Scene, cameraOptions: CameraOptions) {
        let camera = new ArcRotateCamera('player_camera',
            Tools.ToRadians(cameraOptions.alphaDeg),
            Tools.ToRadians(cameraOptions.betaDeg),
            cameraOptions.radius,
            Vector3.Zero(),
            scene
        )

        camera.inputs.clear();
        camera.inputs.add(new ThirdPersonCameraInput())

        let canvas = scene.getEngine().getRenderingCanvas();

        if (canvas) {
            camera.attachControl(canvas);
        }

        return camera;
    }
}
