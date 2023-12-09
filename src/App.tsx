import { useState, useRef } from 'react';

import { IoIosAdd } from 'react-icons/io';

import { Button } from '@material-tailwind/react';

import TaggableTextArea, {
  useTaggableTextArea
} from './components/TaggableTextArea';

const tags = [
  { label: 'Website Link', id: 'websiteLink' },
  { label: 'Business Name', id: 'businessName' },
  { label: 'Address', id: 'address' }
];

function App() {
  const [value, setValue] = useState<string>('Example {address} with text');

  const promptRef = useRef<HTMLDivElement>(null);

  const { addTag } = useTaggableTextArea(promptRef);

  return (
    <main className="">
      <div className="flex max-w-[40rem] flex-col rounded-md bg-white text-gray-700 shadow-2xl p-8 mx-auto mt-8">
        <div className="mb-8 border border-gray-400">
          <TaggableTextArea
            ref={promptRef}
            value={value}
            onChange={setValue}
            availableTags={tags}
            className="h-32 p-4"
          />

          <div className="bg-gray-50 border-t border-gray-400 px-4 py-3">
            Listen to your voice greeting as your customers will during working
            hours
          </div>
        </div>

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

        <h3 className="text-xl font-semibold mb-4 mt-8">Result</h3>
        <div className="mt-2">
          <pre>{value}</pre>
        </div>
      </div>
    </main>
  );
}

export default App;
