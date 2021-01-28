import {Level} from "./level";
import {
    Engine,
    DirectionalLight,
    HemisphericLight,
    Mesh,
    MeshBuilder,
    PhysicsImpostor,
    ShadowGenerator,
    StandardMaterial,
    Texture,
    Vector3,
    Nullable,
    ArcRotateCamera
} from "@babylonjs/core";
import {Player} from "./player";
import {HoverbotBuilder} from "./hoverbot-builder";
import {ThirdPersonCamera} from "./third-person-camera";

export class PlaygroundLevel extends Level {

    shadowGenerator: Nullable<ShadowGenerator> = null;

    constructor(engine: Engine) {
        super(engine);
        this.configure({usePhysics: true});
        this.initLight();
        this.initGround();
        this.initPlayer();
        this.initLevelObjects();
    }

    initLight() {
        let hlight = new HemisphericLight("light1", new Vector3(0.2, 0.1, 0.2), this.scene);
        hlight.intensity = 0.5
        var light = new DirectionalLight("dir01", new Vector3(-1, -1, -1), this.scene);
        light.position = new Vector3(20, 40, 20);
        light.intensity = 0.5;

        this.shadowGenerator = new ShadowGenerator(1024, light);
    }

    initGround() {

        let ground = Mesh.CreateGround("ground1", 512, 512, 32, this.scene);
        let material = new StandardMaterial("grid", this.scene);
        let texture = new Texture("assets/textures/ground.jpg", this.scene);
        texture.uScale = 12;
        texture.vScale = 12;
        material.diffuseTexture = texture
        ground.material = material;

        ground.physicsImpostor = new PhysicsImpostor(ground, PhysicsImpostor.BoxImpostor, {
            mass: 0,
            restitution: 0.9,
            friction: 1
        }, this.scene);
        ground.receiveShadows = true;
    }

    private initObsticle() {
        let obsticleBox = MeshBuilder.CreateBox('obstB1', {width: 10, height: 0.5, depth: 1}, this.scene);
        obsticleBox.checkCollisions = true;
        obsticleBox.receiveShadows = true;
        obsticleBox.position = new Vector3(0, 0.25, 5);

        this.shadowGenerator?.addShadowCaster(obsticleBox);
    }

    private initLevelObjects() {
        this.initObsticle();
    }

    private initPlayer() {

        let hoverbot = new HoverbotBuilder({}).build();
        let player = new Player(this.scene);

        let camera = new ThirdPersonCamera(this.scene);

        player.bindHoverBot(hoverbot);
        player.bindCamera(camera);

        setInterval(() => {
            hoverbot.position.x += 0.1;
        }, 60)

    }

}
