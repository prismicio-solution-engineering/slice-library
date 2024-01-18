import React from 'react';
import { PrismicRichText, SliceComponentProps } from '@prismicio/react';
import { Content } from '@prismicio/client';

/**
 * Props for `TestimonialsSection`.
 */
export type TestimonialsSectionProps = SliceComponentProps<Content.TestimonialsSectionSlice>;

/**
 * Component for "TestimonialsSection" Slices.
 */
const TestimonialsSection = ({ slice }: TestimonialsSectionProps): JSX.Element => {
  const { section_title } = slice.primary;
  const testimonials = slice.items;

  return (
    <>
      {slice.variation === "default" ?
        <section className="py-20 bg-[#ffffff] text-center">
          <div className="max-w-screen-xl mx-auto px-6 md:px-12">
            <h2 className="text-3xl font-bold text-[#000000] mb-12">{section_title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {testimonials.map((testimonial, index) => (
                <div className="bg-white p-8 border border-[#171717] rounded-2xl shadow-sm mb-8 flex flex-col" key={index}>
                  <blockquote className="text-lg italic mb-4 grow">
                    <PrismicRichText
                      field={testimonial.quote}
                      components={{
                        paragraph: ({ children }) => <p className="">{children}</p>,
                      }}
                    />
                  </blockquote>
                  <div className="">
                    <div className="font-semibold text-base">{testimonial.name}</div>
                    <div className="text-[#487b94] text-sm">
                      {testimonial.position}, {testimonial.company}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        :
        <section className="py-20 bg-[#ffffff] text-center">
          <div className="max-w-screen-xl mx-auto px-6 md:px-12">
            <h2 className="text-3xl font-bold text-[#000000] mb-12">
              {slice.primary.section_title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {slice.items.map((item, index) => (
                <div key={index} className="bg-[#171717] p-8 border border-[#171717] rounded-2xl shadow-sm mb-8 flex flex-col hover:bg-opacity-90 transition duration-300">
                  <blockquote className="text-lg italic mb-4 text-white grow">
                    <PrismicRichText
                      field={item.quote}
                      components={{
                        paragraph: ({ children }) => <p className='text-white'>{children}</p>,
                        strong: ({ children }) => <strong className='font-semibold'>{children}</strong>,
                        em: ({ children }) => <em className='italic'>{children}</em>,
                      }}
                    />
                  </blockquote>
                  <div className="">
                    <div className="font-semibold text-base text-white">{item.name}</div>
                    <div className="text-[#487b94] text-sm">
                      {item.position}, {item.company}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      }
    </>
  );
};

export default TestimonialsSection;