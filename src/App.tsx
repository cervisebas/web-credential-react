import React, { createRef, useEffect, useState } from 'react';
import { DataType } from './DataType';
import { getForScale } from './Utils';
import BarcodeComponent from './BarcodeComponent';
import domtoimage, { Options as DomToImageOptions } from 'dom-to-image';
import './App.scss';

declare global {
  interface Window {
    drawNewContent: (json: DataType)=>void;
    getNodeImage: ()=>Promise<string | false>;
  }
};

const ImgOptions: DomToImageOptions = {
  width: 1200,
  height: 779,
  quality: 0.9,
  cacheBust: true,
  bgcolor: '#000000'
};

export default React.memo(function App() {
  const [structure, setStructure] = useState<DataType | undefined>();
  const [width, setWidth] = useState(document.body.clientWidth);
  const [scale, setScale] = useState(width/1200);
  const [barcode, setBarcode] = useState<false | string>(false);
  // Ref's
  const elContent = createRef<HTMLDivElement>();
  const elBackground = createRef<HTMLImageElement>();
  const elProfile = createRef<HTMLDivElement>();
  const elProfileImage = createRef<HTMLImageElement>();
  const elName = createRef<HTMLParagraphElement>();
  const elBarcode = createRef<HTMLDivElement>();
  
  useEffect(()=>{
    if (structure == undefined) return;
    // Content
    elContent.current!.style.width = `${getForScale(scale, 1200)}px`;
    elContent.current!.style.height = `${getForScale(scale, 779)}px`;
    // Background

    elBackground.current!.style.opacity = '0';
    elBackground.current!.style.width = `${getForScale(scale, 1200)}px`;
    elBackground.current!.style.height = `${getForScale(scale, 779)}px`;
    setTimeout(() => {
      elBackground.current!.style.opacity = '1';
      if (elBackground.current!.src !== structure.background) elBackground.current!.src = structure.background;
    }, 110);
    // Barcode
    setBarcode(structure.data.barcode);
    elBarcode.current!.style.top = `${getForScale(scale, structure.barcode.y)}px`;
    elBarcode.current!.style.left = `${getForScale(scale, structure.barcode.x)}px`;
    elBarcode.current!.style.width = `${getForScale(scale, structure.barcode.width)}px`;
    elBarcode.current!.style.height = `${getForScale(scale, structure.barcode.height)}px`;
    // Image Profile
    if (structure.image == undefined) elProfile.current!.style.display = 'none'; else {
        elProfileImage.current!.style.opacity = '0';
        elProfile.current!.style.display = 'block';
        elProfile.current!.style.top = `${getForScale(scale, structure.image.y)}px`;
        elProfile.current!.style.left = `${getForScale(scale, structure.image.x)}px`;
        elProfile.current!.style.width = `${getForScale(scale, structure.image.width)}px`;
        elProfile.current!.style.height = `${getForScale(scale, structure.image.height)}px`;
        if (structure.image.borderRadius == undefined) elProfile.current!.style.borderRadius = '0px'; else elProfile.current!.style.borderRadius = `${getForScale(scale, structure.image.borderRadius)}px`;
        if (structure.image.borderWidth == undefined) elProfile.current!.style.borderWidth = '0px'; else {
          elProfile.current!.style.borderWidth = `${getForScale(scale, structure.image.borderWidth)}px`;
          elProfile.current!.style.borderColor = structure.image.borderColor!;
        }
        setTimeout(() => {
          elProfileImage.current!.style.opacity = '1';
          if (elProfileImage.current!.src !== structure.data.image) elProfileImage.current!.src = structure.data.image;
        }, 110);
    }
    // Name
    elName.current!.innerText = structure.data.name;
    elName.current!.style.top = `${getForScale(scale, structure.name.y)}px`;
    elName.current!.style.left = `${getForScale(scale, structure.name.x)}px`;
    elName.current!.style.width = `${getForScale(scale, structure.name.width)}px`;
    if (structure.name.height == undefined) elName.current!.style.height = 'auto'; else elName.current!.style.height = `${getForScale(scale, structure.name.height!)}px`;
    elName.current!.style.color = structure.name.color;
    elName.current!.style.fontSize = `${getForScale(scale, structure.name.fontSize)}px`;
    if (structure.name.fontFamily == undefined) elName.current!.style.fontFamily = 'Roboto'; else elName.current!.style.fontFamily = structure.name.fontFamily;
    if (structure.name.fontWeight == undefined) elName.current!.style.fontWeight = 'normal'; else elName.current!.style.fontWeight = structure.name.fontWeight;
    if (structure.name.textAlign == undefined) elName.current!.style.textAlign = 'auto'; else elName.current!.style.textAlign = structure.name.textAlign;
    if (structure.name.textShadowOffset == undefined) (elName.current!.style as any).textShadowOffset = ''; else elName.current!.style.textShadow = `${getForScale(scale, structure.name.textShadowOffset.width)}px ${getForScale(scale, structure.name.textShadowOffset.height)}px ${getForScale(scale, structure.name.textShadowRadius!)}px ${structure.name.textShadowColor}`;
    if (structure.name.maxNumberLines == undefined) {
      elName.current!.classList.remove('limit');
      (elName.current!.style as any)['-webkit-line-clamp'] = 'unset';
    } else {
      elName.current!.classList.add('limit');
      (elName.current!.style as any)['-webkit-line-clamp'] = String(structure.name.maxNumberLines);
    }
  }, [structure, scale]);

  function drawNewContent(json: DataType) {
    setStructure(json);
  }

  function onResize() {
    const width = document.body.clientWidth;
    setWidth(width);
    setScale(width/1200);
  }
  async function getNodeImage() {
    try {
      const result = await domtoimage.toPng(document.getElementById('content') as HTMLElement, ImgOptions);
      console.log(result);
      return result;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
  function _disableContextMenu(event: MouseEvent) {
    event.preventDefault();
  }

  useEffect(()=>{
    window.drawNewContent = drawNewContent;
    window.getNodeImage = getNodeImage;
    window.addEventListener('resize', onResize);
    document.addEventListener('contextmenu', _disableContextMenu);
    return ()=>{
      console.log('UnMount');
      window.removeEventListener('resize', onResize);
      document.addEventListener('contextmenu', _disableContextMenu);
    };
  }, []);

  return(<div ref={elContent} id={'content'}>
      <img ref={elBackground} className={"background"} alt={"Imagen del fondo"} />
      <div ref={elProfile} className={"profile"}>
        <img ref={elProfileImage} alt={"Imagen del perfil"} />
      </div>
      <p ref={elName} className={"name"}>Nombre del estudiante</p>
      <div ref={elBarcode} className={"barcode"}>
        {(barcode)&&<BarcodeComponent
          value={barcode}
          width={getForScale(scale, structure!.barcode.width)}
          maxWidth={getForScale(scale, structure!.barcode.width)}
          height={getForScale(scale, structure!.barcode.height)}
          style={{ width: '100%', height: '100%' }}
        />}
      </div>
  </div>);
});