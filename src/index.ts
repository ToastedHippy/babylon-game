import {
    Vector3
} from '@babylonjs/core';

import {AssetsLoader} from './models/assets-loader';
import {Game} from "./models/game";
import {PlaygroundLevel} from "./models/playground.level";
import {Level} from "./models/level";

import "@babylonjs/core/Meshes/meshBuilder";

AssetsLoader.rootUrl = 'assets/';
Level.gravityVector = new Vector3(0, -9.81, 0);

let canvas = document.getElementById('game-canvas') as HTMLCanvasElement;

let game = new Game(canvas);
game.activateLevel(PlaygroundLevel);
