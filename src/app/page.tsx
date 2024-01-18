import { createClient } from "@/prismicio";
import { Listing } from "@/components/Listing";
import fs from 'fs';
import path from "path";

/**
 * This component renders your homepage.
 *
 * Use Next's generateMetadata function to render page metadata.
 *
 * Use the SliceZone to render the content of the page.
 */

export default async function Index() {
  /**
   * The client queries content from the Prismic API
   */
  const client = createClient();
  const sliceSections = await client.getAllByType("slice_section",
    {
      orderings: {
        field: 'my.slice_section.uid'
      }
    });
  //const models = await readModelFiles()
  const slices = await readSlicesFiles()

  return (
    <>
      <h1 className="p-4 text-4xl font-bold text-center">Slice Library</h1>
      {
        sliceSections.map((sliceSection, index) => {
          return (
            <Listing sliceSection={sliceSection} key={index} slice={slices.filter(slice => slice.id === sliceSection.data.slices[0]?.slice_type!)[0]} />
          )
        })
      }
    </>
  );
}

const readSlicesFiles = async () => {
  const directoryPath = path.join(process.cwd(), 'src/slices');
  let slicesArray: { id: string, model: string, component: string, images: {name:string,base64:string}[] }[] = [];

  try {
    const slices = fs.readdirSync(directoryPath);
    for (const slice of slices) {
      const modelFilePath = path.join(directoryPath, slice, 'model.json');
      const componentFilePath = path.join(directoryPath, slice, 'index.tsx');
      if (fs.existsSync(modelFilePath) && fs.existsSync(componentFilePath)) {
        const slicePath = path.join(directoryPath, slice);
        const filesInSlice = fs.readdirSync(slicePath);
        const rawModelData = fs.readFileSync(modelFilePath, 'utf8');
        const jsonData = JSON.parse(rawModelData);
        const rawComponentData = fs.readFileSync(componentFilePath, 'utf8');

        // Read PNG files
        const images: {name:string,base64:string}[] = [];
        // Iterate over each file in the slice directory
        for (const file of filesInSlice) {
          const filePath = path.join(slicePath, file);

          // Check if the file is a PNG image
          if (file.endsWith('.png') && fs.existsSync(filePath)) {
            const imageBuffer = fs.readFileSync(filePath);
            const imageBase64 = imageBuffer.toString('base64');
            images.push({name:file,base64:`data:image/png;base64,${imageBase64}`});
          }
        }
        slicesArray.push({ id: jsonData.id, model: jsonData, component: rawComponentData, images: images });
      }
    }
  } catch (err) {
    console.error('Error reading files:', err);
  }

  return slicesArray;
};