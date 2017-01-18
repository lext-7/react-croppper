import React from 'react';
import ReactDom from 'react-dom';
import Croppper from '../src';
import './index.html';

class Test extends React.Component {

    constructor(props) {
        super(props);
        this.urls = [
            'https://fengyuanchen.github.io/cropper/img/picture.jpg',
            'http://www.w3schools.com/css/trolltunga.jpg',
        ];
        this.state = {
            url: this.urls[0],
            container: {
                width: 800,
                height: 400,
            },
            overflow: false,
            disabled: false,
            cropBoxRatio: 1,
            img: {
                top: 0,
                left: 0,
                width: 0,
                height: 0,
            }
        };
    }

    componentDidMount() {
        this.getData(2000);
    }

    changeUrl(delay) {
        setTimeout(() => {
            this.setState({
                url: this.urls[1],
            });
        }, delay);
    }

    changeContainer(delay) {
        setTimeout(() => {
            this.setState({
                container: {
                    width: 600,
                    height: 300,
                },
            });
        }, delay);
    }

    changeOverflow(delay) {
        setTimeout(() => {
            this.setState({
                overflow: !this.state.overflow,
            });
            this.changeOverflow(delay);
        }, delay);
    }

    changeDisabled(delay) {
        setTimeout(() => {
            this.setState({
                disabled: !this.state.disabled,
            });
            this.changeDisabled(delay);
        }, delay);
    }

    changeCropBoxRatio(delay) {
        setTimeout(() => {
            this.setState({
                cropBoxRatio: this.state.cropBoxRatio === 1 ? 0 : 1,
            });
            this.changeCropBoxRatio(delay);
        }, delay);
    }

    getData(delay) {
        setTimeout(() => {
            console.log(this.cropper.getData());
            console.log(this.cropper.getImageData());
            console.log(this.cropper.getContainerData());
            console.log(this.cropper.getCanvasData());
            console.log(this.cropper.getCropBoxData());
        }, delay);
    }

    moveCanvas(delay) {
        setTimeout(() => {
            this.cropper.moveCanvas({
                left: 0,
                top: 0,
                width: 100,
                height: 100
            });
        }, delay);
    }

    moveCropBox(delay) {
        setTimeout(() => {
            this.cropper.moveCropBox({
                left: 0,
                top: 0,
                width: 100,
                height: 100
            });
        }, delay);
    }

    updatePreview(cantainer, canvas, cropBox, img) {
        let view = canvas.relativeTo(cropBox);
        this.setState({
            img: view,
        });
    }

    render() {
        const state = this.state;
        return (
            <div>
                <Croppper
                    ref={cropper => this.cropper = cropper}
                    url={state.url}
                    width={state.container.width}
                    height={state.container.height}
                    cropBoxPos={{
                        type: 0,
                        width: 200,
                        height: 200,
                    }}
                    overflow={state.overflow}
                    cropBoxRatio={state.cropBoxRatio}
                    disabled={state.disabled}
                    onChange={this.updatePreview.bind(this)}
                />
                <div id="preview" style={{
                    width: 200,
                    height: 200,
                }}>
                    <img src={state.url} style={state.img}/>
                </div>
            </div>
        );
    }
}

ReactDom.render(
    <Test />,
    document.getElementById('cropper'),
);
