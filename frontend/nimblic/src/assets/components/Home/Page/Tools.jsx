import { ChatBubbleOvalLeftEllipsisIcon, LightBulbIcon, PencilSquareIcon } from '@heroicons/react/20/solid'
import React, { useState, useEffect, useContext, useRef } from 'react';
import { ParallaxProvider, Parallax } from 'react-scroll-parallax';

import ThemeContext from '../../general/Theme/ThemeContext';

function Tools() {

    const { theme } = useContext(ThemeContext);

    const [activeIndex, setActiveIndex] = useState(1)

    const features = [
        {
            name: 'AI Assistant',
            description:
                "Got questions? Our AI chat assistant is here to provide in-depth answers based on your analyses. Specifically tuned for your analysis and with additional features.",
            icon: ChatBubbleOvalLeftEllipsisIcon,
            image: <img
                key={1}
                src={`images/tool_1_${theme}.png`}
                alt="Product screenshot"
                className={`z-[-99] transition-all fadeInUp ease-in-out w-[20rem] max-w-none md:mt-24 mt-0 rounded-xl shadow-xl ring-1 ring-gray-400/10 sm:w-[40rem] md:-ml-4 lg:-ml-0`}
                width={1500}
                height={1000}
            />
        },
        {
            name: 'Transparency for understanding',
            description:
                'Know what\'s going on behind the scenes. For every analysis performed, the app provides clear explanations and displays the underlying code.',
            icon: LightBulbIcon,
            image: <div className="flex flex-row mx-6 overflow-hidden items-center justtify-center gap-4 md:gap-12">
                <img
                    key={21}
                    src={`images/tool_2_1_${theme}.png`}
                    alt="Product screenshot"
                    className={` z-[-99] transition-all fadeInUp ease-in-out max-w-none md:mt-32 mt-0 rounded-xl shadow-xl ring-1 ring-gray-400/10 md:w-[32rem] w-[16rem] md:md:-ml-4 lg:-ml-0`}
                    width={2432}
                    height={1442}
                />
                <img
                    key={22}
                    src={`images/tool_2_2_${theme}.png`}
                    alt="Product screenshot"
                    className={`z-[-99] transition-all fadeInUp ease-in-out max-w-none md:mt-32 mt-0 rounded-xl shadow-xl ring-1 ring-gray-400/10 md:w-[32rem] w-[16rem] md:-ml-4 lg:-ml-0`}
                    width={2432}
                    height={1442}
                />
            </div>
        },
        {
            name: 'Tailored experience',
            description:
                'The ability to define your current skill level makes it possible for Nimblic to customize its content depending on your experience and level of understanding. ',
            icon: PencilSquareIcon,
            image: <img
                key={3}
                src={`images/tool_3_${theme}.png`}
                alt="Product screenshot"
                className={` z-[-99] transition-all fadeInUp ease-in-out max-w-none md:mt-40 md:mb-16 mt-20 mb-10 rounded-xl shadow-xl ring-1 ring-gray-400/10 md:w-[50rem] w-[20rem] md:-ml-4 lg:-ml-0`}
                width={2432}
                height={1442}
            />
        },
    ]

    return (
        <ParallaxProvider>
            <div className="md:pt-24 w-full flex flex-col items-center" id="tools" >
                <div className="md:max-w-7xl max-w-md flex flex-col items-center justify-center">
                    <div className="w-fit max-w-4xl lg:text-center px-6 lg:px-8">
                        <h2 className="text-base font-semibold leading-7 text-secondary">Never miss out on greatness</h2>
                        <div>
                            <h3 className="mt-2 md:text-4xl font-bold tracking-tight text-3xl font-nunito group">
                                The most powerful advanced tools
                                <a href="#tools" className="md:text-3xl text-xl ml-2 opacity-0 group-hover:opacity-100 text-neutral-content/80 no-underline hover:text-neutral-content/90">#</a>
                            </h3>
                        </div>
                        <p className="mt-6 text-lg leading-8 ">
                        With a focus on integrating a useful and modern toolset, Nimblic has got you covered, ensuring that you never miss out on the latest advancements. Our tools are designed not only to elevate your data analysis but also to provide full transparency about the underlying technology, helping you understand the results more clearly.                        </p>
                    </div>
                    <div className="px-6 md:px-10 mt-4 md:max-w-6xl w-full z-[10] bg-base-100">
                        <dl className="mt-4 max-w-xl md:space-y-0 space-y-2 leading-7 lg:max-w-none md:grid md:grid-cols-3 md:gap-4">
                            {features.map((feature, index) => (
                                <div key={feature.name} className="block">
                                    <div className={`text-[0.9em] transition-all ease-in cursor-pointer relative pr-4 pl-12 md:pl-14 py-2 md:py-4 rounded-xl ring-1 ring-transparent
${activeIndex === index + 1 ? (theme === 'light' ? 'ring-white bg-white/30 ' : 'ring-neutral bg-neutral/30') : (theme === 'light' ? ' hover:bg-white/20 hover:text-neutral-content text-neutral-content/80' : 'hover:bg-neutral/20 hover:text-neutral-content text-neutral-content/80')}`}
                                        onClick={() => setActiveIndex(index + 1)}>
                                        <dt key={feature.name} className="font-semibold">
                                            <feature.icon key={feature.name} className={`absolute left-4 top-3 md:top-4 h-5 w-5 md:h-8 md:w-8 ${activeIndex === index + 1 ? 'text-secondary' : 'text-secondary/50'}`} aria-hidden="true" />
                                            {feature.name}
                                        </dt>{' '}
                                        <dd className="hidden md:inline">{feature.description}</dd>
                                    </div>
                                </div>
                            ))}
                        </dl>
                    </div>
                    <div className="bg-base-100 h-10 w-full" />
                    <div className="bg-gradient-to-b from-base-100 w-full md:h-32 h-10" />
                    <div className="md:-mt-[300px] md:-mb-[200px] -mt-[100px] -mb-[50px] z-[-99] overflow-hidden">
                        {features.map((feature, index) => (
                            <Parallax key={index} className="block z-[-99] overflow-hidden" speed={index === 2 ? 5 : 20}>
                                {activeIndex === index + 1 && feature.image}
                            </Parallax>
                        ))}
                    </div>
                    <div className="bg-gradient-to-t from-base-100 w-full md:h-32 h-10" />
                    <div className="bg-base-100 h-20 w-full" />
                </div>
            </div>
        </ParallaxProvider>

    )
}

export default Tools
