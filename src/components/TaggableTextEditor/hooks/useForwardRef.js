import { useEffect, useRef } from 'react';

/**
 * Custom hook to synchronize a forwarded ref with an internal ref.
 * This hook is useful when you need to create a ref inside a component
 * but also need to respect a ref that might be passed to the component as a prop.
 *
 * @param {object | function} ref - The ref passed to the component as a prop.
 * Can be a ref object or a function.
 * @param {any} initialValue - The initial value for the internal ref.
 * @returns {object} - A React ref object synchronized with the forwarded ref.
 */
export const useForwardRef = (ref, initialValue = null) => {
    // Internal ref to keep track of the value
    const targetRef = useRef(initialValue);

    useEffect(() => {
        // Check if the external ref exists
        if (!ref) return;

        // If the external ref is a function, call it with the internal ref's current value
        if (typeof ref === 'function') {
            ref(targetRef.current);
        }
        // If the external ref is an object, synchronize its current value with the internal ref
        else if (ref) {
            ref.current = targetRef.current;
        }
    }, [ref]);

    // Return the internal ref
    return targetRef;
};
