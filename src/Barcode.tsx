import { useBarcode } from "next-barcode";
import { getForScale } from "./Utils";

export default function Barcode(props: { style: React.CSSProperties; value: string; scale: number; }) {
    const { inputRef } = useBarcode({
        value: props.value,
        options: {
          displayValue: false,
          background: '#FFFFFF',
          width: getForScale(props.scale, 1000),
          height: getForScale(props.scale, 247),
          margin: 0
        }
    });
    return(<div style={props.style}>
        <canvas
            ref={inputRef}
            style={{ width: '100%', height: '100%' }}
            width={getForScale(props.scale, 1000)}
            height={getForScale(props.scale, 247)}
        />
    </div>);
}