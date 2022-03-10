<template>
    <div
        ref="container"
        class="container"
    >
    </div>
    <div class="toolDiv">
        <div
            class="toolItem"
            @click="exportChosen()"
        >
            <div class="toolItem_imageDiv">
                <img
                    class="toolItem_image"
                    :src="exportImg"
                    alt="export Icon"/>
            </div>
            <div class="toolItem_nameDiv">
                <span class="toolItem_name">导出</span>
            </div>
        </div>
    </div>
</template>

<script>

import "ol/ol.css";
import { View, Map, Feature } from "ol"
import { Tile} from "ol/layer"
import { Vector as VectorLayer } from  "ol/layer"
import { Vector as VectorSource } from  "ol/source"
import { Polygon } from "ol/geom"
import TileLayer from 'ol/layer/Tile';
import { TileWMS, TileDebug } from "ol/source"
import { transform } from "ol/proj"
import { Stroke, Fill, Style} from "ol/style"
import { saveAs } from  "file-saver"
export default {
    name: "markPage",
    data() {
        return{
            resolution: {
                0: 156543.03392804097,
                1: 78271.51696402048,
                2: 39135.75848201024,
                3: 19567.87924100512,
                4: 9783.93962050256,
                5: 4891.96981025128,
                6: 2445.98490512564,
                7: 1222.99245256282,
                8: 611.49622628141,
                9: 305.748113140705,
                10: 152.8740565703525,
                11: 76.43702828517625,
                12: 38.21851414258813,
                13: 19.109257071294063,
                14: 9.554628535647032,
                15: 4.777314267823516,
                16: 2.388657133911758,
                17: 1.194328566955879,
                18: 0.5971642834779395,
                19: 0.29858214173896974,
                20: 0.14929107086948487
            },
            chosen: [],
            exportImg: require("@/assets/export.png"),
        };
    },
    methods: {
        initMap() {
            let that = this;
            let source = new TileWMS({
                url: "http://10.1.1.12:8080/geoserver/Pacific/wms",
                params:{
                    'FORMAT': 'image/png',
                    'VERSION': '1.1.1',
                    'LAYERS': "Pacific",
                    'tiled': true,
                    'STYLES': ''
                }
            });
            let wmsLayer = new Tile({
                source: source
            });
            let tileLayer = new TileLayer({
                source: new TileDebug(),
            });
            let view = new View({
                center: this.coordinateTransformTo3857([121.081769, 23.472101]),
                zoom: 8,
                projection: "EPSG:3857"
            });
            this.map = new Map({
                target: that.$refs.container,
                view: view,
                layers: [wmsLayer, tileLayer]
            });
            this.createLayer("jx");
            this.map.on("contextmenu", (e) => {
                e.preventDefault();
                let coordinate = this.map.getCoordinateFromPixel(e.pixel);
                let zoom = Math.round(this.map.getView().getZoom());
                let part = this.latLngToPoint(coordinate, zoom);
                if (this.chosen.indexOf(part) !== -1){
                    delete this.chosen[this.chosen.indexOf(part)]
                }
                else {
                    this.chosen.push(part)
                }
                this.repaintLayers()
            })
        },
        coordinateTransformTo3857 (coordinate) {
            return transform(coordinate, 'EPSG:4326' ,'EPSG:3857');
        },
        createLayer (layerName) {
            let layers = this.map.getLayers();
            let layer = null;
            layers.forEach((element) => {
                if (element.get("name") === layerName) {
                    layer = element;
                }
            });
            if (layer !== null) {
                return layer;
            }
            let vectorLayer = new VectorLayer({
                name: layerName,
                source: new VectorSource({
                    wrapX: false,
                }),
            });
            if (this.map) {
                this.map.addLayer(vectorLayer);
            }
            return vectorLayer;
        },
        deleteLayer (layerName) {
            let layers = this.map.getLayers();
            let layer = null;

            layers.forEach((element) => {
                if (element.get("name") === layerName) {
                    layer = element;
                }
            });
            if (layer == null) {
                return layer;
            }
            layer.getSource().clear();
        },
        latLngToPoint (coordinate, zoom) {
            let xtile = Math.pow(2, zoom) - 1 - Math.floor((20037508.342789244 - coordinate[0]) / (256 * this.resolution[zoom]));
            let ytile = Math.floor((20037508.342789277 - coordinate[1]) / (256 * this.resolution[zoom]));
            return zoom + "_" + xtile + "_" + ytile;
        },
        PointTolatLng (part) {
            let info = part.split("_");
            let z = parseInt(info[0]);
            let x = parseInt(info[1]);
            let y = parseInt(info[2]);
            let maxX = 20037508.342789244 - (Math.pow(2, z) - 1 - x) * (256 * this.resolution[z]);
            let minX = 20037508.342789244 - (Math.pow(2, z) - x) * (256 * this.resolution[z]);
            let maxY = 20037508.342789277 - (y * (256 * this.resolution[z]));
            let minY = 20037508.342789277 - ((y + 1) * (256 * this.resolution[z]));
            return [[[minX, maxY], [maxX, maxY], [maxX, minY], [minX, minY]]]
        },
        repaintLayers () {
            this.deleteLayer("jx");
            this.createLayer("jx");
            let layers = this.map.getLayers();
            let layer = null;

            layers.forEach((element) => {
                if (element.get("name") === "jx") {
                    layer = element;
                }
            });
            let source = layer.getSource();

            this.chosen.forEach((data) => {
                let geometry = new Polygon(this.PointTolatLng(data));
                let feature = new Feature({
                    data: data,
                    geometry: geometry,
                });
                feature.setStyle(new Style({
                    stroke: new Stroke({
                        color: '#ff3338',
                        width: 1,
                    }),
                    fill: new Fill({
                        color: 'rgba(255,51,56,0.2)',
                    }),
                }));
                source.addFeature(feature);
            });
        },
        exportChosen () {
            let data = JSON.stringify(this.chosen, undefined, 4);
            let blob = new Blob([data], {type: 'text/json'});
            saveAs(blob, "export.json");
        },
    },
    mounted() {
        this.initMap()
    }
}
</script>

<style scoped>
.container {
    width: 100%;
    height: 100%;
    position: relative;
}

.toolDiv {
    position: absolute;
    left: 7%;
    top: 3%;
    width: 4em;
    height: 5em;
    z-index: 9999;
    display: flex;
    flex-direction: row;
}

.toolItem {
    display: flex;
    flex-direction: column;
    color: white;
    cursor: pointer;
    border: 1px solid #E90010;
    width: 100%;
    height: 4em;
    align-items: center;
    border-radius: 5px;
    background: rgba(233, 0, 16, 0.4);
    padding: 5px;
    margin-top: 5px;
}
.toolItem:hover {
    background: #E90010;
}

.toolItem_imageDiv {
    width: 100%;
    flex-grow: 1;
    height: 2.5em;
    text-align: center;
}
.toolItem_image {
    width: 80%;
    height: 100%;
}
.toolItem_nameDiv {
    width: 100%;
    height: 1.5em;
    text-align: center;
}
.toolItem_name {
    width: 100%;
}

</style>
