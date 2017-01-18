# React Cropper

> 改自[fengyuanchen/cropper](https://github.com/fengyuanchen/cropper)  

## Getting started

### Usage


```jsx
import Cropper from './src/index.js';

ReactDom.render(
    <Croppper
        url=""
        width={1200}
        height={600}
        cropBoxPos={{
            type: 0,
            width: 200,
            height: 200,
        }}
        overflow={false}
        cropBoxRatio={1}
    />,
    document.getElementById('cropper'),
);

```

## Props

```js
static propTypes = {
    // 图像地址
    url: PropTypes.string,
    // container 大小， -1表示根据图像大小
    width: PropTypes.number,
    height: PropTypes.number,
    // container 宽高比，width优先
    ratio: PropTypes.number,
    mask: PropTypes.element,
    // 图像位置，默认在container缩放居中
    canvasPos: PropTypes.oneOfType([
        PropTypes.oneOf([
            PosEnum.Fit,
            PosEnum.Origin,
            PosEnum.OriginFit,
        ]),
        /**
            * @type 可选，当为Fit时，top、left将被忽略
            * @top 左上角坐标y
            * @left 左上角坐标x
            */
        PropTypes.shape({
            type: PropTypes.oneOf([PosEnum.Fit]),
            top: PropTypes.number,
            left: PropTypes.number,
            width: PropTypes.number,
            height: PropTypes.number,
        }),
    ]),
    // 图像宽高比, 0代表无限制
    canvasRatio: PropTypes.number,
    // 截取框宽高比
    cropBoxRatio: PropTypes.number,
    // 截取框是否可以超出图像
    overflow: PropTypes.bool,
    // 截取框位置，默认在图像中缩放居中
    cropBoxPos: PropTypes.oneOfType([
        PropTypes.oneOf([
            PosEnum.Fit,
            PosEnum.FitInCanvas,
        ]),
        // 同canvasPos
        PropTypes.shape({
            type: PropTypes.oneOf([PosEnum.Fit]),
            top: PropTypes.number,
            left: PropTypes.number,
            width: PropTypes.number,
            height: PropTypes.number,
        }),
    ]),
    disabled: PropTypes.bool,
};

/**
 * 位置类型
 * @enum {number}
 */
const PosEnum = {
    /**
     * 在container中居中，并缩放到合适大小
     */
    Fit: 0,
    /**
     * 原大小居中
     */
    OriginFit: 1,
    /**
     * 保持原大小，不居中
     */
    Origin: 2,
    /**
     * 在图片显示范围内缩放居中，用于截取框
     */
    FitInCanvas: 3,
};

/**
 * 方向
 * 方向按照顺时针方向， ( direction + 2 ) % 4 代表对角
 * @enum {number}
 */
const DirectionEnum = {
    /**
     * 左上角方向
     */
    NW: 0,
    /**
     * 右上角方向
     */
    NE: 1,
    /**
     * 右下角方向
     */
    SE: 2,
    /**
     * 左下角方向
     */
    SW: 3,
};
```

## Methods

```js
class Cropper {
    /**
     * 获取截取框相对图像的位置
     *
     * @returns {Rect}
     *
     * @memberOf Cropper
     */
    getData() {
    }

    /**
     * 获取图像信息
     *
     * @returns { width: number, height: number }
     *
     * @memberOf Cropper
     */
    getImageData() {
    }

    /**
     * 获取container位置
     *
     * @returns {Rect}
     *
     * @memberOf Cropper
     */
    getContainerData() {
    }

    /**
     * 获取图像位置
     *
     * @returns {Rect}
     *
     * @memberOf Cropper
     */
    getCanvasData() {
    }

    /**
     * 获取截图框位置
     *
     * @returns {Rect}
     *
     * @memberOf Cropper
     */
    getCropBoxData() {
    }

    /**
     * 移动图像
     *
     * @param {Rect} pos
     *
     * @memberOf Cropper
     */
    moveCanvas(pos) {
    }

    /**
     * 移动截取框
     *
     * @param {any} pos
     *
     * @memberOf Cropper
     */
    moveCropBox(pos) {
    }
}
```
