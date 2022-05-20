import Stats from "stats-js";
import * as THREE from "three";
import Camera from "./classes/Camera";
import Settings from "./utilities/Settings";

export class SceneInitializator {
    constructor(displayElement) {
        return new Promise(async (resolve) => {
            await this.initDisplay(displayElement);
            resolve(this);
        });
    }

    async initDisplay(displayElement) {
        //Initialization Scene
        this.scene = new THREE.Scene();

        //Light
        const light = new THREE.DirectionalLight(0xffffff, 3, 100);
        light.position.set(10, 20, 10);
        light.castShadow = Settings.instance.get("renderer.shadowMap.enabled");
        this.scene.add(light);

        const light2 = new THREE.DirectionalLight(0xffffff, 1, 100);
        light2.position.set(-10, -20, -10);
        this.scene.add(light2);

        //Camera
        this.camera = new Camera(displayElement);

        //Inits
        this.initHelpers();
        this.initShadows(light);
    }

    initHelpers() {
        //Stats
        this.stats = new Stats();
        this.stats.showPanel(0);
        document.body.appendChild(this.stats.dom);
    }

    initShadows(light) {
        if (!light.castShadow) return;

        const shadowSize = 100;
        light.shadow.camera.left = -shadowSize;
        light.shadow.camera.right = shadowSize;
        light.shadow.camera.top = shadowSize;
        light.shadow.camera.bottom = -shadowSize;
        light.shadow.blurSamples = 1;
        light.shadow.mapSize.width =
            1024 * Settings.instance.get("shadow.mapSize.width");
        light.shadow.mapSize.height =
            1024 * Settings.instance.get("shadow.mapSize.height");
        light.shadow.camera.near = 0.5;
        light.shadow.camera.far = 100;
    }

    update(delta) {
        this.stats.begin();
        this.scene.children.forEach((child) => {
            if (child.update !== undefined) child.update(delta);
        });
        this.camera.update(delta, this.scene);
        this.stats.end();
    }
}
