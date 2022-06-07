import { MapLandTypes } from "../enums/MapTileTypes";
import Land from "./lands/Land";

export default class MapLandFactor {
    createTile(x, y, mapPositionX, mapPositionY, width, height, type) {
        switch (type) {
            case MapLandTypes.LAND:
                return new Land(
                    x,
                    y,
                    mapPositionX,
                    mapPositionY,
                    width,
                    height,
                    "land2"
                );
            case MapLandTypes.MOUNTAIN:
                return new Land(
                    x,
                    y,
                    mapPositionX,
                    mapPositionY,
                    width,
                    height,
                    "mountain2"
                );
            case MapLandTypes.SEE:
                return new Land(
                    x,
                    y,
                    mapPositionX,
                    mapPositionY,
                    width,
                    height,
                    "see2"
                );
            case MapLandTypes.NOTHING:
                return null;
            default:
                console.error("Unknown type " + type);
        }
    }
}
