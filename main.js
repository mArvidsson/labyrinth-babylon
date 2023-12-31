import * as BABYLON from 'babylonjs';
import '@babylonjs/loaders/glTF';
import HavokPhysics from "@babylonjs/havok";

class Game {
  constructor(canvasElementId) {
    this.canvas = document.getElementById(canvasElementId);
    this.engine = new BABYLON.Engine(this.canvas, true);
    this.scene = new BABYLON.Scene(this.engine);
    this.camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), this.scene);
    this.camera.setTarget(BABYLON.Vector3.Zero());
    this.camera.attachControl(this.canvas, true);
    this.light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), this.scene);
    this.light.intensity = 0.7;

    this.initializeHavok();
  }

  async initializeHavok() {
    this.initializedHavok = await HavokPhysics();
    this.initializeScene();
  }

  initializeScene() {
    const gravityVector = new BABYLON.Vector3(0, -9.81, 0);
    const physicsPlugin = new BABYLON.PhysicsImpostor(this.initializedHavok);
    this.scene.enablePhysics(gravityVector, physicsPlugin);

    this.loadBoard();
    this.setupDeviceOrientation();
  }

  loadBoard() {
    BABYLON.SceneLoader.ImportMesh("", "board_v1.glb", "", this.scene, (meshes) => {
      this.board = meshes[0];
      this.board.physicsImpostor = new BABYLON.PhysicsImpostor(this.board, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 1, restitution: 0.9 }, this.scene);
    });
  }

  setupDeviceOrientation() {
    window.addEventListener('deviceorientation', (event) => {
      if (!this.board) return;

      const rotationX = event.beta ? event.beta / 180 * Math.PI : 0;
      const rotationY = event.gamma ? event.gamma / 180 * Math.PI : 0;

      this.board.rotation.x = rotationX;
      this.board.rotation.y = rotationY;
    });
  }

  run() {
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });

    window.addEventListener('resize', () => {
      this.engine.resize();
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const game = new Game('renderCanvas');
  game.run();
});
