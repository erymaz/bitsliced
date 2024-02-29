import './multi-carousel.css';
import 'twin.macro';

import React, { Component } from 'react';

import { getIcon } from '../ColoredIcon';

class MultiCarousel extends Component {
  constructor(props) {
    super(props);

    this.touchSensitivity = 10;
    this.interval = 3000;

    this.tmr = null;

    this.state = {
      currentIndex: 0,
      length: this.props.children?.length ?? 0,
      paused: false,
      touchPosition: null,
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.onResize);
    this.onResize();

    if (!this.props.disableAnimation) {
      this.tmr = setInterval(() => {
        if (!this.state.paused) {
          this.onNext();
        }
      }, this.interval);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.children && prevProps.children !== this.props.children) {
      this.setState({ length: this.props.children.length });
    }

    if (this.props.setCurrent && prevState.currentIndex !== this.state.currentIndex) {
      this.props.setCurrent(this.state.currentIndex);
    }

    if (this.props.setShow && prevState.show !== this.state.show) {
      this.props.setShow(this.state.show);
      if (this.state.currentIndex + this.state.show >= this.state.length) {
        this.setState({ currentIndex: this.state.length - this.state.show });
      }
    }
  }

  componentWillUnmount() {
    if (this.tmr)
      clearInterval(this.tmr);
    this.tmr = null;

    window.removeEventListener('resize', this.onResize);
  }

  onResize = () => {
    for (const bp of this.props.breakpoints) {
      const w = Object.keys(bp)[0];
      if (window.innerWidth >= w) {
        this.setState({ show: bp[w] });
        break;
      }
    }
  };

  onPrev = () => {
    if (this.state.currentIndex > 0) {
      this.setState({ currentIndex: this.state.currentIndex - 1 });
    }
    else {
      this.setState({ currentIndex: this.state.length - this.state.show });
    }
  };

  onNext = () => {
    if (this.state.currentIndex < (this.state.length - this.state.show)) {
      this.setState({ currentIndex: this.state.currentIndex + 1 });
    }
    else {
      this.setState({ currentIndex: 0 });
    }
  };

  handleTouchStart = e => {
    this.setState({ touchPosition: e.touches[0].clientX });
  };

  handleTouchMove = e => {
    const touchDown = this.state.touchPosition;

    if (touchDown === null)
      return;

    const currentTouch = e.touches[0].clientX;
    const diff = touchDown - currentTouch;

    if (diff > this.touchSensitivity) {
      this.onNext();
    }

    if (diff < -this.touchSensitivity) {
      this.onPrev();
    }

    this.setState({ touchPosition: null });
  }

  handleMouseDown = e => {
    this.setState({ touchPosition: e.clientX });
  }

  handleMouseMove = () => {
    if (this.state.touchPosition === null)
      return;
  }

  handleMouseUp = e => {
    const touchDown = this.state.touchPosition;
    if (touchDown === null)
      return;
    const currentTouch = e.clientX;
    const diff = touchDown - currentTouch;

    if (diff > this.touchSensitivity) {
      this.onNext();
    }

    if (diff < -this.touchSensitivity) {
      this.onPrev();
    }

    this.setState({ touchPosition: null });
  }

  render() {
    const array_length = this.state.length - (this.state.show ?? 0) + 1;
    const indicators = new Array(array_length > 0 ? array_length : 1).fill(0);
    if (this.state.currentIndex < this.state.length) {
      indicators[this.state.currentIndex] = 1;
    }

    return (
      <div
        className={`carousel-container ${this.state.show > 2 ? 'cropped' : ''}`}
        onMouseDown={this.handleMouseDown}
        onMouseEnter={() => { this.setState({ paused: true }) }}
        onMouseLeave={() => {
          this.setState({ touchPosition: null });
          this.setState({ paused: false });
        }}
        onMouseMove={this.handleMouseMove}
        onMouseUp={this.handleMouseUp}
        onTouchMove={this.handleTouchMove}
        onTouchStart={this.handleTouchStart}
      >
        <div
          className={`carousel-content show-${this.state.show}`}
          style={{
            position: 'relative',
            transform: `translateX(-${this.state.currentIndex * (100 / this.state.show)}%)`,
            // transition: this.state.currentIndex + this.state.show >= this.state.length ? 'none' : 'all 0.4s ease-out',
          }}
        >
          {this.props.children}
        </div>
        {/* <div className="indicators">
          {indicators.map((item, index) => (
            <div
              key={index}
              className={`indicator ${item ? 'bg-white' : 'bg-[#fff6]'}`}
              onClick={() => {
                this.setState({ currentIndex: index })
              }}
            />
          ))}
        </div> */}
        <div tw="absolute px-4 md:px-0 w-1/2 md:w-full max-w-[1172px] h-10 left-[unset] md:left-1/2 right-0 md:right-[unset] top-[-64px] md:top-[-58px] md:translate-x-[-50%] flex justify-end md:justify-start items-center gap-4 md:gap-[17px] cursor-pointer">
          <button onClick={this.onPrev}>
            {getIcon('back', '#000')}
          </button>
          <button onClick={this.onNext}>
            {getIcon('arrow', '#000')}
          </button>
        </div>
      </div >
    );
  }
}

export default MultiCarousel;
