"use client";

import { useState, useRef, useEffect } from "react";
import { useDrag, useDrop } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";

const DraggableImage = ({
  id,
  src,
  index,
  moveImage,
  removeImage,
  layout,
  margin,
  scale,
  isMobile,
  handleScrollWhileDragging,
  handleDragEnd,
  paperSize,
  PAPER_SIZES,
}) => {
  const ref = useRef(null);
  const [dropPosition, setDropPosition] = useState(null);

  const [{ isDragging }, drag, preview] = useDrag({
    type: "image",
    item: { id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      if (monitor.didDrop()) {
        handleDragEnd();
      }
    },
    canDrag: !isMobile,
  });

  const [{ isOver }, drop] = useDrop({
    accept: "image",
    hover: (item, monitor) => {
      if (!ref.current || isMobile) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();

      if (!clientOffset) return;

      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      setDropPosition(hoverClientY < hoverMiddleY ? "above" : "below");

      handleScrollWhileDragging(clientOffset.y);
    },
    drop: (item, monitor) => {
      if (item.index !== index) {
        moveImage(item.index, index);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className={`relative border-b border-gray-200 transition-all duration-200 ${
        isDragging ? "opacity-40" : "opacity-100"
      } ${
        isOver && !isMobile
          ? dropPosition === "above"
            ? "border-t-4 border-t-blue-500 pt-2"
            : "border-b-4 border-b-blue-500 pb-2"
          : ""
      }`}
      style={{
        marginLeft: `${margin.left * scale}px`,
        marginRight: `${margin.right * scale}px`,
        marginTop: `${margin.top * scale}px`,
        marginBottom: `${margin.bottom * scale}px`,
        touchAction: isMobile ? "pan-y" : "none",
      }}
    >
      {isOver && !isMobile && (
        <div
          className={`absolute inset-0 pointer-events-none bg-gray-500 opacity-90 shadow-lg`}
        ></div>
      )}
      {isOver && !isMobile && (
        <div
          className={`absolute inset-0 pointer-events-none w-[80%] h-[80%] m-auto border-4 border-dashed rounded-2xl border-gray-400`}
        >
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-semibold">
            {dropPosition === "above" ? "Move here" : "Move here"}
          </div>
        </div>
      )}
      <img
        src={src}
        alt="preview"
        className="w-full object-contain pointer-events-none"
        style={{
          maxWidth: `calc(${
            PAPER_SIZES[paperSize][layout === "portrait" ? "width" : "height"]
          }px * ${scale} - ${(margin.left + margin.right) * scale}px)`,
        }}
        draggable="false"
      />
      <button
        onClick={(e) => {
          e.stopPropagation();
          removeImage(id);
        }}
        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
      >
        ×
      </button>
    </div>
  );
};

export default DraggableImage;
