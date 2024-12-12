import * as polygonClipping from 'polygon-clipping';
import {MultiPolygon} from 'polygon-clipping';
import {drawPolygon} from "../lib";


const poly1 = [[[[100, 100], [200, 100], [200, 200], [100, 200]]]] as MultiPolygon
const poly2 = [[[[150, 150], [250, 150], [250, 250], [150, 250]]]] as MultiPolygon

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
canvas.width = window.innerWidth
canvas.height = window.innerHeight
const ctx = canvas.getContext('2d')
drawPolygon(ctx, poly1, {fillStyle: 'red'})
drawPolygon(ctx, poly2, {fillStyle: 'blue', fillRule: 'evenodd'})

// 并
const r1 = polygonClipping.union(poly1, poly2 /* , poly3, ... */)
console.info(r1)
// drawPolygon(ctx, r1, {fillStyle: 'pink'})
// 交
const r2 = polygonClipping.intersection(poly1, poly2 /* , poly3, ... */)
// drawPolygon(ctx, r2, {fillStyle: 'black'})
// 异或
const r3 = polygonClipping.xor(poly1, poly2 /* , poly3, ... */)
// drawPolygon(ctx, r3, {fillStyle: 'orange'})

// 差
const r4 = polygonClipping.difference(poly1, poly2 /* , poly3, ... */)

console.log('🚀 ~ index.ts:11 ==> r1, r2, -->', r1, r2, r3, r4,);
