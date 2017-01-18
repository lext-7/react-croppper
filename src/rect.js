/**
 * 矩形类
 * {
 *  top: number,
 *  left: number,
 *  width: number,
 *  height: number,
 * }
 *
 * @class Rect
 */
class Rect {

    /**
     * 用于拷贝
     *
     * @static
     *
     * @memberOf Rect
     */
    static Keys = [
        'top',
        'left',
        'width',
        'height',
    ];

    /**
     * 求矩形交集
     *
     * @static
     * @param {Rect} one
     * @param {Rect} another
     * @returns {Rect} intersection
     *
     * @memberOf Rect
     */
    static intersection(one, another) {
        const top = one.top > another.top ? one.top : another.top;
        const left = one.left > another.left ? one.left : another.left;
        return new Rect(
            left,
            top,
            (one.left + one.width < another.left + another.width ?
                one.left + one.width : another.left + another.width) - left,
            (one.top + one.height < another.top + another.height ?
                one.top + one.height : another.top + another.height) - top,
        );
    }

    /**
     * 是否相等
     *
     * @static
     * @param {Rect} one
     * @param {Rect} another
     * @returns {Rect}
     *
     * @memberOf Rect
     */
    static equal(one, another) {
        return one.top === another.top &&
            one.left === another.left &&
            one.width === another.width &&
            one.height === another.height;
    }

    /**
     * Creates an instance of Rect.
     *
     * @param {number} [left=0]
     * @param {number} [top=0]
     * @param {number} [width=0]
     * @param {number} [height=0]
     *
     * @memberOf Rect
     */
    constructor(left = 0, top = 0, width = 0, height = 0) {
        this.top = top;
        this.left = left;
        this.width = width;
        this.height = height;
    }

    /**
     * 求矩形交集
     *
     * @param {Rect} another
     * @returns {Rect}
     *
     * @memberOf Rect
     */
    intersection(another) {
        return this.constructor.intersection(this, another);
    }

    /**
     * 拷贝
     *
     * @param {Rect} one
     * @returns
     *
     * @memberOf Rect
     */
    extends(one) {
        const keys = this.constructor.Keys;
        keys.forEach((key) => {
            if (typeof one[key] === 'number') {
                this[key] = one[key];
            }
        });
        return this;
    }

    /**
     * 缩放
     * 如果有宽高比，优先选择height
     *
     * @param {number} width
     * @param {number} height
     * @param {number} ratio 0 => unlimited
     * @returns {Rect}
     *
     * @memberOf Rect
     */
    scale(width, height, ratio) {
        this.height += height;
        if (ratio) {
            this.width = this.height * ratio;
        } else {
            this.width += width;
        }
        return this;
    }

    /**
     * 按比例缩放
     *
     * @param {number} ratio
     * @returns {Rect}
     *
     * @memberOf Rect
     */
    zoomTo(ratio) {
        this.top *= ratio;
        this.left *= ratio;
        this.width *= ratio;
        this.height *= ratio;
        return this;
    }

    /**
     * 缩放到在某个视图内
     *
     * @param {Rect} rect
     * @returns {Rect}
     *
     * @memberOf Rect
     */
    scaleLimit(rect) {
        if (this.width > rect.width) {
            this.height = this.height * rect.width / this.width;
            this.width = rect.width;
        }
        if (this.height > rect.height) {
            this.width = this.width * rect.height / this.height;
            this.height = rect.height;
        }
        return this;
    }

    /**
     * 限制在某个范围内
     *
     * @param {Rect} viewRect
     * @param {boolean} overflow
     * @param {number} ratio
     * @returns {Rect}
     *
     * @memberOf Rect
     */
    limit(viewRect, overflow, ratio) {
        if (this.top < viewRect.top) {
            this.top = viewRect.top;
        }
        if (this.left < viewRect.left) {
            this.left = viewRect.left;
        }
        if (this.top + this.height > viewRect.top + viewRect.height) {
            this.top = viewRect.top + viewRect.height - this.height;
            if (this.top < viewRect.top && !overflow) {
                this.height = viewRect.height;
                this.top = 0;
                if (ratio) {
                    this.width = this.height * ratio;
                }
            }
        }
        if (this.left + this.width > viewRect.left + viewRect.width) {
            this.left = viewRect.left + viewRect.width - this.width;
            if (this.left < viewRect.left && !overflow) {
                this.width = viewRect.width;
                this.left = 0;
                if (ratio) {
                    this.height = this.width / ratio;
                }
            }
        }
        return this;
    }

    /**
     * 根据宽高比调整，变小调整
     *
     * @param {number} ratio 0 => unlimited
     * @returns {Rect}
     *
     * @memberOf Rect
     */
    scaleWithRatio(ratio) {
        if (!ratio) {
            return this;
        }
        const adjustedHeight = this.width / ratio;
        if (this.height < adjustedHeight) {
            this.width = this.height * ratio;
        } else {
            this.height = this.width / ratio;
        }
        return this;
    }

    /**
     * 在某个视图内居中
     *
     * @param {Rect} rect
     * @return {Rect}
     *
     * @memberOf Rect
     */
    center(rect) {
        this.left = rect.left + (rect.width - this.width) / 2;
        this.top = rect.top + (rect.height - this.height) / 2;
        return this;
    }

    /**
     * 相对于另一个视图的相对坐标
     *
     * @param {Rect} rect
     * @returns {Rect}
     *
     * @memberOf Rect
     */
    relativeTo(rect) {
        return new Rect(
            this.left - rect.left,
            this.top - rect.top,
            this.width,
            this.height,
        );
    }
}

export default Rect;
