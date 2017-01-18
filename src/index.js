import React, { Component, PropTypes } from 'react';
import Rect from './rect';
import { getImageSize } from './utils';
import './index.less';

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

/**
 * 截图组件
 *
 * @class Cropper
 * @extends {Component}
 */
class Cropper extends Component {

    static defaultProps = {
        // container 大小， -1表示根据图像大小
        width: -1,
        height: -1,
        // container 宽高比，width优先
        ratio: 1,
        // 图像位置，默认在container缩放居中
        canvasPos: PosEnum.Fit,
        // 截取框位置，默认在图像中缩放居中
        cropBoxPos: PosEnum.FitInCanvas,
        // 图像宽高比, 0代表无限制
        canvasRatio: 0,
        // 截取框宽高比
        cropBoxRatio: 0,
        // 截取框是否可以超出图像
        overflow: false,
        disabled: false,
    };

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
        onCropMoveStart: PropTypes.func,
        onCropMoveMove: PropTypes.func,
        onCropMoveEnd: PropTypes.func,
        onCropScaleStart: PropTypes.func,
        onCropScaleMove: PropTypes.func,
        onCropScaleEnd: PropTypes.func,
        onMoveCanvas: PropTypes.func,
        onMoveCropBox: PropTypes.func,
        onImgLoaded: PropTypes.func,
        onChange: PropTypes.func,
    };

    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
            container: {
            },
            canvas: {
            },
            cropBox: {
            },
        };
        this.static = {
            inited: false,
            onCropScaleStartNE: this.onCropScaleStart.bind(this, DirectionEnum.NE),
            onCropScaleStartNW: this.onCropScaleStart.bind(this, DirectionEnum.NW),
            onCropScaleStartSE: this.onCropScaleStart.bind(this, DirectionEnum.SE),
            onCropScaleStartSW: this.onCropScaleStart.bind(this, DirectionEnum.SW),
            onMouseMove: this.onMouseMove.bind(this),
            onMouseUp: this.onMouseUp.bind(this),
        };
    }

    /**
     * 加载图像、绑定事件
     *
     * @memberOf Cropper
     */
    componentDidMount() {
        this.loadImg(this.props);
        this.bind();
    }

    /**
     * url change => 重新加载图像
     * canvasPos、cropBoxPos change => 移动
     * other change => 根据旧pos update
     *
     * @param {Props} nextProps
     *
     * @memberOf Cropper
     */
    componentWillReceiveProps(nextProps) {
        const {
            url,
            cropBoxPos,
        } = this.props;
        let update = true;
        let keepOldCropBoxState = true;

        if (url !== nextProps.url) {
            update = false;
        }
        if (!Rect.equal(cropBoxPos, nextProps.cropBoxPos)
            && cropBoxPos.type !== nextProps.cropBoxPos) {
            keepOldCropBoxState = false;
        }
        if (update) {
            this.update(this.state.img, nextProps, keepOldCropBoxState);
        } else {
            this.loadImg(nextProps, keepOldCropBoxState);
        }
    }

    /**
     * 解绑事件
     *
     * @memberOf Cropper
     */
    componentWillUnmount() {
        this.unbind();
    }

    /**
     * 移动截取框开始事件处理
     *
     * @private
     * @param {Event} event
     * @returns
     *
     * @memberOf Cropper
     */
    onCropMoveStart(event) {
        if (!this.onMouseDown(event)) {
            return;
        }
        this.static.action = 'onCropMoveMove';
        this.call('onCropMoveStart');
    }

    /**
     * 移动截图框移动事件处理
     *
     * @private
     *
     * @memberOf Cropper
     */
    onCropMoveMove() {
        const pos = this.state.cropBox;
        const delta = this.static.delta;
        this.moveCropBox({
            left: pos.left + delta.left,
            top: pos.top + delta.top,
            width: pos.width,
            height: pos.height,
        });
        this.onChange('onCropMoveMove');
    }

    /**
     * 缩放截取框开始事件处理
     *
     * @private
     * @param {DirectionEnum} direction
     * @param {Event} event
     * @returns
     *
     * @memberOf Cropper
     */
    onCropScaleStart(direction, event) {
        if (!this.onMouseDown(event)) {
            return;
        }
        this.static.action = 'onCropScaleMove';
        this.static.direction = direction;
        this.call('onCropScaleStart', direction);
    }

    /**
     * 缩放截取框移动事件处理
     *
     * @private
     * @param {Event} event
     *
     * @memberOf Cropper
     */
    onCropScaleMove() {
        const { cropBoxRatio } = this.props;
        const currentPos = this.state.cropBox;
        const delta = this.static.delta;
        const currentDirection = this.static.direction;
        const container = this.state.container;
        const { pos, direction } = this.getCropBoxScaleRect(
            currentDirection,
            delta,
            currentPos,
            cropBoxRatio,
            container,
        );
        this.static.direction = direction;
        if (pos) {
            this.moveCropBox(pos);
        }
        this.onChange('onCropScaleMove');
    }

    /**
     * mouse down事件统一入口
     * 记录mouse down坐标，做事件处理标记(busy)
     *
     * @private
     * @param {Event} event
     * @returns
     *
     * @memberOf Cropper
     */
    onMouseDown(event) {
        if (this.static.busy || this.props.disabled) {
            return false;
        }
        this.static.start = this.getMousePos(event);
        this.static.busy = true;
        return true;
    }

    /**
     * mouse move事件统一入口
     * 所有mouse move都绑定到这里
     * 根据mouse down后各事件处理做下的标记(action)来分发mouse move处理调用
     *
     * @private
     * @param {Event} event
     * @returns {boolean}
     *
     * @memberOf Cropper
     */
    onMouseMove(event) {
        if (this.props.disabled || !this.static.busy || this.static.onMoved) {
            this.onMouseUp(event);
            return false;
        }
        this.static.onMoved = true;
        const current = this.getMousePos(event);
        const start = this.static.start;
        this.static.delta = {
            left: current.left - start.left,
            top: current.top - start.top,
        };
        this.static.start = current;
        const action = this.static.action;
        this[action](event);
        this.static.onMoved = false;
        return true;
    }

    /**
     * mouse up事件统一入口
     * 统一释放资源，reset标记
     *
     * @private
     * @returns
     *
     * @memberOf Cropper
     */
    onMouseUp() {
        if (this.static.action) {
            this.call(this.static.action.replace(/(Start|Move)$/, 'End'));
        }
        this.static.start = null;
        this.static.move = null;
        this.static.delta = null;
        this.static.busy = false;
        this.static.action = null;
        return true;
    }

    /**
     * 更改回调统一入口
     *
     * @param {string} name 具体回调名
     *
     * @memberOf Cropper
     */
    onChange(name) {
        this.call(
            'onChange',
            this.getData(),
            this.getContainerData(),
            this.getCanvasData(),
            this.getCropBoxData(),
            this.getImageData(),
        );
        this.call(
            name,
            this.getContainerData(),
            this.getCanvasData(),
            this.getCropBoxData(),
            this.getImageData(),
        );
    }

    /**
     * 计算图像位置大小
     *
     * @private
     * @param {Rect|PosEnum} pos
     * @param {number} ratio 宽高比
     * @param {Object} img
     * @param {Rect} container
     * @returns {Rect}
     *
     * @memberOf Cropper
     */
    getCanvasRect(pos, ratio, img, container) {
        const rect = new Rect();

        if (pos === PosEnum.Fit || pos === PosEnum.OriginFit) {
            rect.extends(img);
            if (pos === PosEnum.Fit) {
                // 等比缩放到container 里
                rect.scaleLimit(container);
            }
            rect.center(container);
        } else if (pos === PosEnum.Origin) {
            rect.extends({
                width: img.width,
                height: img.height,
                top: 0,
                left: 0,
            });
        } else {
            rect.width = pos.width >= 0 ? pos.width
                : pos.height >= 0 ? pos.height * (ratio || img.ratio) : img.width;
            rect.height = pos.height >= 0 ? pos.height
                : pos.width >= 0 ? pos.width / (ratio || img.ratio) : rect.width;
            rect.top = pos.type === PosEnum.Fit ? (container.height - rect.height) / 2 : pos.top;
            rect.left = pos.type === PosEnum.Fit ? (container.width - rect.width) / 2 : pos.left;
        }
        return rect;
    }

    /**
     * 计算截取框位置大小
     *
     * @private
     * @param {Rect|PosEnum} pos
     * @param {Object} options { overflow: boolean, ratio: number }
     * @param {Rect} container
     * @param {Rect} canvas
     * @returns {Rect}
     *
     * @memberOf Cropper
     */
    getCropBoxRect(pos, options, container, canvas) {
        const { overflow, ratio } = options;
        const rect = new Rect();

        if (pos === PosEnum.Fit && overflow) {
            pos = PosEnum.FitInCanvas;
        }
        if (pos === PosEnum.Fit || pos === PosEnum.FitInCanvas) {
            const view = pos === PosEnum.Fit ? container : container.intersection(canvas);
            rect
                .extends(view)
                .scaleWithRatio(ratio)
                .center(view);
        } else {
            const top = pos.top;
            const left = pos.left;
            const view = overflow ? container : container.intersection(canvas);
            const width = pos.width;
            rect.extends({
                top,
                left,
                width,
                height: ratio ? width / ratio : pos.height,
            });
            rect.limit(view, overflow, ratio);
            if (pos.type === PosEnum.Fit) {
                rect.center(view);
            }
        }
        return rect;
    }

    /**
     * 计算container位置大小
     *
     * @private
     * @param {Object} img 包含width、height属性的图像信息
     * @returns {Rect}
     *
     * @memberOf Cropper
     */
    getContainerRect(img, props) {
        let {
            width,
            height,
        } = props;
        const ratio = props.ratio;

        if (height < 0 && width >= 0 && img) {
            height = img.height * width / img.width;
        } else if (width < 0 && height >= 0 && img) {
            width = img.width * height / img.height;
        }
        if (width < 0 && img) {
            width = img.width * ratio;
        }
        if (height < 0 && img) {
            height = img.height * ratio;
        }
        return new Rect(0, 0, width, height);
    }

    /**
     * 计算不同方向缩放后的位置大小
     *
     * @private
     * @param {DirectionEnum} direction 变更方向
     * @param {Rect} delta 变化量
     * @param {Rect} pos 当前位置
     * @param {Rect} container
     * @returns {Object} { pos: Rect, direction: DirectionEnum }
     *
     * @memberOf Cropper
     */
    getCropBoxScaleRect(direction, delta, pos, ratio, container) {
        let nextPos = new Rect();
        nextPos.extends(pos);
        switch (direction) {
        case DirectionEnum.NW:
            {
                const fixedPoint = {
                    left: pos.left + pos.width,
                    top: pos.top + pos.height,
                };
                nextPos.scale(-delta.left, -delta.top, ratio);
                nextPos = nextPos
                    .extends({
                        left: fixedPoint.left - nextPos.width,
                        top: fixedPoint.top - nextPos.height,
                    })
                    .intersection(container)
                    .scaleWithRatio(ratio);
                nextPos.top = fixedPoint.top - nextPos.height;
                nextPos.left = fixedPoint.left - nextPos.width;
            }
            break;
        case DirectionEnum.NE:
            {
                const fixedPoint = {
                    top: pos.top + pos.height,
                    left: pos.left,
                };
                nextPos.scale(delta.left, -delta.top, ratio);
                nextPos = nextPos
                    .extends({
                        left: fixedPoint.left,
                        top: fixedPoint.top - nextPos.height,
                    })
                    .intersection(container)
                    .scaleWithRatio(ratio);
                nextPos.extends({
                    top: fixedPoint.top - nextPos.height,
                    left: fixedPoint.left,
                });
            }
            break;
        case DirectionEnum.SW:
            {
                const fixedPoint = {
                    top: pos.top,
                    left: pos.left + pos.width,
                };
                nextPos.scale(-delta.left, delta.top, ratio);
                nextPos = nextPos
                    .extends({
                        left: fixedPoint.left - nextPos.width,
                        top: fixedPoint.top,
                    })
                    .intersection(container)
                    .scaleWithRatio(ratio);
                nextPos.extends({
                    top: fixedPoint.top,
                    left: fixedPoint.left - nextPos.width,
                });
            }
            break;
        case DirectionEnum.SE:
            {
                const fixedPoint = {
                    top: pos.top,
                    left: pos.left,
                };
                nextPos.scale(delta.left, delta.top, ratio);
                nextPos = nextPos
                    .extends({
                        left: fixedPoint.left,
                        top: fixedPoint.top,
                    })
                    .intersection(container)
                    .scaleWithRatio(ratio);
                nextPos.extends({
                    top: fixedPoint.top,
                    left: fixedPoint.left,
                });
            }
            break;
        default:
            break;
        }
        if (nextPos.width < 0 && nextPos.height < 0) {
            direction = (direction + 2) % 4;
            nextPos.height = 0;
            nextPos.width = 0;
        } else if (nextPos.width < 0) {
            direction = (direction + 1) % 4;
            nextPos.width = 0;
        } else if (nextPos.height < 0) {
            direction = (direction - 1) % 4;
            nextPos.height = 0;
        }
        return {
            pos: nextPos,
            direction,
        };
    }

    /**
     * 获取鼠标坐标
     *
     * @private
     * @param {Event} event
     * @returns {Object} { left: number, top: number }
     *
     * @memberOf Cropper
     */
    getMousePos(event) {
        return {
            left: event.pageX,
            top: event.pageY,
        };
    }

    /**
     * 获取截取框相对原图像的位置
     *
     * @returns {Rect}
     *
     * @memberOf Cropper
     */
    getData() {
        return this.state.cropBox
            .relativeTo(this.state.canvas)
            .zoomTo(this.state.img.width / this.state.canvas.width);
    }

    /**
     * 获取图像信息
     *
     * @returns { width: number, height: number }
     *
     * @memberOf Cropper
     */
    getImageData() {
        return this.state.img;
    }

    /**
     * 获取container位置
     *
     * @returns {Rect}
     *
     * @memberOf Cropper
     */
    getContainerData() {
        return this.state.container;
    }

    /**
     * 获取图像位置
     *
     * @returns {Rect}
     *
     * @memberOf Cropper
     */
    getCanvasData() {
        return this.state.canvas;
    }

    /**
     * 获取截图框位置
     *
     * @returns {Rect}
     *
     * @memberOf Cropper
     */
    getCropBoxData() {
        return this.state.cropBox;
    }

    /**
     * 调用回调
     *
     * @private
     * @param {string} name 回调属性名
     * @param {Function} args 回调参数
     *
     * @memberOf Cropper
     */
    call(name, ...args) {
        const cb = this.props[name];
        if (typeof cb === 'function') {
            cb(...args);
        }
    }

    /**
     * 移动图像
     *
     * @param {Rect} pos
     *
     * @memberOf Cropper
     */
    moveCanvas(pos) {
        const { canvasRatio, overflow, cropBoxRatio } = this.props;
        const { img, container } = this.state;
        const canvas = this.getCanvasRect(pos, canvasRatio, img, container);
        this.setState({
            canvas,
            cropBox: this.getCropBoxRect(pos, {
                overflow,
                cropBoxRatio,
            }, container, canvas),
        });
        this.onChange('onMoveCanvas');
    }

    /**
     * 移动截取框
     *
     * @param {any} pos
     *
     * @memberOf Cropper
     */
    moveCropBox(pos) {
        const { container, canvas } = this.state;
        const { overflow, cropBoxRatio } = this.props;
        this.setState({
            cropBox: this.getCropBoxRect(pos, {
                overflow,
                ratio: cropBoxRatio,
            }, container, canvas),
        });
        this.onChange('onMoveCropBox');
    }

    /**
     * 更新
     *
     * @private
     * @param {Object} img {width: number, height: number }
     * @param {Props} props
     * @param {boolean} keepOldCropBoxState 是否保持旧截取框位置
     *
     * @memberOf Cropper
     */
    update(img, props, keepOldCropBoxState) {
        const {
            canvasPos,
            canvasRatio,
            overflow,
            cropBoxPos,
            cropBoxRatio,
        } = props;
        const oldCropBox = this.state.cropBox;
        const container = this.getContainerRect(img, props);
        const canvas = this.getCanvasRect(canvasPos, canvasRatio, img, container);
        const cropBox = this.getCropBoxRect(keepOldCropBoxState ? oldCropBox : cropBoxPos, {
            overflow,
            ratio: cropBoxRatio,
        }, container, canvas);
        this.setState({
            img,
            container,
            canvas,
            cropBox,
        });
    }

    /**
     * 加载图片宽高
     *
     * @private
     * @param {Props} props
     * @param {boolean} keepOldCropBoxState 是否保持旧截取框位置
     *
     * @memberOf Cropper
     */
    loadImg(props, keepOldCropBoxState) {
        getImageSize(props.url, (width, height) => {
            const img = {
                width,
                height,
                ratio: width / height,
            };
            this.update(img, props, keepOldCropBoxState);
            this.onChange('onImgLoaded');
        });
    }

    /**
     * 绑定document或者window事件
     *
     * @private
     * @memberOf Cropper
     */
    bind() {
        const { onMouseMove, onMouseUp } = this.static;
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    /**
     * 解除绑定document或者window事件
     *
     * @private
     * @memberOf Cropper
     */
    unbind() {
        const { onMouseMove, onMouseUp } = this.static;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mousemove', onMouseUp);
    }

    render() {
        const {
            url,
            mask,
        } = this.props;

        const {
            canvas,
            cropBox,
            container,
        } = this.state;

        const {
            onCropScaleStartNE,
            onCropScaleStartNW,
            onCropScaleStartSE,
            onCropScaleStartSW,
        } = this.static;

        let viewBoxRect;
        if (canvas instanceof Rect) {
            viewBoxRect = canvas.relativeTo(cropBox);
        }

        return (
            <div className="cropper-container" style={container}>
                <div className="cropper-canvas" style={canvas}>
                    <img
                        src={url}
                        style={{
                            width: canvas.width,
                            height: canvas.height,
                        }}
                        alt=""
                    />
                </div>
                <div className="cropper-mask">{mask}</div>
                <div
                    className="cropper-crop-box"
                    style={cropBox}
                    onMouseDown={this.onCropMoveStart.bind(this)}
                >
                    <span className="cropper-view-box">
                        <img
                            src={url}
                            style={viewBoxRect}
                            alt=""
                        />
                    </span>
                    <span className="cropper-dashed dashed-h" />
                    <span className="cropper-dashed dashed-v" />
                    <span className="cropper-center" />
                    <span className="cropper-face" />
                    <span className="cropper-line cropper-line-e" data-action="e" />
                    <span className="cropper-line cropper-line-n" data-action="n" />
                    <span className="cropper-line cropper-line-w" data-action="w" />
                    <span className="cropper-line cropper-line-s" data-action="s" />
                    <span className="cropper-point cropper-point-ne" onMouseDown={onCropScaleStartNE} />
                    <span className="cropper-point cropper-point-nw" onMouseDown={onCropScaleStartNW} />
                    <span className="cropper-point cropper-point-sw" onMouseDown={onCropScaleStartSW} />
                    <span className="cropper-point cropper-point-se" onMouseDown={onCropScaleStartSE} />
                </div>
            </div>
        );
    }
}

export default Cropper;
