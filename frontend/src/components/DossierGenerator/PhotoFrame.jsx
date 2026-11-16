import { useRef } from 'react';

const clamp = (value) => Math.min(100, Math.max(0, value));

/* Cadre photo du dossier : le cadre ne bouge pas, la photo le remplit (object-fit: cover) et se
   déplace à l'intérieur quand on la fait glisser (cadrage x, y en %, 50 = centré).
   Les boutons ne sont visibles qu'à l'écran (jamais à l'export PDF). */
function PhotoFrame({ imageUrl, x = 50, y = 50, onPan, onChoose, className = '', chooseLabel }) {
  const frameRef = useRef(null);
  const imageRef = useRef(null);
  const dragRef = useRef(null);

  function handlePointerDown(event) {
    if (event.button !== 0 || !imageUrl || !onPan) return;
    if (event.target.closest('button')) return;

    const frame = frameRef.current;
    const image = imageRef.current;
    if (!frame || !image || !image.naturalWidth) return;

    // Dimensions mesurées à l'écran (le zoom d'affichage s'applique donc aussi aux déplacements)
    const rect = frame.getBoundingClientRect();
    const scale = Math.max(rect.width / image.naturalWidth, rect.height / image.naturalHeight);

    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: x,
      originY: y,
      overflowX: image.naturalWidth * scale - rect.width,
      overflowY: image.naturalHeight * scale - rect.height,
    };

    frame.setPointerCapture(event.pointerId);
    frame.classList.add('photoFrame--dragging');
  }

  function handlePointerMove(event) {
    const drag = dragRef.current;
    if (!drag) return;

    // la photo suit le pointeur : on déplace le point de cadrage dans l'autre sens
    const nextX = drag.overflowX > 0.5 ? clamp(drag.originX - ((event.clientX - drag.startX) / drag.overflowX) * 100) : drag.originX;
    const nextY = drag.overflowY > 0.5 ? clamp(drag.originY - ((event.clientY - drag.startY) / drag.overflowY) * 100) : drag.originY;

    onPan({ x: Math.round(nextX * 10) / 10, y: Math.round(nextY * 10) / 10 });
  }

  function handlePointerEnd(event) {
    if (!dragRef.current) return;
    dragRef.current = null;
    frameRef.current.classList.remove('photoFrame--dragging');
    if (frameRef.current.hasPointerCapture(event.pointerId)) frameRef.current.releasePointerCapture(event.pointerId);
  }

  return (
    <div
      ref={frameRef}
      className={`photoFrame ${imageUrl ? '' : 'photoFrame--empty'} ${className}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
    >
      {imageUrl && (
        <img
          ref={imageRef}
          className='photoFrame_image'
          src={imageUrl}
          alt=''
          draggable={false}
          style={{ objectPosition: `${x}% ${y}%` }}
        />
      )}

      {onChoose && (
        <button type='button' className='photoFrame_choose' onClick={onChoose}>
          {chooseLabel || (imageUrl ? 'Changer la photo' : 'Choisir une photo')}
        </button>
      )}
    </div>
  );
}

export default PhotoFrame;
