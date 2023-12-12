import React from 'react';

/**
 * InsertionPoint component is used to render a visual cue (a line) indicating
 * where a new element will be inserted in the document.
 *
 * This component is typically used in drag-and-drop interfaces where the user
 * needs to know the drop target's position in a list or a text area.
 *
 * @param {object} position - An object containing the x and y coordinates for the insertion point.
 * @returns {JSX.Element} - A React component representing the insertion point.
 */
const InsertionPoint = ({ position }) => {
    // Destructuring the x and y coordinates from the position object
    const { x, y } = position;

    // The component renders a div styled to appear as a vertical line at the given x and y coordinates.
    return (
        <div
            className="w-px h-6 fixed top-0 left-0 bg-blue-500 duration-[0.05s]"
            style={{
                transform: `translate3d(${x}px, ${y}px, 0)`
            }}
        />
    );
};

export default InsertionPoint;
