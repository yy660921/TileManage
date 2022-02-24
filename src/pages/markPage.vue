<template>
    <div
        ref="container"
        class="container"
    >
    </div>
</template>

<script>

import "ol/ol.css";
import { View, Map } from "ol"
import { Tile } from "ol/layer"
import TileLayer from 'ol/layer/Tile';
import { TileWMS, TileDebug } from "ol/source"
import { transform } from "ol/proj"
export default {
    name: "markPage",
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
            })
            this.map.on("contextmenu", (e) => {
                e.preventDefault()
                console.log(e.frameState.layerStatesArray[1])
            })
        },
        coordinateTransformTo3857 (coordinate) {
            return transform(coordinate, 'EPSG:4326' ,'EPSG:3857');
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

</style>
