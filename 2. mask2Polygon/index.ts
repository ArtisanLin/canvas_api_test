// @ts-ignore
import testImage from './test.png'
import {drawPolygon, maskToPolygon, openCvReady} from "../lib";
import {MultiPolygon} from "polygon-clipping";

const img = new Image()
img.src = testImage;


const canvas = document.getElementById('canvas') as HTMLCanvasElement;
canvas.width = window.innerWidth
canvas.height = window.innerHeight
const context = canvas.getContext('2d')

const poly1 = [[[[100, 100], [200, 100], [200, 200], [100, 200]]]] as MultiPolygon
const poly2 = [[[[150, 150], [250, 150], [250, 250], [150, 250]]]] as MultiPolygon

// drawPolygon(context, poly1, {fillStyle: 'red'})
// drawPolygon(context, poly2, {fillStyle: 'blue'})

// setTimeout(() => {
//     const result = maskToPolygon(canvas, 1.5).map(data => data.data.map(p => [p.x + 300, p.y + 300])) as MultiPolygon
//     console.info('result', result)
//     drawPolygon(context, [result], {fillStyle: 'yellow'})
// }, 3_000)
//
img.onload = () => {
    context.drawImage(img, 0, 0);
    openCvReady().then(() => {
        const result = maskToPolygon(canvas, 1.5).map(data => data.data.map(p => [p.x, p.y])) as MultiPolygon
        console.info('result', result)
        drawPolygon(context, [result], {fillStyle: 'yellow'})
    })
}
img.onerror = (e) => {
    console.error('img.onerror', e)
}


