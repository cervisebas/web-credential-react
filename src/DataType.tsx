export type DataType = {
    data: {
        image: string;
        barcode: string;
        name: string;
    };
    background: string;
    barcode: {
        y: number;
        x: number;
        color?: string;
        background?: string;
        width: number;
        height: number;
    };
    image?: {
        x: number;
        y: number;
        width: number;
        height: number;
        borderRadius: number;
        borderWidth?: number;
        borderColor?: string;
    };
    name: {
        x: number;
        y: number;
        width: number;
        height?: number;
        color: string;
        fontSize: number;
        fontFamily?: string;
        fontWeight?: "bold" | "normal" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900";
        textAlign?: "center" | "left" | "right";
        textVerticalAlign?: "center" | "flex-start" | "flex-end";
        textShadowColor?: string;
        textShadowOffset?: {
            width: number;
            height: number;
        };
        textShadowRadius?: number;
        maxNumberLines?: number;
    };
};