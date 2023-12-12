import { useState, useRef } from 'react';
import { IoIosAdd } from 'react-icons/io';
import { Button } from '@material-tailwind/react';
import { useTaggableTextArea } from "./hooks/useTaggableTextArea.js";
import {TaggableTextEditor} from "./TaggableTextEditor.jsx";

// Define available tags
const tags = [
    { label: 'Website Link', id: 'websiteLink' },
    { label: 'Business Name', id: 'businessName' },
    { label: 'Address', id: 'address' }
];

/**
 * TaggableMain component provides an interface for editing text with embeddable tags.
 * It allows users to add predefined tags into the text and displays the resulting text.
 *
 * @returns {JSX.Element} - A React component for the taggable text editor interface.
 */
export const TaggableMain = () => {
    // State for storing and updating the text value
    const [value, setValue] = useState('Example {address} with text');
    // Ref for the taggable text editor element
    const promptRef = useRef(null);
    // Hook for handling tag addition and removal
    const { addTag } = useTaggableTextArea(promptRef);

    return (
        <main className="">
            <div className="flex max-w-[40rem] flex-col rounded-md bg-white text-gray-700 shadow-2xl p-8 mx-auto mt-8">
                {/* Taggable text editor component */}
                <div className="mb-8 border border-gray-400 min-h-32">
                    <TaggableTextEditor
                        ref={promptRef}
                        value={value}
                        onChange={setValue}
                        availableTags={tags}
                        className="min-h-32 p-4"
                    />

                    {/* Additional content or instructions */}
                    <div className="bg-gray-50 border-t border-gray-400 px-4 py-3">
                        Listen to your voice greeting as your customers will during working hours
                    </div>
                </div>

                {/* Buttons for adding tags */}
                <h2 className="text-xl font-semibold mb-4">Required Short Codes</h2>
                <div className="flex gap-2">
                    {tags.map((tag) => (
                        <Button
                            key={tag.id}
                            variant="outlined"
                            color="blue"
                            disabled={value.includes(`{${tag.id}}`)}
                            className="flex items-center gap-2 rounded-xl py-1 px-4"
                            onClick={() => addTag(tag)}
                        >
                            {tag.label}
                            <IoIosAdd className="w-6 h-6" />
                        </Button>
                    ))}
                </div>

                {/* Displaying the current text value */}
                <h3 className="text-xl font-semibold mb-4 mt-8">Result</h3>
                <div className="mt-2">
                    <pre className="whitespace-pre-wrap break-words">{value}</pre>
                </div>
            </div>
        </main>
    );
}
