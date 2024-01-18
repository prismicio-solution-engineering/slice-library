'use client'

import { useState } from "react";
import { AllDocumentTypes } from "../../prismicio-types";
import { components } from "@/slices";
import { SliceZone } from "@prismicio/react";

interface Window {
    showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>;
}

// Augment the Window type (can also be done in a separate .d.ts file)
declare global {
    interface Window {
        showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>;
    }
}

export function Listing({ sliceSection, slice }: { sliceSection: AllDocumentTypes, slice: { id: string, model: string, component: string, images: { name: string, base64: string }[] } }) {

    const [visibility, setVisibility] = useState(false); // Initially all sections are hidden

    // Toggle visibility when the section is clicked
    const toggleVisibility = (uid: string) => {
        setVisibility(!visibility);
    };

    const handleButtonClick = async () => {
        if (!window.showDirectoryPicker) {
            alert("Your browser does not support directory selection.");
            return;
        }

        try {
            const directoryHandle = await window.showDirectoryPicker();
            // Add your logic to handle file download and saving to the selected directory
            console.log("Directory selected:", directoryHandle);


            const indexFileHandle = await directoryHandle.getFileHandle('index.ts', { create: true });
            // Read the contents of the file
            const file = await indexFileHandle.getFile();
            let contents = await file.text();

            // Add the new line
            if (!contents.includes(slice.id)) {

                // Find the position of the last closing brace and insert the new line before it
                const insertionPoint = contents.lastIndexOf('};');
                if (insertionPoint !== -1) {
                    const newComponent = '  ' + slice.id + ': dynamic(() => import("./' + snakeToPascal(slice.id) + '")),\n';
                    contents = contents.substring(0, insertionPoint) + newComponent + contents.substring(insertionPoint);
                }
                // Write the changes back to the file
                const indexFilewritable = await indexFileHandle.createWritable();
                await indexFilewritable.write(contents);
                await indexFilewritable.close();

                // Create a new folder in the selected directory
                const newFolderHandle = await directoryHandle.getDirectoryHandle(snakeToPascal(sliceSection.data.slices[0]?.slice_type!), { create: true });

                const fileHandle = await newFolderHandle.getFileHandle('model.json', { create: true });
                const writable = await fileHandle.createWritable();
                await writable.write(JSON.stringify(slice.model));
                await writable.close();

                const componentFileHandle = await newFolderHandle.getFileHandle('index.tsx', { create: true });
                const componentWritable = await componentFileHandle.createWritable();
                await componentWritable.write(slice.component);
                await componentWritable.close();

                // Convert base64 string to a Blob
                for (let i = 0; i < slice.images.length; i++) {
                    const imageBlob = base64ToBlob(slice.images[i].base64);

                    // Create a new file and write the Blob to it
                    const imageFileHandle = await newFolderHandle.getFileHandle(slice.images[i].name, { create: true });
                    const imageWritable = await imageFileHandle.createWritable();
                    await imageWritable.write(imageBlob);
                    await imageWritable.close();
                }

            }
            else {
                alert("A slice with same name already exists in your repo")
            }

            console.log("Files written successfully");
        } catch (err) {
            console.error("Error selecting directory:", err);
        }
    };

    // Function to convert base64 to Blob
    function base64ToBlob(base64: string) {
        const binaryString = window.atob(base64.split(',')[1]);
        const bytes = new Uint8Array(binaryString.length);

        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        return new Blob([bytes], { type: 'image/png' });
    }


    return (
        <div key={sliceSection.uid} className="m-12 bg-gray-100 p-4 rounded-lg onClick={toggleVisibility}">
            <div className="flex">
                <div className="py-2 cursor-pointer grow" onClick={() => toggleVisibility(sliceSection.uid)}>
                    {sliceSection.uid}
                </div>
                <button className="font-bold p-2 rounded-md bg-gray-300 hover:bg-gray-500 hover:text-gray-200" onClick={handleButtonClick}>
                    Add to my project
                </button>
            </div>
            {visibility &&
                sliceSection.data.slices.map((sliceVariation) => {
                    return (
                        <div className="p-4 m-4 bg-gray-300 rounded-lg" key={sliceVariation.variation}>
                            <div className="py-2">
                                {"> " + sliceVariation.variation + " variation"}
                            </div>
                            <div className="p-4 m-4 rounded-lg bg-gray-500">
                                <SliceZone slices={[sliceVariation]} components={components} />
                            </div>
                        </div>
                    )
                })
            }
        </div>
    );
}

function snakeToPascal(str: string) {
    return str
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
}