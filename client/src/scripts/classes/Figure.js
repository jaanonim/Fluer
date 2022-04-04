import * as THREE from "three"
import MapCreator from "../MapCreator";

export default class Figure extends THREE.Object3D {
    constructor(positionX, positionY, name, image, description, capturingMask, lives) {
        super();
        this.mapPositionX = positionX;
        this.mapPositionY = positionY;
        this.name = name;
        this.image = image;
        this.description = description;
        this.capturingMask = capturingMask;
        this.lives = lives;
        this.price = 0;
        this.place(positionX, positionY);
    }

    update() {
    }

    place(x, y) {
        this.mapPositionX = x;
        this.mapPositionY = y;
        let land = MapCreator.instance.mapObjects[x][y];
        if (land.figure != null) return false;
        this.position.set(land.position.x, 0, land.position.z);
        land.figure = this;
        return true;
    }

    makeDamage(damage) {
        this.lives -= damage;
    }

    capture() {
        let map = MapCreator.instance.mapObjects;
        let maskWidth = this.capturingMask.length;
        let maskHeight = this.capturingMask[0].length;
        for (let x = 0; x < maskWidth; x++) {
            for (let y = 0; y < maskHeight; y++) {
                let mapPosX = x - maskWidth / 2;
                let mapPosY = y - maskHeight / 2;
                if (mapPosX < 0 || mapPosX >= map.length || mapPosY < 0 || mapPosY > map[0].length) {
                    break;
                }
                if (this.capturingMask[x][y]) {
                    map[mapPosX][mapPosY].capture();
                }
            }

        }
    }

    canBuy() {
    }

    buy() {
    }
}