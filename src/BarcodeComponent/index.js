import React from 'react';
import PropTypes from 'prop-types';
import barcodes from 'jsbarcode/src/barcodes';

const Barcode = ({
  value = '',
  width = 2,
  height = 100,
  format = 'CODE128',
  lineColor = '#000000',
  background = '#ffffff',
  text,
  textStyle,
  style,
  onError,
  maxWidth,
}) => {
  const drawRect = (x, y, width, height) => {
    return `M${x},${y}h${width}v${height}h-${width}z`;
  };

  const drawSvgBarCode = (encoded) => {
    const rects = [];
    const { data: binary } = encoded;

    const barCodeWidth = binary.length * width;
    const singleBarWidth =
      typeof maxWidth === 'number' && barCodeWidth > maxWidth
        ? maxWidth / binary.length
        : width;
    let barWidth = 0;
    let x = 0;
    let yFrom = 0;

    for (let b = 0; b < binary.length; b++) {
      x = b * singleBarWidth;
      if (binary[b] === '1') {
        barWidth++;
      } else if (barWidth > 0) {
        rects[rects.length] = drawRect(
          x - singleBarWidth * barWidth,
          yFrom,
          singleBarWidth * barWidth,
          height,
        );
        barWidth = 0;
      }
    }

    if (barWidth > 0) {
      rects[rects.length] = drawRect(
        x - singleBarWidth * (barWidth - 1),
        yFrom,
        singleBarWidth * barWidth,
        height,
      );
    }

    return rects;
  };

  const encode = (text, Encoder) => {
    if (typeof text !== 'string' || text.length === 0) {
      throw new Error('Barcode value must be a non-empty string');
    }
    const encoder = new Encoder(text, {
      width,
      format,
      height,
      lineColor,
      background,
      flat: true,
    });
    if (!encoder.valid()) {
      throw new Error('Invalid barcode for selected format.');
    }
    return encoder.encode();
  };

  const { bars, barCodeWidth } = React.useMemo(() => {
    try {
      const encoder = barcodes[format];
      if (!encoder) {
        throw new Error('Invalid barcode format.');
      }
      const encoded = encode(value, encoder);
      const barCodeWidth = encoded.data.length * width;
      return {
        bars: drawSvgBarCode(encoded),
        barCodeWidth:
          typeof maxWidth === 'number' && barCodeWidth > maxWidth
            ? maxWidth
            : barCodeWidth,
      };
    } catch (error) {
      if (__DEV__) {
        console.error(error.message);
      }
      if (onError) {
        onError(error);
      }
    }
    return {
      bars: [],
      barCodeWidth: 0,
    };
  }, [value, width, height, format, lineColor, background, maxWidth]);

  return (
    <div style={{ ...style, backgroundColor: background, alignItems: 'center' }}>
      <svg height={height} width={barCodeWidth} fill={lineColor}>
        <path d={bars.join(' ')} />
      </svg>
      {text && <label style={[{ textAlign: 'center' }, textStyle]}>{text}</label>}
    </div>
  );
};

Barcode.propTypes = {
  value: PropTypes.string.isRequired,
  format: PropTypes.oneOf(Object.keys(barcodes)),
  width: PropTypes.number,
  maxWidth: PropTypes.number,
  height: PropTypes.number,
  lineColor: PropTypes.string,
  background: PropTypes.string,
  text: PropTypes.node,
  textStyle: PropTypes.object,
  style: PropTypes.object,
  onError: PropTypes.func,
};

export default Barcode;
