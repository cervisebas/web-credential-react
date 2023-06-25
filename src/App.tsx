import React, { useCallback, useEffect, useRef, useState } from 'react';
import { DataType } from './DataType';
import { getForScale, isHexColor } from './Utils';
import BarcodeComponent from './BarcodeComponent';
import domtoimage, { Options as DomToImageOptions } from 'dom-to-image';
import './App.scss';

declare global {
  interface Window {
    drawNewContent: (json: DataType)=>void;
    getNodeImage: ()=>void;
    ReactNativeWebView?: {
      postMessage: (message: string)=>void;
    };
  }
};

const ImgOptions: DomToImageOptions = {
  quality: 1,
  cacheBust: false,
  bgcolor: '#000000'
};

export default React.memo(function App() {
  const [structure, setStructure] = useState<DataType | undefined>();
  const [width, setWidth] = useState(document.body.clientWidth);
  const [scale, setScale] = useState(width/1200);
  const [barcode, setBarcode] = useState<false | string>(false);
  // Ref's
  const elContent = useRef<HTMLDivElement>(null);
  const elBackgroundColor = useRef<HTMLDivElement>(null);
  const elBackground = useRef<HTMLImageElement>(null);
  const elProfile = useRef<HTMLDivElement>(null);
  const elProfileImage = useRef<HTMLImageElement>(null);
  const elName = useRef<HTMLParagraphElement>(null);
  const elBarcode = useRef<HTMLDivElement>(null);
  
  useEffect(()=>{
    if (structure == undefined) return;
    // Content
    elContent.current!.style.width = `${getForScale(scale, 1200)}px`;
    elContent.current!.style.height = `${getForScale(scale, 779)}px`;
    // Background
    if (!isHexColor(structure.background)) {
      elBackground.current!.style.display = 'block';
      elBackgroundColor.current!.style.backgroundColor = '#000000';
      elBackground.current!.style.opacity = '0';
      elBackground.current!.style.width = `${getForScale(scale, 1200)}px`;
      elBackground.current!.style.height = `${getForScale(scale, 779)}px`;
      setTimeout(() => {
        elBackground.current!.style.opacity = '1';
        if (elBackground.current!.src !== structure.background) elBackground.current!.src = structure.background;
      }, 110);
    } else {
      elBackgroundColor.current!.style.backgroundColor = structure.background;
      elBackground.current!.src = 'data:image/webp;base64,UklGRiYAAABXRUJQVlA4IBoAAAAwAQCdASoBAAEAAMASJaQAA3AA/v7uqgAAAA==';
      elBackground.current!.style.display = 'none';
    }
    // Barcode
    setBarcode(structure.data.barcode);
    elBarcode.current!.style.top = `${getForScale(scale, structure.barcode.y)}px`;
    elBarcode.current!.style.left = `${getForScale(scale, structure.barcode.x)}px`;
    elBarcode.current!.style.width = `${getForScale(scale, structure.barcode.width)}px`;
    elBarcode.current!.style.height = `${getForScale(scale, structure.barcode.height)}px`;
    // Image Profile
    if (structure.image !== undefined) {
      elProfileImage.current!.style.opacity = '0';
      elProfile.current!.style.display = 'flex';
      elProfile.current!.style.top = `${getForScale(scale, structure.image.y)}px`;
      elProfile.current!.style.left = `${getForScale(scale, structure.image.x)}px`;
      elProfile.current!.style.width = `${getForScale(scale, structure.image.width)}px`;
      elProfile.current!.style.height = `${getForScale(scale, structure.image.height)}px`;
      elProfile.current!.style.borderRadius = `${getForScale(scale, structure.image.borderRadius??0)}px`;
      elProfile.current!.style.borderWidth = `${getForScale(scale, structure.image.borderWidth??0)}px`;
      elProfile.current!.style.borderColor = structure.image.borderColor??'#000000';
      setTimeout(() => {
        elProfileImage.current!.style.opacity = '1';
        if (elProfileImage.current!.src !== structure.data.image) elProfileImage.current!.src = structure.data.image;
      }, 110);
    } else {
      elProfile.current!.style.display = 'none';
      elProfileImage.current!.src = 'data:image/webp;base64,UklGRiYAAABXRUJQVlA4IBoAAAAwAQCdASoBAAEAAMASJaQAA3AA/v7uqgAAAA==';
    }
    // Name
    elName.current!.innerText = structure.data.name;
    elName.current!.style.top = `${getForScale(scale, structure.name.y)}px`;
    elName.current!.style.left = `${getForScale(scale, structure.name.x)}px`;
    elName.current!.style.width = `${getForScale(scale, structure.name.width)}px`;
    elName.current!.style.height = (structure.name.height !== undefined)? `${getForScale(scale, structure.name.height!)}px`: 'auto';
    elName.current!.style.color = structure.name.color;
    elName.current!.style.fontSize = `${getForScale(scale, structure.name.fontSize)}px`;
    elName.current!.style.fontFamily = structure.name.fontFamily??'Roboto';
    elName.current!.style.fontWeight = structure.name.fontWeight??'600';
    elName.current!.style.justifyContent = structure.name.textAlign??'flex-start';
    elName.current!.style.alignItems = structure.name.textVerticalAlign??'center';
    elName.current!.style.textShadow = `${getForScale(scale, structure.name.textShadowOffset?.width??0)}px ${getForScale(scale, structure.name.textShadowOffset?.height??0)}px ${getForScale(scale, structure.name.textShadowRadius??0)}px ${structure.name.textShadowColor??'#000000'}`;
    elName.current!.style.webkitLineClamp = String (structure.name.maxNumberLines??'unset');
  }, [structure, scale]);

  function drawNewContent(json: DataType) {
    setStructure(json);
  }

  function onResize() {
    const width = document.body.clientWidth;
    setWidth(width);
    setScale(width/1200);
  }

  function globalShowLoad(isLoad: boolean) {
    window.ReactNativeWebView?.postMessage(JSON.stringify({ isLoad }));
  }
  function globalShowError(message: string) {
    window.ReactNativeWebView?.postMessage(JSON.stringify({ error: true, message }));
  }
  function globalSendData(data: string) {
    window.ReactNativeWebView?.postMessage(data);
  }

  const getNodeImage = useCallback(async()=>{
    globalShowLoad(true);
    try {
      const width = getForScale(scale, 1200);
      const height = getForScale(scale, 779);
      const result = await domtoimage.toPng(
        document.getElementById('content') as HTMLElement,
        { ...ImgOptions, width, height }
      );
      globalShowLoad(false);
      globalSendData(result);
    } catch (error) {
      console.log(error);
      globalShowLoad(false);
      globalShowError(error as string);
    }
  }, [scale]);

  window.drawNewContent = drawNewContent;
  window.getNodeImage = getNodeImage;

  function _disableContextMenu(event: MouseEvent) {
    event.preventDefault();
  }

  useEffect(()=>{
    window.addEventListener('resize', onResize);
    document.addEventListener('contextmenu', _disableContextMenu);
    return ()=>{
      window.removeEventListener('resize', onResize);
      document.addEventListener('contextmenu', _disableContextMenu);
    };
  }, []);

  return(<div ref={elContent} id={'content'}>
      <div ref={elBackgroundColor} className={"background-color"} />
      <img ref={elBackground} className={"background"} alt={"Imagen del fondo"} />
      <div ref={elProfile} className={"profile"}>
        <img ref={elProfileImage} alt={"Imagen del perfil"} />
      </div>
      <div ref={elName} className={"name"}>Nombre del estudiante</div>
      <div ref={elBarcode} className={"barcode"}>
        {(barcode)&&<BarcodeComponent
          value={barcode}
          width={getForScale(scale, structure!.barcode.width)}
          maxWidth={getForScale(scale, structure!.barcode.width)}
          height={getForScale(scale, structure!.barcode.height)}
          lineColor={structure!.barcode?.color??'#000000'}
          background={structure!.barcode?.background??'#00000000'}
          style={{ width: '100%', height: '100%' }}
        />}
      </div>
  </div>);
});