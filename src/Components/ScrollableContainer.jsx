import React, { useRef, useEffect, useState } from 'react';
import './ScrollableContainer.css'; // Ensure you have the necessary styles

const ScrollableContainer = ({ imageUrls }) => {
    const containerRef = useRef(null);
    const boxesRef = useRef([]);
    const moveLeftButtonRef = useRef(null);
    const moveRightButtonRef = useRef(null);
    const [activeBoxIndex, setActiveBoxIndex] = useState(null);
    const [hoveredBoxIndex, setHoveredBoxIndex] = useState(null);

    useEffect(() => {
        const container = containerRef.current;
        const boxes = boxesRef.current;

        const updateActiveBox = () => {
            const containerCenter = container.offsetWidth / 1.5;
            const scrollLeft = container.scrollLeft;

            boxes.forEach((box, index) => {
                const boxCenter = box.offsetLeft + box.offsetWidth / 2 - scrollLeft;

                if (Math.abs(containerCenter - boxCenter) < box.offsetWidth / 2) {
                    setActiveBoxIndex(index);
                }
            });
        };

        const infiniteScroll = () => {
            if (container.scrollLeft + container.offsetWidth >= container.scrollWidth) {
                container.scrollLeft = 1; // Scroll back to the start
            } else if (container.scrollLeft === 0) {
                container.scrollLeft = container.scrollWidth - container.offsetWidth - 1; // Scroll to the end
            }
            updateActiveBox();
        };

        const scrollContainer = (direction) => {
            const boxWidth = boxes[0].offsetWidth;
            const scrollAmount = direction === 'left' ? -boxWidth : boxWidth;
            container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        };

        container.addEventListener('scroll', infiniteScroll);
        moveLeftButtonRef.current.addEventListener('click', () => scrollContainer('left'));
        moveRightButtonRef.current.addEventListener('click', () => scrollContainer('right'));

        // Initial active box
        updateActiveBox();

        return () => {
            container.removeEventListener('scroll', infiniteScroll);
            moveLeftButtonRef.current.removeEventListener('click', () => scrollContainer('left'));
            moveRightButtonRef.current.removeEventListener('click', () => scrollContainer('right'));
        };
    }, []);

    return (
        <div className="scroll-container">
            <button id="move-left" ref={moveLeftButtonRef}>&lt;</button>
            <div className="container" ref={containerRef}>
                {imageUrls.map((image, index) => (
                    <div
                        className="box"
                        ref={el => boxesRef.current[index] = el}
                        key={index}
                    >
                        <div
                            className={`image-wrapper ${index === activeBoxIndex && hoveredBoxIndex === null ? 'active' : ''} ${index === hoveredBoxIndex ? 'hovered' : ''}`}
                            onMouseEnter={() => setHoveredBoxIndex(index)}
                            onMouseLeave={() => setHoveredBoxIndex(null)}
                        >
                            <img src={image.url} alt={`Box ${index + 1}`} />
                            <div className="overlay">
                                <a href={image.link}>{image.text}</a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <button id="move-right" ref={moveRightButtonRef}>&gt;</button>
        </div>
    );
};

export default ScrollableContainer;
