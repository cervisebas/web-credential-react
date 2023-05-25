export function getForScale(scale: number, size: number) {
    return ((scale * size) / 1);
}
export function isHexColor(hex: string) {
    const reg = /^#([0-9a-f]{3}){1,2}$/i;
    return reg.test(hex);
}