import {MultiPolygon} from "polygon-clipping";
import {Vector2} from 'three'
import {PointLabel} from "./type";
import cv from 'opencv-ts';
import { polygon, simplify } from '@turf/turf';

export function drawPolygon(ctx: CanvasRenderingContext2D, polygonGroup: MultiPolygon, style?: {
    fillStyle: string;
    fillRule?: CanvasFillRule;
}) {
    const renderStyle = Object.assign(
        {
            fillStyle: 'blue',
        },
        style,
    );
    polygonGroup.forEach(polygon => {
        ctx.save();
        const path = new Path2D()
        ctx.beginPath();
        polygon.forEach(ring => {
            ring.forEach((p, i) => {
                if (i === 0) {
                    path.moveTo(p[0], p[1]);
                } else {
                    path.lineTo(p[0], p[1]);
                }
            })
        })
        path.closePath();
        ctx.fillStyle = renderStyle.fillStyle;
        ctx.fill(path, renderStyle.fillRule);
        ctx.restore();
    })
}

export function openCvReady() {
    return new Promise(resolve => {
        cv['onRuntimeInitialized']=()=>{
            // do all your work here
            resolve('')
        };
    })
}

export function maskToPolygon(
    cvs: HTMLCanvasElement,
    smoothness: number,
): { data: Vector2[]; type: PointLabel }[] | undefined {
    if (!cvs) return;
    const mat = cv.imread(cvs);
    cv.cvtColor(mat, mat, cv.COLOR_RGBA2GRAY, 0);
    cv.threshold(mat, mat, 20, 255, cv.THRESH_BINARY);
    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();
    cv.findContours(mat, contours, hierarchy, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE);
    const contoursSize = contours.size();
    const polygons: Vector2[][] = [];

    const treeMsgList = [];
    for (let i = 0; i < contoursSize; i++) {
        // NOTE: 一次遍历，处理一个轮廓
        const contour = contours.get(i);
        let points: [number, number][] = [];
        for (let j = 0; j < contour.data32S.length; j += 2) {
            points.push([contour.data32S[j], contour.data32S[j + 1]]);
            // polygons[i].push(new Vector2(contour.data32S[j], contour.data32S[j + 1]));
        }
        if (points.length > 100) {
            points.push([points[0][0], points[0][1]]);
            const simplifies = simplify(polygon([points]), {
                // tolerance: 3.5 - this.renderView.editor.state.config.modelCreatePolygonSmoothness,
                tolerance: 3.5 - smoothness,
                highQuality: false,
            });
            const coordinate = simplifies.geometry.coordinates[0];
            coordinate.pop();
            points = coordinate as [number, number][];
        }
        // TODO: 将这一组轮廓点对应的树形结构信息写入
        const treeMsg = [
            hierarchy.data32S[i * 4 + 2] /* parentIndex */,
            hierarchy.data32S[i * 4 + 3] /* childIndex */,
        ];
        treeMsgList.push(treeMsg);
        polygons[i] = points.map((p) => new Vector2(p[0], p[1]));
    }

    const deepMap = calculateDepth(treeMsgList);
    console.log('🚀 ~ renderMask.ts:218 ==> deepMap-->', deepMap, polygons.length);
    mat.delete();
    contours.delete();
    hierarchy.delete();

    return polygons.map((polygon, index) => {
        return {
            data: polygon,
            type: deepMap.get(index)! % 2 === 0 ? PointLabel.ADD : PointLabel.DEL,
        };
    });
}

function calculateDepth(treeIndex: number[][]) {
    const depthMap = new Map<number, number>(); // 用于存储每组数据对应的深度

    for (let i = 0; i < treeIndex.length; i++) {
        const targetIndex = i;
        let targetDepth = 0;
        let curIndex = targetIndex;
        let parentIndex = treeIndex[i][0];
        // let childIndex = treeIndex[i][1];
        while (parentIndex !== -1) {
            curIndex = parentIndex;
            parentIndex = treeIndex[curIndex][0];
            // childIndex = treeIndex[curIndex][1]
            targetDepth++;
        }
        depthMap.set(targetIndex, targetDepth);
    }

    return depthMap;
}


