import { ArcRotateCamera, Nullable, AbstractMesh, Scene, Tools, Vector3 } from "babylonjs";


export class PlayerCamera {
    static alphaDeg: number = 90;
    static betaDeg: number = 140;
    static radius: number = -70;
    static acceleration: number = 0.05;
    static maxVelocity: number = 1;
    static playerLookingRadius: number = 5;

    private _player: AbstractMesh;
    private _camera: ArcRotateCamera;
    private _scene: Scene;
    private _lookAtPosition: Vector3;
    private _velocity: number = 0;

    constructor (player: AbstractMesh, scene: Scene) {
        this._player = player;
        this._lookAtPosition = player.position.clone();
        this._scene = scene;
        this._camera = new ArcRotateCamera('player_camera',
            Tools.ToRadians(PlayerCamera.alphaDeg),
            Tools.ToRadians(PlayerCamera.betaDeg),
            PlayerCamera.radius,
            this._lookAtPosition,
            scene
        )
        
        this._init();
    }

    public attachControl(canvas: HTMLCanvasElement) {
        this._camera.attachControl(canvas);
    }
    
    private _init() {
        this._scene.registerBeforeRender(() => this._updateLookingPosition())
    }
    
    private _updateLookingPosition() {
        let playerPositionDiff = this._lookAtPosition.subtract(this._player.position);
        let diffDistance = playerPositionDiff.length();

        if (diffDistance > PlayerCamera.playerLookingRadius) {

            this._velocity += PlayerCamera.acceleration;

            if (this._velocity >= PlayerCamera.maxVelocity) {
                this._velocity = PlayerCamera.maxVelocity;
            }

        } else {
            this._velocity -= PlayerCamera.acceleration;

            if (this._velocity <= 0) {
                this._velocity = 0;
            }
        }

        if (this._velocity > 0) {

            const deltaTime = this._scene.getEngine().getDeltaTime() / 1000;

            const pos = Vector3.Lerp(this._lookAtPosition, this._player.position, this._velocity * deltaTime);

            this._lookAtPosition.set(pos.x, this._lookAtPosition.y, pos.z);
        }
    }
}
