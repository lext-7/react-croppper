/**
 * 获取图像大小
 *
 * @export
 * @param {string} url
 * @param {Function} cb 回调 (width, heigth) => {}
 */
export function getImageSize(url, cb) {
    const imgEle = document.createElement('img');
    imgEle.onload = function () {
        cb(this.width, this.height);
    };

    imgEle.src = url;
}
