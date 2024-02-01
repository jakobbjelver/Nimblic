import { BookOpenIcon, DocumentChartBarIcon, BoltIcon, LightBulbIcon } from '@heroicons/react/20/solid'
import React, { useState, useEffect, useContext, useRef } from 'react';
import { ParallaxProvider, Parallax } from 'react-scroll-parallax';

import ThemeContext from '../../general/Theme/ThemeContext';

const features = [
  {
    name: 'Intuitive Dashboard.',
    description:
      'Dive into our dynamic Explore page, where data visualization and analysis are made simple. Tailored for a wide variety of use cases, get the insights you need without any configuration.',
    icon: BoltIcon,
  },
  {
    name: 'Detailed Statistical Analyses.',
    description: 'Access a comprehensive overview of your datasets, from basic descriptive statistics to more advanced inferential statistics, eliminating the need to make time-consuming and skill-required decisions. Just drag, drop and explore!',
    icon: DocumentChartBarIcon,
  },
  {
    name: 'Ensuring Excellence in Data Integrity.',
    description: 'Assess the key quality measures with an interactive overview of the crucial aspects that ensures that the foundation of your analysis is solid. Everything from data type consistency to sophisticated natural language detection.',
    icon: BookOpenIcon,
  },
  {
    name: 'Transparent Learning and Understanding.',
    description: 'Experience an unprecedented level of transparency and learning. For every analysis performed, the app provides clear explanations and displays the underlying code.',
    icon: LightBulbIcon,
  },
]


function Feature() {

  const { theme } = useContext(ThemeContext);

  const [activeIndex, setActiveIndex] = useState(1)

  return (
    <ParallaxProvider>

      <div className="overflow-hidden bg-base-100 md:mt-32 mt-16 md:py-16 fadeInUp" id="features">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 md:gap-y-16 gap-y-6 lg:mx-0 lg:max-w-none lg:grid-cols-2">
            <div className="lg:pr-8 lg:pt-4 bg-scroll">
              <div className="lg:max-w-lg">
                <h2 className="text-base font-semibold leading-7 text-secondary">Get started faster</h2>
                <div>
                  <h3 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl font-nunito group">Smooth insights
                    <a href="#features" className="md:text-3xl text-xl ml-2 opacity-0 group-hover:opacity-100 text-neutral-content/80 no-underline hover:text-neutral-content/90">#</a>
                  </h3>
                </div>
                <p className="mt-6 text-lg leading-8">
                  Dive into a platform where advanced data analysis methodologies are accessible through a user-friendly interface. Experience the synergy of technology and usability.
                </p>
                <p className="mt-2 text-lg leading-8">
                  Best of all, it's as simple as dragging and dropping your data file and letting the app do the rest!
                </p>
                <dl className="mt-4 max-w-xl md:space-y-6 space-y-2 leading-7 lg:max-w-none">
                  {/* Scrollable row for small screens */}
                  <div className="overflow-x-auto scroll-m-0">
                    <div className="flex md:hidden py-2 space-x-2 w-max">

                      {features.map((feature, index) => (
                        <div key={feature.name} className={`text-[0.9em] transition-all ease-in cursor-pointer relative pr-4 pl-12 py-2 rounded-xl ring-1 ring-transparent
        ${activeIndex === index + 1 ? (theme === 'light' ? 'ring-white bg-white/30 ' : 'ring-neutral bg-neutral/30') : (theme === 'light' ? ' bg-white/30 hover:text-neutral-content text-neutral-content/80' : 'hover:bg-neutral/20 hover:text-neutral-content text-neutral-content/80')}`}
                          onClick={() => setActiveIndex(index + 1)}>
                          <dt key={feature.name} className="font-semibold">
                            <feature.icon key={feature.name} className={`absolute left-4 top-3 h-5 w-5 ${activeIndex === index + 1 ? 'text-secondary' : 'text-secondary/50'}`} aria-hidden="true" />
                            {feature.name}
                          </dt>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Static descriptions for small screens */}
                  {features.map((feature, index) => (
                    <dd key={feature.name} className={`md:hidden px-2 text-sm pt-2 h-fit ${activeIndex === index + 1 ? 'block' : 'hidden'}`}>{feature.description}</dd>
                  ))}

                  {/* Original layout for screens larger than 'small' */}
                  {features.map((feature, index) => (
                    <div key={feature.name} className="hidden md:block">
                      <div className={`text-[0.9em] transition-all ease-in cursor-pointer relative pr-4 pl-12 py-2 rounded-xl ring-1 ring-transparent
        ${activeIndex === index + 1 ? (theme === 'light' ? 'ring-white bg-white/30 ' : 'ring-neutral bg-neutral/30') : (theme === 'light' ? ' hover:bg-white/20 hover:text-neutral-content text-neutral-content/80' : 'hover:bg-neutral/20 hover:text-neutral-content text-neutral-content/80')}`}
                        onClick={() => setActiveIndex(index + 1)}>
                        <dt key={feature.name} className="inline font-semibold">
                          <feature.icon key={feature.name} className={`absolute left-4 top-3 h-5 w-5 ${activeIndex === index + 1 ? 'text-secondary' : 'text-secondary/50'}`} aria-hidden="true" />
                          {feature.name}
                        </dt>{' '}
                        <dd className="hidden md:inline">{feature.description}</dd>
                      </div>
                      <dd className={`px-2 ${activeIndex === index + 1 ? 'flex sm:hidden' : 'hidden md:hidden'}`}>{feature.description}</dd>
                    </div>
                  ))}
                </dl>


              </div>
            </div>
            <div className="md:block mt-32 hidden">
              {features.map((feature, index) => (
                <Parallax key={index} className="md:block hidden" speed={-30}>
                  <img
                    key={index}
                    src={`images/feature_${index + 1}_${theme}.png`}
                    alt="Product screenshot"
                    className={`${activeIndex === index + 1 ? 'inline' : 'hidden'} transition-all fadeInUp ease-in-out w-[48rem] max-w-none md:mt-32 mt-0 rounded-xl shadow-xl ring-1 ring-gray-400/10 sm:w-[57rem] md:-ml-4 lg:-ml-0`}
                    width={2432}
                    height={1442}
                  />
                </Parallax>
              ))}
            </div>
            <div className="md:hidden block">
              {features.map((feature, index) => (
                <Parallax key={index} translateX={['50px', '-130px']} className="block md:hidden">
                  <img
                    src={`images/feature_${index + 1}_${theme}.png`}
                    alt="Product screenshot"
                    className={`${activeIndex === index + 1 ? 'inline' : 'hidden'} fadeInUp w-[48rem] max-w-none md:mt-32 mt-0 rounded-xl shadow-xl ring-1 ring-gray-400/10 sm:w-[57rem] md:-ml-4 lg:-ml-0`}
                    width={2432}
                    height={1442}
                  />
                </Parallax>
              ))}
            </div>
          </div>
        </div>
        <div className={`md:block hidden bottom-0 h-20 bg-gradient-to-t from-base-100 w-full z-[99999]`}></div>
      </div>

    </ParallaxProvider>

  )
}

export default Feature;
